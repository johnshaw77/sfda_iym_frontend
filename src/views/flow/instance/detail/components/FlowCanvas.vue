<!-- 流程圖畫布除了檔案節點外，其他節點不可拖動 -->
<template>
  <div
    class="h-full bg-white rounded-lg shadow-lg overflow-hidden flex"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    :class="{ 'is-dragover': isDragOver, 'css-fullscreen': isFullscreen }"
    ref="flowCanvasRef">
    <div class="flex-1">
      <VueFlow
        v-model="elements"
        class="h-full"
        :default-zoom="1.5"
        :min-zoom="0.2"
        :max-zoom="4"
        :node-types="nodeTypes"
        :edge-types="edgeTypes"
        :default-edge-options="defaultEdgeOptions"
        :auto-connect="false"
        :select-nodes-on-drag="false"
        :snap-to-grid="true"
        :snap-grid="[20, 20]"
        :connection-mode="ConnectionMode.Loose"
        :elevate-edges-on-select="true"
        :fit-view-on-init="false"
        :prevent-scrolling="true"
        :enable-pan-over-edges="true"
        :nodes-draggable="false"
        @nodeClick="onNodeClick"
        @connect="onConnect"
        @paneClick="onPaneClick"
        @nodeDragStart="onNodeDragStart"
        @nodeDragStop="onNodeDragStop"
        @nodesChange="onNodesChange"
        @nodes-initialized="() => {}">
        <Background
          pattern="dots"
          :gap="20"
          :size="1" />

        <Controls />
        <MiniMap
          :pannable="true"
          :zoomable="true" />
        <Panel
          position="top-right"
          class="bg-white p-2 rounded shadow-md">
          <div class="flex flex-wrap gap-2">
            <!-- 模擬慢速上傳開關 (僅開發環境顯示) -->
            <el-tooltip
              v-if="isDevelopment"
              :content="
                simulateSlowUpload ? '關閉模擬慢速上傳' : '開啟模擬慢速上傳'
              "
              placement="top"
              effect="light">
              <el-button
                size="small"
                :type="simulateSlowUpload ? 'success' : 'info'"
                @click="toggleSimulateSlowUpload">
                <component
                  :is="Upload"
                  :size="16"
                  :stroke-width="1.5"
                  class="mr-1" />
                {{ simulateSlowUpload ? "慢速" : "正常" }}
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="添加便利貼"
              placement="top"
              effect="light">
              <el-button
                size="small"
                @click="() => handleAddNode('sticky')">
                <component
                  :is="StickyNoteIcon"
                  :size="16"
                  :stroke-width="1.5"
                  class="mr-1" />
                便利貼
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="自動排列節點"
              placement="top"
              effect="light">
              <el-button
                size="small"
                @click="autoLayout">
                <component
                  :is="Layout"
                  :size="16"
                  :stroke-width="1.5"
                  class="mr-1" />
                自動布局
              </el-button>
            </el-tooltip>

            <el-tooltip
              content="查看工作流 JSON 數據"
              placement="top"
              effect="light">
              <el-button
                size="small"
                @click="showJsonDrawer = true">
                <component
                  :is="FileJson"
                  :size="16"
                  :stroke-width="1.5"
                  class="mr-1" />
                查看JSON
              </el-button>
            </el-tooltip>
            <el-tooltip
              :content="
                isFullscreen
                  ? `退出全屏 (${ctrlOrCmd}${shiftSymbol}F)`
                  : `全屏 (${ctrlOrCmd}${shiftSymbol}F)`
              "
              placement="top"
              effect="light">
              <el-button
                size="small"
                type="primary"
                plain
                @click="handleToggleFullscreen">
                <component
                  :is="isFullscreen ? Minimize2 : Maximize2"
                  :size="16"
                  :stroke-width="1.5"
                  class="mr-1" />
                {{ isFullscreen ? "退出全屏" : "全屏" }}
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="適應工作區大小"
              placement="top"
              effect="light">
              <el-button
                size="small"
                @click="handleFitView">
                <component
                  :is="Maximize"
                  :size="16"
                  :stroke-width="1.5"
                  class="mr-1" />
                適應工作區
              </el-button>
            </el-tooltip>
            <el-tooltip
              :content="`撤銷 (${ctrlOrCmd}Z)`"
              placement="top"
              effect="light">
              <el-button
                size="small"
                @click="handleUndo">
                <component
                  :is="Undo2"
                  :size="16"
                  :stroke-width="1.5"
                  class="mr-1" />
                撤銷
              </el-button>
            </el-tooltip>
            <el-tooltip
              :content="`重做 (${ctrlOrCmd}${shiftSymbol}Z)`"
              placement="top"
              effect="light">
              <el-button
                size="small"
                @click="handleRedo">
                <component
                  :is="Redo2"
                  :size="16"
                  :stroke-width="1.5"
                  class="mr-1" />
                重做
              </el-button>
            </el-tooltip>
          </div>
        </Panel>

        <!-- JSON 查看抽屜 -->
        <el-drawer
          v-model="showJsonDrawer"
          title="工作流 JSON 數據"
          direction="rtl"
          size="50%">
          <template #header>
            <div class="flex items-center justify-between w-full pr-4">
              <span>工作流 JSON 數據</span>
              <div class="flex items-center space-x-2">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleCopyJson">
                  <component
                    :is="Copy"
                    :size="16"
                    :stroke-width="1.5"
                    class="mr-1" />
                  複製
                </el-button>
              </div>
            </div>
          </template>
          <div class="p-4">
            <JsonViewer
              :jsonData="elements"
              :expand-depth="2"
              :expand-on-click="true" />
          </div>
        </el-drawer>
      </VueFlow>
    </div>
  </div>
