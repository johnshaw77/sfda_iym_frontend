<!-- 流程圖畫布除了檔案節點外，其他節點不可拖動 -->
<template>
  <div
    class="h-full bg-white rounded-lg shadow-lg overflow-hidden flex"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    :class="{ 'is-dragover': isDragOver }"
    ref="flowCanvasRef">
    <div class="flex-1">
      <el-card class="w-[500px] absolute top-2 left-2 z-10">
        <template #header>
          <div class="flex items-center justify-between">
            <el-descriptions
              class="margin-top"
              title="工作流實例(開發者測試用)"
              :column="2"
              :size="size"
              border
              :style="blockMargin">
              <el-descriptions-item
                label="flowInstance.id"
                :span="2"
                >{{ flowInstance?.id }}</el-descriptions-item
              >
              <el-descriptions-item label="狀態">{{
                flowInstance?.status
              }}</el-descriptions-item>
              <el-descriptions-item label="Place">Suzhou</el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
        <div class="p-1">
          <flow-task-list
            :nodes="flowInstance?.nodes"
            :edges="flowInstance?.edges"
            @highlight-node="handleHighlightNode" />
        </div>
      </el-card>

      <!-- 工作流控制面板 -->
      <el-card class="w-[300px] absolute top-2 right-2 z-10">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-lg font-medium">工作流控制</span>
            <el-switch
              v-model="showWorkflowControls"
              active-text="顯示"
              inactive-text="隱藏" />
          </div>
        </template>
        <div
          v-if="showWorkflowControls"
          class="p-2 space-y-4">
          <!-- 工作流控制按鈕 -->
          <div class="flex flex-col space-y-2">
            <el-button
              type="primary"
              @click="startWorkflow()"
              :disabled="workflowManager.isExecuting">
              <component
                :is="Play"
                :size="16"
                :stroke-width="1.5"
                class="mr-1" />
              啟動工作流
            </el-button>
            <el-button
              type="warning"
              @click="executeSpecificNode(selectedNode?.id)"
              :disabled="!selectedNode">
              <component
                :is="PlayCircle"
                :size="16"
                :stroke-width="1.5"
                class="mr-1" />
              執行選中節點
            </el-button>
          </div>

          <!-- 執行狀態顯示 -->
          <div
            v-if="workflowManager.isExecuting"
            class="p-2 bg-blue-50 rounded">
            <div class="flex items-center">
              <component
                :is="Loader"
                :size="16"
                :stroke-width="1.5"
                class="mr-1 animate-spin" />
              <span
                >正在執行節點:
                {{ workflowManager.currentExecutingNodeId }}</span
              >
            </div>
          </div>

          <!-- 執行錯誤顯示 -->
          <div
            v-if="workflowManager.executionError"
            class="p-2 bg-red-50 rounded">
            <div class="text-red-600">
              <component
                :is="AlertCircle"
                :size="16"
                :stroke-width="1.5"
                class="mr-1" />
              執行錯誤: {{ workflowManager.executionError.message }}
            </div>
          </div>

          <!-- 執行歷史 -->
          <div
            v-if="workflowManager.executionHistory.length > 0"
            class="p-2 bg-gray-50 rounded">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium">執行歷史</span>
              <el-button
                type="text"
                size="small"
                @click="showExecutionHistory = !showExecutionHistory">
                {{ showExecutionHistory ? "隱藏" : "顯示" }}
              </el-button>
            </div>
            <div
              v-if="showExecutionHistory"
              class="max-h-40 overflow-auto">
              <div
                v-for="(item, index) in workflowManager.executionHistory"
                :key="index"
                class="text-xs p-1 border-b border-gray-200">
                <div class="flex justify-between">
                  <span>{{
                    new Date(item.timestamp).toLocaleTimeString()
                  }}</span>
                  <el-tag
                    size="small"
                    :type="
                      item.action === 'error'
                        ? 'danger'
                        : item.action === 'complete'
                        ? 'success'
                        : 'info'
                    ">
                    {{ item.action }}
                  </el-tag>
                </div>
                <div class="text-gray-600">節點: {{ item.nodeId }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

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
        :edges-updatable="false"
        :edges-draggable="false"
        :edges-focusable="false"
        :edges-selectable="false"
        :select-nodes-on-drag="false"
        :connect-on-click="false"
        :snap-to-grid="snapToGrid"
        :snap-grid="[20, 20]"
        :connection-mode="ConnectionMode.Loose"
        :elevate-edges-on-select="true"
        :fit-view-on-init="false"
        :prevent-scrolling="true"
        :enable-pan-over-edges="true"
        :enable-edge-updates="false"
        :update-edge-on-drag="false"
        :enable-connection-on-drag="false"
        :enable-strict-connect="false"
        :enable-edge-hover="false"
        :enable-edge-markers="false"
        :enable-edge-labels="false"
        :enable-edge-buttons="false"
        :enable-edge-update-on-drag="true"
        :enable-edge-update-on-mode-change="true"
        :enable-edge-update-on-handle-change="true"
        :nodes-draggable="false"
        @nodeClick="onNodeClick"
        @connect="onConnect"
        @paneClick="onPaneClick"
        @edgeUpdateStart="onEdgeUpdateStart"
        @edgeUpdateEnd="onEdgeUpdateEnd"
        @nodeDragStart="onNodeDragStart"
        @nodeDragStop="onNodeDragStop"
        @nodesChange="onNodesChange"
        @nodes-initialized="() => {}">
        <Background
          pattern="lines"
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
            <el-button
              v-for="nodeType in Object.values(NODE_TYPES)"
              :key="nodeType.type"
              size="small"
              @click="() => handleAddNode(nodeType)">
              <component
                :is="nodeType.icon"
                :size="16"
                :stroke-width="1.5"
                class="mr-1" />
              {{ nodeType.label }}
            </el-button>
            <el-divider direction="vertical" />
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
                  ? `退出全屏 (F11 或 ${ctrlOrCmd}${shiftSymbol}F)`
                  : `全屏 (F11 或 ${ctrlOrCmd}${shiftSymbol}F)`
              "
              placement="top"
              effect="light">
              <el-button
                size="small"
                @click="toggleFullscreen">
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
            <json-viewer
              :value="elements"
              :expand-depth="2"
              expandIconStyle="circle"
              sort
              boxed
              :expand-on-click="true"
              class="custom-json-viewer" />
          </div>
        </el-drawer>
      </VueFlow>
    </div>
  </div>
</template>

<script setup>
import {
  VueFlow,
  useVueFlow,
  Panel,
  Position,
  ConnectionMode,
} from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import { Controls } from "@vue-flow/controls";
import dagre from "@dagrejs/dagre"; // 自動布局
import JsonViewer from "vue-json-viewer";
import "vue-json-viewer/style.css";

import StickyNote from "@/components/flow-nodes/base/StickyNote.vue";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";
import { uploadDocument } from "@/api/modules/flowDocument";
import { updateFlowInstance } from "@/api/modules/flow";

import { useFlowNodeComponents } from "@/composables/useFlowNodeComponents";
import FileNode from "@/components/flow-nodes/base/FileNode.vue";
import FlowTaskList from "./FlowTaskList.vue";
import { useWorkflowManager } from "@/composables/useWorkflowManager";
import { Play, PlayCircle, Loader, AlertCircle } from "lucide-vue-next";

// 節點類型定義
const NODE_TYPES = ref({});

const props = defineProps({
  // 工作流實例
  flowInstance: {
    type: Object,
    required: true,
  },
});

// 註冊自定義節點類型
const nodeTypes = {
  //custom: CustomNode,
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

const {
  project,
  fitView,
  nodes,
  edges,
  viewport,
  getZoom,
  onConnect: vueFlowConnect,
  setEdges,
  addEdges,
  updateEdge,
  addNodes,
  removeNodes,
} = useVueFlow({
  defaultEdgeOptions,
  edgesUpdatable: true,
  edgesDraggable: true,
  edgesFocusable: true,
  selectNodesOnDrag: false,
  elevateEdgesOnSelect: true,
});
const selectedNode = ref(null);

// 定義 elements 變數
const elements = ref([]);

// 定義 snapToGrid 變數
const snapToGrid = ref(true);

// 定義 showJsonDrawer 變數
const showJsonDrawer = ref(false);

// 使用工作流管理器
const workflowManager = useWorkflowManager();

// 添加工作流控制面板
const showWorkflowControls = ref(false);
const selectedStartNode = ref(null);

// 執行歷史顯示控制
const showExecutionHistory = ref(false);

// 啟動工作流
const startWorkflow = async (startNodeId = null) => {
  try {
    ElMessage.info("正在啟動工作流...");
    await workflowManager.executeWorkflow(startNodeId);
    ElMessage.success("工作流啟動成功");
  } catch (error) {
    console.error("啟動工作流時發生錯誤:", error);
    ElMessage.error(`啟動工作流失敗: ${error.message}`);
  }
};

// 執行特定節點
const executeSpecificNode = async (nodeId, context = {}) => {
  try {
    if (!nodeId) {
      ElMessage.warning("請先選擇要執行的節點");
      return;
    }

    ElMessage.info(`正在執行節點 ${nodeId}...`);
    await workflowManager.executeNode(nodeId, context);
    ElMessage.success(`節點 ${nodeId} 執行成功`);
  } catch (error) {
    console.error(`執行節點 ${nodeId} 時發生錯誤:`, error);
    ElMessage.error(`執行節點失敗: ${error.message}`);
  }
};

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
    return; // 如果節點不可拖動，則不處理
  }

  dragStartPosition.value = { ...node.position };
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
      oldPosition: dragStartPosition.value,
      newPosition: { ...node.position },
    });
    dragStartPosition.value = null;

    // 節點拖動後更新流程實例
    updateFlowInstanceState();
  }
};