</template>

<script setup>
//#region import
import { VueFlow, useVueFlow, Panel, ConnectionMode } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import { Controls } from "@vue-flow/controls";
import dagre from "@dagrejs/dagre"; // 自動布局
import StickyNote from "@/components/flow-nodes/base/StickyNote.vue";
import FileNode from "@/components/flow-nodes/base/FileNode.vue";

import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";

// 引入 API
import { uploadDocument } from "@/api/modules/flowDocument";
import { updateFlowInstance } from "@/api/modules/flow";

// 引入 composable
import { useWorkflowManager } from "@/composables/useWorkflowManager";
import { useFlowNodeComponents } from "@/composables/useFlowNodeComponents";
import { useFileNode } from "@/composables/flow/useFileNode";
import { logger } from "@/utils/logger";
import { globalEventBus, NodeEventType } from "@/utils/eventBus";

//import FlowTaskList from "./FlowTaskList.vue";
import { useFullscreen } from "@vueuse/core";
import JsonViewer from "@/components/JsonViewer.vue";
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Maximize2,
  Minimize2,
  Copy,
  StickyNote as StickyNoteIcon,
  Upload,
} from "lucide-vue-next";
//#endregion

// 開發環境標誌
const isDevelopment = process.env.NODE_ENV === "development";
// 模擬慢速上傳控制
const simulateSlowUpload = ref(
  localStorage.getItem("simulateSlowUpload") !== "false"
);

// 切換模擬慢速上傳
const toggleSimulateSlowUpload = () => {
  simulateSlowUpload.value = !simulateSlowUpload.value;
  localStorage.setItem("simulateSlowUpload", simulateSlowUpload.value);
  ElMessage.info(`模擬慢速上傳已${simulateSlowUpload.value ? "開啟" : "關閉"}`);
};

const props = defineProps({
  // 工作流實例
  flowInstance: {
    type: Object,
    required: true,
  },
});

// 註冊自定義節點類型
const nodeTypes = {
  sticky: StickyNote,
  file: FileNode,
};

// 註冊自定義節點類型(!TODO: 改, 要視載入的節點而定)
const { flowNodeComponents, loadFlowNodeComponents } = useFlowNodeComponents();

loadFlowNodeComponents();

Object.entries(flowNodeComponents.value).forEach(([key, value]) => {
  const componentName = key
    .replace("/src/components/flow-nodes/business/", "")
    .replace(".vue", "");

  // 創建一個包裝組件，處理 nodeSizeChange 事件
  const WrappedComponent = {
    components: { OriginalComponent: value.default || value },
    template: `
      <OriginalComponent 
        v-bind="$attrs" 
        @nodeSizeChange="handleNodeSizeChange" 
      />
    `,
    methods: {
      handleNodeSizeChange(data) {
        // 調用父組件的 handleNodeSizeChange 方法
        handleNodeSizeChange(data);
      },
    },
  };

  nodeTypes[componentName] = WrappedComponent;
});

// 註冊自定義邊線類型(!TODO: 改)
const edgeTypes = {
  button: "smoothstep",
  custom: "smoothstep",
};

// 設置默認的連接線選項
const defaultEdgeOptions = {
  type: "button",
  animated: true,
  label: "",
  markerEnd: {
    type: "arrowclosed",
    color: "#3f3f3f",
  },
  updatable: true,
  deletable: true,
  style: {
    strokeWidth: 2,
    stroke: "#3f3f3f",
  },
};

const { project, fitView, nodes, addNodes } = useVueFlow({
  defaultEdgeOptions,
  edgesUpdatable: false,
  edgesDraggable: false,
  edgesFocusable: false,
  selectNodesOnDrag: false,
  elevateEdgesOnSelect: false,
});
const selectedNode = ref(null);

// 定義 elements 變數, 用於保存節點和連線
const elements = ref([]);

// 使用工作流管理器
const workflowManager = useWorkflowManager();

// 定義 showJsonDrawer 變數
const showJsonDrawer = ref(false);

// 修改歷史記錄系統
const history = ref({
  past: [],
  future: [],
  isRecording: true, // 用於控制是否記錄歷史
});

// 定義操作類型
const ActionTypes = {
  NODE_MOVED: "NODE_MOVED",
  NODE_ADDED: "NODE_ADDED",
  NODE_REMOVED: "NODE_REMOVED",
  EDGE_ADDED: "EDGE_ADDED",
  EDGE_REMOVED: "EDGE_REMOVED",
  EDGE_UPDATED: "EDGE_UPDATED",
  LAYOUT_CHANGED: "LAYOUT_CHANGED",
  MULTIPLE_CHANGES: "MULTIPLE_CHANGES",
};

// 記錄單個操作
const recordAction = (type, data) => {
  if (!history.value.isRecording) return;

  const action = {
    type,
    data,
    timestamp: Date.now(),
  };

  history.value.past.push(action);
  history.value.future = [];
};

// 保存拖動開始時的節點位置
const dragStartPosition = ref(null);

// 節點開始拖動時記錄原始位置
const onNodeDragStart = (event) => {
  const { node } = event;

  // 檢查節點是否可拖動
  if (!node.draggable) {
    console.log("節點不可拖動", node);
    return; // 如果節點不可拖動，則不處理
  }

  dragStartPosition.value = {
    nodeId: node.id,
    type: node.type,
    ...node.position,
  };
};

// 節點拖動結束時記錄位置變化
const onNodeDragStop = (event) => {
  const { node } = event;

  // 檢查節點是否可拖動
  if (!node.draggable) {
    return; // 如果節點不可拖動，則不處理
  }

  if (dragStartPosition.value) {
    recordAction(ActionTypes.NODE_MOVED, {
      id: node.id,
      oldPosition: {
        x: dragStartPosition.value.x,
        y: dragStartPosition.value.y,
      },
      newPosition: { ...node.position },
    });

    // 節點拖動後更新流程實例
    updateFlowInstanceState();

    // 重置拖動位置
    dragStartPosition.value = null;
  }
};

// 更新流程實例狀態的共用函數
const updateFlowInstanceState = async () => {
  try {
    // 準備要更新的數據
    const updatedNodes = elements.value.filter((el) => !el.source);
    const updatedEdges = elements.value.filter((el) => el.source);

    console.log("updatedNodes", updatedNodes);
    console.log("updatedEdges", updatedEdges);

    // 檢查是否只有檔案節點或便利貼節點的位置變更
    const isOnlyPositionUpdate =
      dragStartPosition.value &&
      updatedNodes.some(
        (node) =>
          node.id === dragStartPosition.value.nodeId &&
          (node.type === "file" || node.type === "sticky")
      );

    // 調用 API 更新流程實例
    const updateData = {
      nodes: updatedNodes,
      edges: updatedEdges,
    };

    // 如果只是檔案節點或便利貼節點的位置變更，添加 nodeData 屬性使其被視為數據更新
    if (isOnlyPositionUpdate) {
      // 找到被移動的節點
      const movedNode = updatedNodes.find(
        (node) => node.id === dragStartPosition.value.nodeId
      );
      if (movedNode) {
        // 將節點位置信息添加到 nodeData 中，使 API 將其視為數據更新而非結構更新
        return saveNodeAsDataUpdate(movedNode.id, movedNode, true);
      }
    }

    // 如果不是位置更新，則進行普通的結構更新
    await updateFlowInstance(props.flowInstance.id, updateData);

    // 無需顯示提示，因為會打擾用戶體驗
    console.log(
      "流程實例已更新",
      isOnlyPositionUpdate ? "（僅位置更新）" : "（結構更新）"
    );
  } catch (error) {
    console.error("更新流程實例失敗", error);
    ElMessage.warning("節點位置變更無法保存：" + (error.message || "未知錯誤"));
  }
};

// 將節點保存為數據更新而非結構更新
const saveNodeAsDataUpdate = async (nodeId, node, isPositionUpdate = false) => {
  try {
    const updatedNodes = elements.value.filter((el) => !el.source);
    const updatedEdges = elements.value.filter((el) => el.source);

    // 創建更新數據對象
    const updateData = {
      nodes: updatedNodes,
      edges: updatedEdges,
      // 將節點添加到 nodeData 中，使其被視為數據更新而非結構更新
      nodeData: {
        [nodeId]: isPositionUpdate
          ? {
              // 如果是位置更新，只保存位置信息
              position: node.position,
              type: node.type,
              isPositionUpdate: true,
            }
          : {
              // 如果是新節點，保存完整信息
              ...(node.data || {}),
              position: node.position,
              type: node.type,
              isNewNode: true,
            },
      },
    };

    // 直接調用 API
    await updateFlowInstance(props.flowInstance.id, updateData);

    if (isPositionUpdate) {
      console.log(`${node.type} 節點位置已更新（數據更新）`);
    } else {
      console.log(`${node.type} 節點已添加（數據更新）`);
    }

    return true;
  } catch (error) {
    const action = isPositionUpdate ? "更新位置" : "添加";
    console.error(`${action} ${node.type} 節點失敗`, error);
    ElMessage.warning(
      `${node.type} ${action}失敗：${error.message || "未知錯誤"}`
    );
    return false;
  }
};