// 更新流程實例狀態的共用函數
const updateFlowInstanceState = async () => {
  try {
    // 準備要更新的數據
    const updatedNodes = elements.value.filter((el) => !el.source);
    const updatedEdges = elements.value.filter((el) => el.source);

    // 調用 API 更新流程實例
    await updateFlowInstance(props.flowInstance.id, {
      nodes: updatedNodes,
      edges: updatedEdges,
    });

    // 無需顯示提示，因為會打擾用戶體驗
    console.log("流程實例已更新");
  } catch (error) {
    console.error("更新流程實例失敗", error);
    ElMessage.warning("節點位置變更無法保存：" + (error.message || "未知錯誤"));
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

// 監聽連線變化
const onEdgesChange = (changes) => {
  if (!history.value.isRecording) return;

  changes.forEach((change) => {
    switch (change.type) {
      case "add":
        recordAction(ActionTypes.EDGE_ADDED, { edge: change.item });
        break;
      case "remove":
        recordAction(ActionTypes.EDGE_REMOVED, { edge: change.item });
        break;
      // 其他類型的變化...
    }
  });
};

// 修改自動布局函數
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

  setTimeout(() => {
    handleFitView();
    // 自動布局後更新流程實例 TODO: need update??
    updateFlowInstanceState();
  }, 100);
};

onMounted(() => {
  setTimeout(() => {
    handleFitView();
  }, 100);

  // 添加節點狀態變更事件監聽器
  window.addEventListener("flow:nodeStateChange", handleNodeStateChange);
});

onUnmounted(() => {
  window.removeEventListener("flow:nodeStateChange", handleNodeStateChange);
});

const onNodeClick = (event) => {
  selectedNode.value = event.node;
};

const onPaneClick = () => {
  selectedNode.value = null;
};

const handleAddNode = (type) => {
  // 找出當前最小的 zIndex
  const minZIndex = Math.min(
    ...elements.value
      .filter((el) => !el.source) // 只考慮節點，不考慮連線
      .map((el) => el.zIndex || 0)
  );
  const id = `node_${Date.now()}`;
  console.log("handleAddNode", type);
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
    zIndex: type === "sticky" ? minZIndex - 1 : 1,
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
  updateFlowInstanceState();
};

const updateNode = (updatedNode) => {
  const index = elements.value.findIndex((el) => el.id === updatedNode.id);
  if (index !== -1) {
    const newElements = [...elements.value];
    newElements[index] = updatedNode;
    recordAction(ActionTypes.NODE_MOVED, {
      id: updatedNode.id,
      oldPosition: elements.value[index].position,
      newPosition: updatedNode.position,
    });

    // 節點更新後更新流程實例
    updateFlowInstanceState();
  }
};

// 連接處理函數
const onConnect = (params) => {
  // 禁用添加新連接線
  ElMessage.warning("當前模式下不允許添加新連接線");
  return;
};

// 刪除線條
const deleteEdge = (edgeId) => {
  // 由於所有邊都不可刪除，所以直接返回
  ElMessage.warning("當前模式下不允許刪除連接線");
  return;
};

const onEdgeUpdateStart = (params) => {
  console.log("onEdgeUpdateStart", params);
};

const onEdgeUpdateEnd = (event) => {
  //console.log("onEdgeUpdateEnd", event);
};

// 線條更新事件(Cursor 原本給的答案是錯的)
const onEdgeUpdate = ({ edge, connection }) => {};

// 線條點擊事件
const onEdgeClick = (event) => {
  // 可以在這裡添加其他線條點擊相關的邏輯
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
  const handleFitView = () => {
    setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 400);
  };
  // setTimeout(() => {
  //   fitView({
  //     padding: 0.2,
  //     maxZoom: 1,
  //     minZoom: 0.6,
  //     duration: 150,
  //     includeHiddenNodes: true,
  //   });
  // }, 100);
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

  // 全屏快捷鍵 - F11 或 Ctrl+Shift+F
  if (
    event.key === "F11" ||
    ((event.metaKey || event.ctrlKey) &&
      event.shiftKey &&
      event.key.toLowerCase() === "f")
  ) {
    toggleFullscreen();
    event.preventDefault();
  }
};