// 連接處理函數
const onConnect = () => {
  // 禁用添加新連接線
  ElMessage.warning("當前模式下不允許添加新連接線");
  return;
};

// 複製 JSON 到剪貼簿
const handleCopyJson = () => {
  try {
    const jsonString = JSON.stringify(elements.value, null, 2);
    navigator.clipboard.writeText(jsonString);
    ElMessage.success("已複製到剪貼簿");
  } catch (error) {
    console.error("複製失敗:", error);
    ElMessage.error("複製失敗");
  }
};

// 修改適應工作區功能
const handleFitView = () => {
  setTimeout(() => {
    fitView({ padding: 0.2 });
  }, 100);
};

// 修改撤銷功能
const handleUndo = () => {
  if (history.value.past.length === 0) return;

  const action = history.value.past.pop();
  history.value.isRecording = false;

  try {
    switch (action.type) {
      case ActionTypes.NODE_MOVED:
        const nodeToMove = elements.value.find(
          (el) => el.id === action.data.id
        );
        if (nodeToMove) {
          nodeToMove.position = { ...action.data.oldPosition };
          elements.value = [...elements.value];
        }
        break;
      case ActionTypes.NODE_ADDED:
        // 移除新增的節點
        elements.value = action.data.elements;
        break;
      case ActionTypes.NODE_REMOVED:
        // 恢復被刪除的節點
        elements.value = [...elements.value, action.data.node];
        break;
      case ActionTypes.EDGE_ADDED:
        // 移除新增的連線
        elements.value = elements.value.filter(
          (el) => el.id !== action.data.edge.id
        );
        break;
      case ActionTypes.EDGE_REMOVED:
        // 恢復被刪除的連線
        elements.value = [...elements.value, action.data.edge];
        break;
      case ActionTypes.EDGE_UPDATED:
        // 恢復連線的原始狀態
        const edgeToRestore = elements.value.find(
          (el) => el.id === action.data.oldEdge.id
        );
        if (edgeToRestore) {
          const index = elements.value.indexOf(edgeToRestore);
          elements.value.splice(index, 1, action.data.oldEdge);
          elements.value = [...elements.value];
        }
        break;
      case ActionTypes.LAYOUT_CHANGED:
        elements.value = action.data.oldElements;
        break;
    }

    history.value.future.push(action);
  } finally {
    history.value.isRecording = true;

    // 撤銷操作後更新流程實例
    updateFlowInstanceState();
  }
};

// 修改重做功能
const handleRedo = () => {
  if (history.value.future.length === 0) return;

  const action = history.value.future.pop();
  history.value.isRecording = false;

  try {
    switch (action.type) {
      case ActionTypes.NODE_MOVED:
        const nodeToMove = elements.value.find(
          (el) => el.id === action.data.id
        );
        if (nodeToMove) {
          nodeToMove.position = { ...action.data.newPosition };
          elements.value = [...elements.value];
        }
        break;
      case ActionTypes.NODE_ADDED:
        // 重新添加節點
        elements.value = [...elements.value, action.data.node];
        break;
      case ActionTypes.NODE_REMOVED:
        // 重新刪除節點
        elements.value = elements.value.filter(
          (el) => el.id !== action.data.node.id
        );
        break;
      case ActionTypes.EDGE_ADDED:
        // 重新添加連線
        elements.value = [...elements.value, action.data.edge];
        break;
      case ActionTypes.EDGE_REMOVED:
        // 重新刪除連線
        elements.value = elements.value.filter(
          (el) => el.id !== action.data.edge.id
        );
        break;
      case ActionTypes.EDGE_UPDATED:
        // 重新應用連線的更新
        const edgeToUpdate = elements.value.find(
          (el) => el.id === action.data.newEdge.id
        );
        if (edgeToUpdate) {
          const index = elements.value.indexOf(edgeToUpdate);
          elements.value.splice(index, 1, action.data.newEdge);
          elements.value = [...elements.value];
        }
        break;
      case ActionTypes.LAYOUT_CHANGED:
        elements.value = action.data.newElements;
        break;
    }

    history.value.past.push(action);
  } finally {
    history.value.isRecording = true;

    // 重做操作後更新流程實例
    updateFlowInstanceState();
  }
};

// 添加鍵盤快捷鍵
const handleKeyDown = (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "z") {
    if (event.shiftKey) {
      handleRedo();
    } else {
      handleUndo();
    }
    event.preventDefault();
  }

  // 全屏快捷鍵 - Ctrl+Shift+F
  if (
    (event.metaKey || event.ctrlKey) &&
    event.shiftKey &&
    event.key.toLowerCase() === "f"
  ) {
    event.preventDefault();
    handleToggleFullscreen();
  }
};

// 初始化
onMounted(() => {
  logger.info("FlowCanvas", "初始化流程畫布");

  // 初始化工作流管理器
  // 確保 workflowManager 已經正確初始化
  if (typeof workflowManager.setupNodeStateListeners === "function") {
    logger.info("FlowCanvas", "設置工作流管理器節點狀態監聽器");
    workflowManager.setupNodeStateListeners();
  } else {
    logger.warn(
      "FlowCanvas",
      "workflowManager.setupNodeStateListeners 不是一個函數，可能需要更新 useWorkflowManager.js"
    );
  }

  // 監聽節點狀態變更事件
  logger.info("FlowCanvas", "添加節點狀態變更事件監聽器");
  globalEventBus.on(NodeEventType.STATE_CHANGE, handleNodeStateChange);

  // 監聽節點大小變更事件
  logger.info("FlowCanvas", "添加節點大小變更事件監聽器");
  globalEventBus.on(NodeEventType.SIZE_CHANGE, handleNodeSizeChange);

  // 初始化元素
  initializeElements();

  // 適應視圖
  setTimeout(() => {
    fitView({ padding: 0.2 });
    logger.info("FlowCanvas", "已適應視圖大小");
  }, 100);
});

// 清理
onUnmounted(() => {
  // 移除事件監聽器
  globalEventBus.off(NodeEventType.STATE_CHANGE, handleNodeStateChange);
  globalEventBus.off(NodeEventType.SIZE_CHANGE, handleNodeSizeChange);
});

// 拖放相關(檔案拖放上傳)
const isDragOver = ref(false);
// 添加一個標誌變數，用於防止重複處理拖放事件
const isProcessingDrop = ref(false);

// 使用 useFileNode 中的功能
const { isFileTypeAllowed, handleFileDrop } = useFileNode();

const handleDragOver = (event) => {
  // 阻止事件冒泡，確保事件不會被重複處理
  event.stopPropagation();

  isDragOver.value = true;
  // 只接受檔案拖放
  if (event.dataTransfer.types.includes("Files")) {
    event.dataTransfer.dropEffect = "copy";
  }
};

const handleDragLeave = (event) => {
  // 阻止事件冒泡，確保事件不會被重複處理
  event.stopPropagation();

  isDragOver.value = false;
};