// 監聽鍵盤事件
onMounted(async () => {
  // try {
  //   const response = await getFlowNodeDefinitions();
  //   NODE_TYPES.value = response.data;
  // } catch (error) {
  //   console.error("獲取節點類型定義失敗：", error);
  //   ElMessage.error("獲取節點類型定義失敗");
  // }

  // 初始化 elements，從 flowInstance 中獲取節點和邊緣數據
  if (
    props.flowInstance &&
    props.flowInstance.nodes &&
    props.flowInstance.edges
  ) {
    // 處理節點，設置 FileNode 可拖動，其他節點不可拖動
    const processedNodes = props.flowInstance.nodes.map((node) => {
      // 如果是 FileNode 類型，設置為可拖動
      if (node.type === "file") {
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
    setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 100);
  } else {
    console.warn("流程實例數據不完整", props.flowInstance);
  }

  // 其他初始化代碼...
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// 拖放相關
const isDragOver = ref(false);
// 添加一個標誌變數，用於防止重複處理拖放事件
const isProcessingDrop = ref(false);

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
  const files = Array.from(event.dataTransfer.files);

  // 檢查檔案類型
  const isFileTypeAllowed = (file) => {
    const ALLOWED_FILE_TYPES = {
      "image/*": "圖片檔案",
      "application/pdf": "PDF 檔案",
      "text/plain": "文字檔案",
      "text/csv": "CSV 檔案",
      "application/json": "JSON 檔案",
      // Excel 相關
      "application/vnd.ms-excel": "Excel 檔案",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "Excel 檔案",
      "application/excel": "Excel 檔案",
      "application/x-excel": "Excel 檔案",
      "application/x-msexcel": "Excel 檔案",
      // PPT 相關
      "application/vnd.ms-powerpoint": "PPT 檔案",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "PPT 檔案",
      "application/powerpoint": "PPT 檔案",
      "application/mspowerpoint": "PPT 檔案",
      "application/x-mspowerpoint": "PPT 檔案",
      "application/ppt": "PPT 檔案",
      //word 相關
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "Word 檔案",
      "application/word": "Word 檔案",
      "application/x-word": "Word 檔案",
      "application/vnd.ms-word": "Word 檔案",
    };

    return Object.keys(ALLOWED_FILE_TYPES).some((type) => {
      if (type.endsWith("*")) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
  };

  const invalidFiles = files.filter((file) => !isFileTypeAllowed(file));
  if (invalidFiles.length > 0) {
    ElMessage.error(
      `不支援的檔案類型：${invalidFiles.map((f) => f.name).join(", ")}`
    );
    return;
  }

  // 獲取滑鼠在畫布上的位置
  const bounds = event.currentTarget.getBoundingClientRect();
  const position = project({
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  });

  // 處理每個檔案
  for (const file of files) {
    try {
      // 創建檔案節點（先顯示上傳進度）
      const nodeId = `file-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newNode = {
        id: nodeId,
        type: "file",
        position,
        draggable: true, // 檔案節點可拖動
        data: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadProgress: 0,
        },
      };

      // 添加節點
      addNodes([newNode]);

      // 模擬上傳進度
      const updateProgress = (progress) => {
        const node = nodes.value.find((n) => n.id === nodeId);
        if (node) {
          node.data = { ...node.data, uploadProgress: progress };
        }
      };

      // 模擬分段上傳進度
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        updateProgress(progress);
      }

      // 上傳檔案
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", props.flowInstance.projectId);
      formData.append("instanceId", props.flowInstance.id);
      formData.append("docType", file.type);

      // 上傳檔案
      const result = await uploadDocument(formData);

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

        // 確保節點被添加到 elements 陣列中
        if (!elements.value.some((el) => el.id === nodeId)) {
          elements.value = [...elements.value, node];
        }

        // 將更新後的節點保存到流程實例中
        try {
          // 使用共用的更新函數
          await updateFlowInstanceState();
          ElMessage.success(`檔案 ${file.name} 上傳並保存到流程實例成功`);
        } catch (updateError) {
          console.error("保存流程實例失敗", updateError);
          ElMessage.warning(
            `檔案已上傳，但保存到流程實例失敗：${
              updateError.message || "未知錯誤"
            }`
          );
        }
      }
    } catch (error) {
      console.error("檔案上傳失敗", error);
      ElMessage.error(
        `檔案 ${file.name} 上傳失敗：${error.message || "未知錯誤"}`
      );
    }
  }

  // 重置標誌，表示拖放事件處理完成
  isProcessingDrop.value = false;
};

// 全屏狀態
const isFullscreen = ref(false);
const flowCanvasRef = ref(null);

// 處理全屏切換
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    // 進入全屏
    flowCanvasRef.value?.requestFullscreen();
    isFullscreen.value = true;
    // 進入全屏後自動適應視窗大小
    setTimeout(() => {
      handleFitView();
    }, 300);
  } else {
    // 退出全屏
    document.exitFullscreen();
    isFullscreen.value = false;
  }
};

// 監聽全屏變化事件
onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
});

// 全屏狀態變更處理
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

// 判斷是否為 Mac 平台
const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const ctrlOrCmd = isMac ? "⌘" : "Ctrl+";
const shiftSymbol = isMac ? "⇧" : "Shift+";

// 高亮顯示節點
const handleHighlightNode = (nodeId) => {
  // 找到對應的節點
  const node = elements.value.find((el) => el.id === nodeId && !el.source);
  if (!node) return;

  // 高亮顯示節點（可以通過修改節點樣式或添加特殊類）
  const updatedElements = elements.value.map((el) => {
    if (el.id === nodeId && !el.source) {
      return {
        ...el,
        style: {
          ...el.style,
          border: "2px solid #409EFF",
          boxShadow: "0 0 10px rgba(64, 158, 255, 0.5)",
        },
        // 可以添加一個標記，表示該節點被高亮
        highlighted: true,
      };
    }
    // 移除其他節點的高亮
    if (!el.source && el.highlighted) {
      const { highlighted, ...style } = el.style || {};
      return {
        ...el,
        style: {
          ...style,
          border: null,
          boxShadow: null,
        },
        highlighted: false,
      };
    }
    return el;
  });

  // 更新元素
  elements.value = updatedElements;

  // 將視圖中心移動到該節點
  if (node.position) {
    const { x, y } = node.position;
    // 使用 Vue Flow 的 API 將視圖中心移動到節點位置
    const { setCenter } = useVueFlow();
    setCenter(x, y, { zoom: 1.5, duration: 500 });
  }
};

// 添加處理節點尺寸變化的方法
const handleNodeSizeChange = ({ id, height }) => {
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

  //console.log(`節點 ${id} 高度已更新為 ${height}px`);
};

// 處理節點狀態變更事件
const handleNodeStateChange = async (event) => {
  const { nodeId, status, result, error } = event.detail;

  console.log(`節點 ${nodeId} 狀態變更為 ${status}`, result || error);

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
      await workflowManager.handleNodeCompleted(nodeId, result);
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
      await workflowManager.handleNodeError(nodeId, error);
    }

    // 更新元素
    elements.value = [...elements.value];
  }
};

// // 暴露方法給父組件
// defineExpose({
//   highlightNode,
// });
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

/* JSON Viewer 自定義樣式 */
.custom-json-viewer {
  background-color: #f9fafb !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
  border: 1px solid #e5e7eb !important;
}

.custom-json-viewer :deep(.jv-container) {
  background: none !important;
}

.custom-json-viewer :deep(.jv-container .jv-code) {
  padding: 0 !important;
  background: none !important;
}

.custom-json-viewer :deep(.jv-container .jv-key) {
  color: #2563eb !important;
}

.custom-json-viewer :deep(.jv-container .jv-item.jv-string) {
  color: #059669 !important;
}

.custom-json-viewer :deep(.jv-container .jv-item.jv-number) {
  color: #d97706 !important;
}

.custom-json-viewer :deep(.jv-container .jv-item.jv-boolean) {
  color: #7c3aed !important;
}

.custom-json-viewer :deep(.jv-container .jv-item.jv-null) {
  color: #dc2626 !important;
}
</style>