// 處理檔案拖放
const handleDrop = async (event) => {
  // 阻止事件冒泡，確保事件不會被重複處理
  event.stopPropagation();

  // 如果已經在處理拖放事件，則直接返回
  if (isProcessingDrop.value) {
    console.log("已經在處理拖放事件，跳過重複處理");
    return;
  }

  // 設置標誌，表示正在處理拖放事件
  isProcessingDrop.value = true;
  isDragOver.value = false;

  // 獲取滑鼠在畫布上的位置
  const bounds = event.currentTarget.getBoundingClientRect();
  const position = project({
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  });

  try {
    // 獲取拖放的檔案
    const files = Array.from(event.dataTransfer.files);

    // 檢查檔案類型
    const invalidFiles = files.filter((file) => !isFileTypeAllowed(file));
    if (invalidFiles.length > 0) {
      ElMessage.error(
        `不支援的檔案類型：${invalidFiles.map((f) => f.name).join(", ")}`
      );
      isProcessingDrop.value = false;
      return;
    }

    // 處理每個檔案
    for (const file of files) {
      try {
        // 創建臨時節點 ID
        const nodeId = `file-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // 創建臨時節點數據
        const tempNodeData = {
          id: nodeId,
          type: "file",
          position,
          draggable: true,
          data: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadProgress: 0,
          },
        };

        // 添加臨時節點到畫布
        addNodes([tempNodeData]);

        // 確保節點被添加到 elements 陣列中
        if (!elements.value.some((el) => el.id === nodeId)) {
          elements.value = [...elements.value, tempNodeData];
        }

        // 創建一個監聽器，用於更新節點的上傳進度
        const updateNodeProgress = (progress) => {
          const node = nodes.value.find((n) => n.id === nodeId);
          if (node) {
            node.data = { ...node.data, uploadProgress: progress };
          }
        };

        // 監聽 uploadProgress 的變化
        const { uploadProgress, uploadFile } = useFileNode();

        // 創建一個監視器，用於監視上傳進度的變化
        const unwatch = watch(uploadProgress, (newProgress) => {
          updateNodeProgress(newProgress);
        });

        // 上傳檔案
        const result = await uploadFile(
          file,
          props.flowInstance.projectId,
          props.flowInstance.id
        );

        // 停止監視上傳進度
        unwatch();

        // 更新節點資訊
        const node = nodes.value.find((n) => n.id === nodeId);
        if (node) {
          node.data = {
            ...node.data,
            fileId: result.data.id,
            fileUrl: result.data.url,
            fileName: result.data.name,
            uploadProgress: 100,
          };
        }

        // 將更新後的節點保存到流程實例中
        try {
          // 準備要更新的數據
          const updatedNodes = elements.value.filter((el) => !el.source);
          const updatedEdges = elements.value.filter((el) => el.source);

          // 創建更新數據對象
          const updateData = {
            nodes: updatedNodes,
            edges: updatedEdges,
            // 將檔案節點添加到 nodeData 中，使其被視為數據更新而非結構更新
            nodeData: {
              [nodeId]: {
                fileId: result.data.id,
                fileUrl: result.data.url,
                fileName: result.data.name,
                position: node.position,
                type: "file",
                isNewFileNode: true, // 標記為新上傳的檔案節點
              },
            },
          };

          // 直接調用 API 而不是使用 updateFlowInstanceState
          await updateFlowInstance(props.flowInstance.id, updateData);

          ElMessage.success(
            `檔案 ${result.data.name} 上傳並保存到流程實例成功`
          );
        } catch (updateError) {
          console.error("保存流程實例失敗", updateError);
          ElMessage.warning(
            `檔案已上傳，但保存到流程實例失敗：${
              updateError.message || "未知錯誤"
            }`
          );
        }
      } catch (error) {
        console.error("檔案處理失敗", error);
        ElMessage.error(
          `檔案 ${file.name} 上傳失敗：${error.message || "未知錯誤"}`
        );
      }
    }
  } catch (error) {
    console.error("檔案處理失敗", error);
    ElMessage.error(`檔案處理失敗：${error.message || "未知錯誤"}`);
  } finally {
    // 重置標誌，表示拖放事件處理完成
    isProcessingDrop.value = false;
  }
};

// 全屏狀態(使用 CSS 模擬全屏，而不是瀏覽器的全屏 API)
const flowCanvasRef = ref(null);
const isFullscreen = ref(false);

// 處理全屏切換並適應視窗大小
const handleToggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;

  // 進入全屏後自動適應視窗大小
  if (isFullscreen.value) {
    setTimeout(() => {
      handleFitView();
    }, 300);
  }

  // 全屏切換後確保對話框正確顯示
  nextTick(() => {
    // 強制將對話框移至 body 元素下
    const dialogContainers = document.querySelectorAll(
      ".custom-dialog-container"
    );
    dialogContainers.forEach((container) => {
      if (!document.body.contains(container)) {
        document.body.appendChild(container);
      }
      container.style.zIndex = "999999";
    });
  });
};

// 判斷是否為 Mac 平台
const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const ctrlOrCmd = isMac ? "⌘" : "Ctrl+";
const shiftSymbol = isMac ? "⇧" : "Shift+";

// 高亮顯示節點

// 添加處理節點尺寸變化的方法
const handleNodeSizeChange = (payload) => {
  const { id, height } = payload;

  // 找到對應的節點
  const nodes = elements.value.filter((el) => !el.source); // 過濾出所有節點（不包含邊）
  const nodeIndex = nodes.findIndex((node) => node.id === id);
  if (nodeIndex === -1) return;

  // 更新節點尺寸
  const updatedNode = {
    ...nodes[nodeIndex],
    style: {
      ...nodes[nodeIndex].style,
      height: `${height}px`,
    },
  };

  // 更新節點列表
  const elementIndex = elements.value.findIndex((el) => el.id === id);
  if (elementIndex !== -1) {
    elements.value.splice(elementIndex, 1, updatedNode);
  }

  // 通知 Vue Flow 更新
  useVueFlow().updateNodeInternals([id]);

  logger.debug("FlowCanvas", `節點 ${id} 高度已更新為 ${height}px`);
};

// 處理節點狀態變更事件
const handleNodeStateChange = async (payload) => {
  const { nodeId, status, result, error } = payload;

  logger.info("FlowCanvas", `節點 ${nodeId} 狀態變更為 ${status}`);
  logger.debug("FlowCanvas", "狀態變更詳情:", { status, result, error });

  // 更新節點視覺狀態
  const node = elements.value.find((el) => el.id === nodeId && !el.source);
  if (node) {
    // 更新節點狀態
    if (status === "completed") {
      // 高亮顯示節點（綠色邊框）
      node.style = {
        ...node.style,
        border: "2px solid #22c55e",
        boxShadow: "0 0 10px rgba(34, 197, 94, 0.5)",
      };

      // 通知工作流管理器節點已完成
      try {
        logger.info("FlowCanvas", `通知工作流管理器節點 ${nodeId} 已完成`);
        await workflowManager.handleNodeCompleted(nodeId, result);
      } catch (error) {
        logger.error(
          "FlowCanvas",
          `處理節點 ${nodeId} 完成事件時發生錯誤:`,
          error
        );
      }
    } else if (status === "running") {
      // 高亮顯示節點（藍色邊框）
      node.style = {
        ...node.style,
        border: "2px solid #3b82f6",
        boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
      };
    } else if (status === "error") {
      // 高亮顯示節點（紅色邊框）
      node.style = {
        ...node.style,
        border: "2px solid #ef4444",
        boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
      };

      // 通知工作流管理器節點執行錯誤
      try {
        logger.info("FlowCanvas", `通知工作流管理器節點 ${nodeId} 執行錯誤`);
        await workflowManager.handleNodeError(nodeId, error);
      } catch (err) {
        logger.error(
          "FlowCanvas",
          `處理節點 ${nodeId} 錯誤事件時發生錯誤:`,
          err
        );
      }
    }

    // 更新元素
    elements.value = [...elements.value];
  } else {
    logger.warn("FlowCanvas", `找不到節點 ${nodeId}，無法更新視覺狀態`);
  }
};

// 監聽節點變化
const onNodesChange = (changes) => {
  if (!history.value.isRecording) return;

  changes.forEach((change) => {
    switch (change.type) {
      case "add":
        recordAction(ActionTypes.NODE_ADDED, { node: change.item });
        break;
      case "remove":
        recordAction(ActionTypes.NODE_REMOVED, { node: change.item });
        break;
      // 其他類型的變化...
    }
  });
};

// 修改自動布局函數(TODO: 刪除不用)
const autoLayout = () => {
  const oldElements = JSON.parse(JSON.stringify(elements.value));

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 120, ranksep: 160 });
  g.setDefaultEdgeLabel(() => ({}));

  const nodes = elements.value.filter((el) => !el.source);
  const edges = elements.value.filter((el) => el.source);

  // 添加節點
  nodes.forEach((node) => {
    g.setNode(node.id, { width: 240, height: 120 });
  });

  // 添加邊
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // 計算布局
  dagre.layout(g);

  // 更新節點位置
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  // 更新所有元素
  elements.value = [...layoutedNodes, ...edges];

  // 記錄布局變化
  recordAction(ActionTypes.LAYOUT_CHANGED, {
    oldElements,
    newElements: elements.value,
  });

  handleFitView();
  // 自動布局後更新流程實例 TODO: need update??
  updateFlowInstanceState();
};

const onNodeClick = (event) => {
  selectedNode.value = event.node;
};

const onPaneClick = () => {
  selectedNode.value = null;
};

// 在此主要用於新增便利貼(!TODO: 先保留)
const handleAddNode = (type) => {
  // 找出當前最小的 zIndex
  const minZIndex = Math.min(
    ...elements.value
      .filter((el) => !el.source) // 只考慮節點，不考慮連線
      .map((el) => el.zIndex || 0)
  );
  const id = `node_${Date.now()}`;
  const newNode = {
    id,
    type: type === "sticky" ? "sticky" : "",
    data:
      type === "sticky"
        ? {
            content: "",
            color: "#fef3c7",
          }
        : {
            type: type.type,
            content: `新的${type.label}-${id}`,
            status: "IDLE",
            config: { ...type.defaultConfig },
          },
    position: project({ x: 100, y: 100 }),
    zIndex: type === "sticky" ? 90 : 10,
    // 設置節點是否可拖動
    draggable: type === "file" || type === "sticky",
  };

  // 先記錄動作
  recordAction(ActionTypes.NODE_ADDED, {
    node: newNode,
    elements: elements.value, // 保存當前狀態
  });

  // 再更新畫布
  elements.value = [...elements.value, newNode];

  // 添加節點後更新流程實例
  if (type === "sticky") {
    // 如果是便利貼節點，將其視為數據更新而非結構更新
    saveNodeAsDataUpdate(id, newNode);
  } else {
    // 其他類型節點使用原有的更新方式
    updateFlowInstanceState();
  }
};

// 初始化元素
const initializeElements = () => {
  // 初始化模擬慢速上傳設置
  if (isDevelopment && localStorage.getItem("simulateSlowUpload") === null) {
    localStorage.setItem("simulateSlowUpload", "true");
  }

  // 初始化 elements，從 flowInstance 中獲取節點和邊緣數據
  if (
    props.flowInstance &&
    props.flowInstance.nodes &&
    props.flowInstance.edges
  ) {
    // 處理節點，設置 FileNode, StickyNode 可拖動，其他節點不可拖動
    const processedNodes = props.flowInstance.nodes.map((node) => {
      // 如果是 FileNode 類型，設置為可拖動
      if (node.type === "file" || node.type === "sticky") {
        return {
          ...node,
          draggable: true,
        };
      }
      // 其他節點設置為不可拖動
      return {
        ...node,
        draggable: false,
      };
    });

    // 處理邊，確保所有邊都不可更新和刪除
    const processedEdges = props.flowInstance.edges.map((edge) => {
      return {
        ...edge,
        deletable: false,
        updatable: false,
      };
    });

    elements.value = [...processedNodes, ...processedEdges];

    // 適應視窗大小
    handleFitView();

    logger.info("FlowCanvas", "流程實例元素已初始化");
    logger.debug(
      "FlowCanvas",
      `已載入 ${processedNodes.length} 個節點和 ${processedEdges.length} 條連線`
    );
  } else {
    logger.warn("FlowCanvas", "流程實例數據不完整", props.flowInstance);
  }

  // 其他初始化代碼...
  window.addEventListener("keydown", handleKeyDown);
};
</script>

<style scoped>
.vue-flow {
  @apply bg-gray-50;
}

.vue-flow__node[data-type="custom"].selected {
  @apply border-blue-500;
}

.vue-flow__edge {
  stroke: #3f3f3f;
}

.vue-flow__edge.selected {
  @apply stroke-blue-500;
}

:deep(.vue-flow__edge.animated) {
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

:deep(.vue-flow__edge-path) {
  stroke-width: 2;
  stroke: #3f3f3f;
}

:deep(.vue-flow__edge-text) {
  font-size: 12px;
}

:deep(.vue-flow__edge-textbg) {
  fill: white;
}

:deep(.vue-flow__edge-path) marker {
  fill: #3f3f3f;
  stroke: none;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) marker {
  fill: #3f3f3f;
  stroke: 100px;
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: #3f3f3f;
  border: 2px solid white;
  z-index: 50;
}

:deep(.vue-flow__handle.source) {
  right: 0;
  border-radius: 50%;
  transform: translateX(50%);
}

:deep(.vue-flow__handle.target) {
  left: 0;
  border-radius: 0;
  transform: translateX(-50%);
}

:deep(.vue-flow__handle:hover) {
  background: #1d4ed8;
}

/* 線條刪除按鈕樣式 */
:deep(.vue-flow__edge-label) {
  background: transparent;
  padding: 0;
  pointer-events: all;
}

.edge-button-wrapper {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: all 0.2s ease;
  pointer-events: all;
  z-index: 1000;
  padding: 4px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.vue-flow__edge:hover) .edge-button-wrapper,
:deep(.vue-flow__edge.selected) .edge-button-wrapper {
  opacity: 1;
}

.edge-delete-button {
  @apply !w-8 !h-8 !p-1.5 !text-red-500 hover:!text-red-600;
  background: white;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edge-delete-button:hover {
  transform: scale(1.1);
  background-color: #fee2e2;
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

/* 拖放相關樣式 */
.is-dragover::after {
  content: "";
  @apply absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-dashed border-blue-500 pointer-events-none z-50;
}

.is-dragover {
  background-color: rgba(0, 120, 212, 0.05);
  border: 2px dashed rgba(0, 120, 212, 0.5);
}

/* 全屏狀態樣式 */
:fullscreen {
  background-color: white;
  padding: 0;
  overflow: hidden;
}

:fullscreen .vue-flow {
  width: 100%;
  height: 100%;
}

:fullscreen .vue-flow__panel {
  z-index: 10;
}

:fullscreen .vue-flow__panel.top-right {
  top: 10px;
  right: 10px;
}

:fullscreen .vue-flow__controls {
  bottom: 40px;
}

:fullscreen .vue-flow__minimap {
  bottom: 40px;
  right: 10px;
}

/* 全屏模式下按鈕懸停效果增強 */
:fullscreen .vue-flow__panel button:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* CSS 模擬全屏樣式 */
.css-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9000 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  background-color: white !important;
}

.css-fullscreen .vue-flow {
  width: 100% !important;
  height: 100% !important;
}

.css-fullscreen .vue-flow__panel {
  z-index: 9010 !important;
}

.css-fullscreen .vue-flow__panel.top-right {
  top: 10px !important;
  right: 10px !important;
}

.css-fullscreen .vue-flow__controls {
  bottom: 40px !important;
}

.css-fullscreen .vue-flow__minimap {
  bottom: 40px !important;
  right: 10px !important;
}

/* CSS 全屏模式下按鈕懸停效果增強 */
.css-fullscreen .vue-flow__panel button:hover {
  transform: scale(1.05) !important;
  transition: transform 0.2s ease !important;
}
</style>
