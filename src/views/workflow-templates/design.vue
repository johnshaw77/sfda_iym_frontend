<template>
  <div class="h-full flex">
    <!-- 左側工具欄 -->
    <div class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <!-- 工具欄標題 -->
      <div
        class="p-2.5 bg-slate-50 border-b border-gray-200 flex items-center justify-between"
      >
        <h3 class="text-md font-medium text-gray-900">節點類型</h3>
        <el-tooltip content="拖拽節點到畫布中" class="text-2xl">
          <CircleHelp class="text-gray-500" :size="16" />
        </el-tooltip>
        <!-- <p class="mt-1 text-sm text-gray-500">拖拽節點到畫布中</p> -->
      </div>

      <!-- 節點類型列表 -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-4">
          <!-- 資料輸入節點 -->
          <div class="space-y-2">
            <div class="text-xs font-medium text-gray-500">資料輸入</div>
            <div
              v-for="node in inputNodes"
              :key="node.type"
              class="p-3 bg-blue-50 rounded-lg border border-blue-100 cursor-move hover:shadow-md transition-shadow"
              :class="{ 'opacity-50 cursor-not-allowed': node.disabled }"
              draggable="true"
              @dragstart="!node.disabled && handleDragStart($event, node)"
              :title="node.disabled ? '此節點已停用' : ''"
            >
              <div class="flex items-center space-x-2">
                <component :is="node.icon" class="text-blue-500" :size="16" />
                <span class="text-sm text-gray-700">{{ node.label }}</span>
              </div>
            </div>
          </div>

          <!-- 資料處理節點 -->
          <div class="space-y-2">
            <div class="text-xs font-medium text-gray-500">資料處理</div>
            <div
              v-for="node in processNodes"
              :key="node.type"
              class="p-3 bg-green-50 rounded-lg border border-green-100 cursor-move hover:shadow-md transition-shadow"
              :class="{ 'opacity-50 cursor-not-allowed': node.disabled }"
              draggable="true"
              @dragstart="!node.disabled && handleDragStart($event, node)"
              :title="node.disabled ? '此節點已停用' : ''"
            >
              <div class="flex items-center space-x-2">
                <component :is="node.icon" class="text-green-500" :size="16" />
                <span class="text-sm text-gray-700">{{ node.label }}</span>
              </div>
            </div>
          </div>

          <!-- 輸出節點 -->
          <div class="space-y-2">
            <div class="text-xs font-medium text-gray-500">資料輸出</div>
            <div
              v-for="node in outputNodes"
              :key="node.type"
              class="p-3 bg-purple-50 rounded-lg border border-purple-100 cursor-move hover:shadow-md transition-shadow"
              :class="{ 'opacity-50 cursor-not-allowed': node.disabled }"
              draggable="true"
              @dragstart="!node.disabled && handleDragStart($event, node)"
              :title="node.disabled ? '此節點已停用' : ''"
            >
              <div class="flex items-center space-x-2">
                <component :is="node.icon" class="text-purple-500" :size="16" />
                <span class="text-sm text-gray-700">{{ node.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右側工作區 -->
    <div class="flex-1 flex flex-col">
      <!-- 工具列 TODO: 待實現-->
      <Teleport to="#header-actions">
        <div v-if="showHeaderContent" class="flex items-center space-x-2">
          <el-button-group>
            <el-tooltip content="復原">
              <el-button :icon="Undo2" />
            </el-tooltip>
            <el-tooltip content="重做">
              <el-button :icon="Redo2" />
            </el-tooltip>
            <el-tooltip content="放大">
              <el-button :icon="ZoomIn" />
            </el-tooltip>
            <el-tooltip content="縮小">
              <el-button :icon="ZoomOut" />
            </el-tooltip>
            <el-tooltip content="重置">
              <el-button :icon="LayoutGrid" />
            </el-tooltip>
            <el-tooltip content="儲存">
              <el-button :icon="Save" />
            </el-tooltip>
            <el-tooltip content="JSON 輸出">
              <el-button :icon="Code2" @click="handleShowJson" />
            </el-tooltip>
            <el-tooltip content="重新布局">
              <el-button :icon="Layout" @click="handleLayout" />
            </el-tooltip>
          </el-button-group>

          <el-dropdown @command="handleLayoutDirectionChange">
            <el-button>
              {{ layoutDirections[layoutSettings.direction].label }}
              <el-icon class="el-icon--right">
                <ChevronDown />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="(direction, key) in layoutDirections"
                  :key="key"
                  :command="key"
                >
                  {{ direction.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-button type="primary" @click="handlePublish">
            <Send class="mr-1" :size="14" />
            發布範本
          </el-button>
        </div>
      </Teleport>

      <!-- JSON 輸出抽屜 -->
      <el-drawer
        v-model="jsonDrawerVisible"
        title="工作流程 JSON"
        direction="rtl"
        size="50%"
      >
        <template #header>
          <div class="flex items-center justify-between w-full pr-4">
            <span>工作流程 JSON</span>
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
            class="custom-json-viewer"
          />
        </div>
      </el-drawer>

      <!-- 畫布區域 
      :node-types="nodeTypes"-->
      <div class="flex-1 bg-gray-50 relative">
        <!-- Vue Flow 畫布 -->
        <VueFlow
          v-model="elements"
          class="h-full"
          :default-zoom="1.5"
          :min-zoom="0.2"
          :max-zoom="4"
          :edge-types="edgeTypes"
          :default-edge-options="defaultEdgeOptions"
          :auto-connect="false"
          :edges-updatable="true"
          :edges-draggable="true"
          :edges-focusable="true"
          :edges-selectable="true"
          :select-nodes-on-drag="false"
          :connect-on-click="false"
          :snap-to-grid="snapToGrid"
          :snap-grid="[20, 20]"
          :connection-mode="ConnectionMode.Loose"
          :delete-key-code="['Backspace', 'Delete']"
          :elevate-edges-on-select="true"
          :fit-view-on-init="false"
          :prevent-scrolling="true"
          :enable-pan-over-edges="true"
          :enable-edge-updates="true"
          :update-edge-on-drag="true"
          :enable-connection-on-drag="true"
          :enable-strict-connect="false"
          :enable-edge-hover="true"
          :enable-edge-markers="true"
          :enable-edge-labels="true"
          :enable-edge-buttons="true"
          :enable-edge-update-on-drag="true"
          :enable-edge-update-on-mode-change="true"
          :enable-edge-update-on-handle-change="true"
          @nodeClick="onNodeClick"
          @connect="onConnect"
          @paneClick="onPaneClick"
          @edgeClick="onEdgeClick"
          @edgeUpdate="onEdgeUpdate"
          @edgeUpdateStart="onEdgeUpdateStart"
          @edgeUpdateEnd="onEdgeUpdateEnd"
          @nodeDragStart="onNodeDragStart"
          @nodeDragStop="onNodeDragStop"
          @nodesChange="onNodesChange"
          @edgesChange="onEdgesChange"
          @dragover="handleDragOver"
          @drop="handleDrop"
          @nodes-initialized="() => {}"
        >
          <template #node-custom="props">
            <CustomNode v-bind="props" />
          </template>

          <Background :pattern-color="'#aaa'" :gap="8" />

          <Controls />
          <MiniMap :pannable="true" :zoomable="true" />

          <Panel position="top-right" class="!bg-transparent !border-0">
            <div class="bg-white p-2 rounded shadow-lg">
              <el-switch v-model="snapToGrid" active-text="網格對齊" />
            </div>
          </Panel>
        </VueFlow>
      </div>
    </div>

    <!-- 右側屬性面板 -->
    <div
      v-if="selectedNode"
      class="border-l border-gray-200 w-80 h-full flex flex-col bg-white"
    >
      <div class="p-3.5 border-b border-gray-200 bg-slate-50">
        <h3 class="text-sm font-medium text-gray-700">基本屬性</h3>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div class="p-4 space-y-4">
          <!-- 基本屬性 -->
          <div class="space-y-2">
            <el-form label-position="top">
              <el-form-item label="節點名稱">
                <el-input
                  v-model="selectedNode.data.label"
                  @change="updateNodeData"
                />
              </el-form-item>
              <el-form-item label="節點描述">
                <el-input
                  type="textarea"
                  v-model="selectedNode.data.description"
                  :rows="2"
                  @change="updateNodeData"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- API 呼叫配置 (僅 apiRequest 類型) -->
          <template v-if="selectedNode.data.type === 'apiRequest'">
            <div class="space-y-2">
              <h3 class="text-sm font-medium text-gray-700">API 配置</h3>
              <el-form label-position="top">
                <el-form-item label="API 端點">
                  <el-input
                    v-model="selectedNode.data.config.apiEndpoint"
                    placeholder="請輸入 API 端點"
                    @change="updateNodeData"
                  />
                </el-form-item>
                <el-form-item label="請求方法">
                  <el-select
                    v-model="selectedNode.data.config.apiMethod"
                    class="w-full"
                    @change="updateNodeData"
                    default-first-option
                  >
                    <el-option label="POST" value="POST" default />
                    <el-option label="GET" value="GET" />
                    <el-option label="PUT" value="PUT" />
                    <el-option label="DELETE" value="DELETE" />
                  </el-select>
                </el-form-item>
                <!-- <el-form-item label="請求標頭">
                  <el-input
                    type="textarea"
                    v-model="selectedNode.data.config.headers"
                    :rows="4"
                    placeholder="請輸入 JSON 格式的請求標頭"
                    @change="updateNodeData"
                  />
                  <div class="text-xs text-gray-500 mt-1">
                    例如：{"Content-Type": "application/json", "Authorization":
                    "Bearer token"}
                  </div>
                </el-form-item> -->
                <el-form-item label="請求參數">
                  <el-input
                    type="textarea"
                    v-model="selectedNode.data.config.params"
                    :rows="4"
                    placeholder="請輸入 JSON 格式的請求參數"
                    @change="updateNodeData"
                  />
                  <div class="text-xs text-gray-500 mt-1">
                    例如：{"key": "value", "array": [1, 2, 3]}
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </template>

          <!-- 執行配置 -->
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-gray-700">執行配置</h3>
            <el-form label-position="top">
              <el-form-item label="重試次數">
                <el-input-number
                  v-model="selectedNode.data.config.retryCount"
                  :min="0"
                  :max="5"
                  @change="updateNodeData"
                />
              </el-form-item>
              <el-form-item label="超時時間 (秒)">
                <el-input-number
                  v-model="selectedNode.data.config.timeout"
                  :min="1"
                  :max="300"
                  @change="updateNodeData"
                />
              </el-form-item>
              <el-form-item label="錯誤處理">
                <el-select
                  v-model="selectedNode.data.config.errorHandler"
                  class="w-full"
                  @change="updateNodeData"
                >
                  <el-option label="停止執行" value="stop" />
                  <el-option label="繼續執行" value="continue" />
                  <el-option label="重試" value="retry" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <!-- 樣式設定 -->
          <!-- <div class="space-y-2">
            <h3 class="text-sm font-medium text-gray-700">樣式設定</h3>
            <el-form label-position="top">
              <el-form-item label="背景顏色">
                <el-color-picker
                  v-model="selectedNode.data.style.backgroundColor"
                  @change="updateNodeData"
                />
              </el-form-item>
              <el-form-item label="邊框樣式">
                <el-select
                  v-model="selectedNode.data.style.borderStyle"
                  class="w-full"
                  @change="updateNodeData"
                >123 上一個

                  <el-option label="實線" value="solid" />營
                  <el-option label="虛線" value="dashed" />
                  <el-option label="點線" value="dotted" />
                </el-select>
              </el-form-item>
            </el-form>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onActivated, onDeactivated } from "vue";
import { useRoute, useRouter } from "vue-router";
import { VueFlow, Panel, useVueFlow, ConnectionMode } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  CircleHelp,
  Save,
  Play,
  Send,
  Trash2,
  FileInput,
  Database,
  Filter,
  Calculator,
  BarChart,
  FileOutput,
  Table,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  Layout,
  Braces,
  Code2,
  Copy,
  ChevronDown,
} from "lucide-vue-next";
import CustomNode from "./components/CustomNode.vue";
import CustomEdge from "./components/CustomEdge.vue";
import EdgeWithButton from "./components/EdgeWithButton.vue";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";
import JsonViewer from "vue-json-viewer";
import "vue-json-viewer/style.css";
import { getTemplateById, updateTemplate, publishTemplate } from "@/api";
import { useTemplateStore } from "@/stores/template";

const route = useRoute();
const router = useRouter();
const templateStore = useTemplateStore();

//#region 節點類型定義
const inputNodes = [
  { type: "input", label: "開始", icon: Play, disabled: false },
  { type: "dataInput", label: "檔案上傳", icon: FileInput, disabled: false },
  { type: "dataInput", label: "資料庫查詢", icon: Database, disabled: true },
];

const processNodes = [
  { type: "dataProcess", label: "資料過濾", icon: Filter, disabled: true },
  { type: "dataProcess", label: "數據計算", icon: Calculator, disabled: true },
  { type: "dataProcess", label: "資料分析", icon: BarChart, disabled: true },
  { type: "apiRequest", label: "API 呼叫", icon: Braces, disabled: false },
];

const outputNodes = [
  { type: "dataOutput", label: "檔案輸出", icon: FileOutput, disabled: true },
  { type: "dataOutput", label: "資料表", icon: Table, disabled: false },
];
//#endregion

// Vue Flow 相關狀態
const elements = ref([]);
const selectedNode = ref(null);
const snapToGrid = ref(true);
const jsonDrawerVisible = ref(false);

// 布局設置
const layoutSettings = ref({
  direction: "LR",
  spacing: 100,
  nodeWidth: 180,
  nodeHeight: 100,
});

// 布局方向選項
const layoutDirections = {
  LR: { label: "從左到右", x: 1, y: 0 },
  RL: { label: "從右到左", x: -1, y: 0 },
  TB: { label: "從上到下", x: 0, y: 1 },
  BT: { label: "從下到上", x: 0, y: -1 },
  RADIAL: { label: "放射狀", x: 0, y: 0 },
};

//#region teleport 內容管理
const showHeaderContent = ref(true);

onActivated(() => {
  showHeaderContent.value = true;
});

onDeactivated(() => {
  showHeaderContent.value = false;
});
//#endregion

// 載入範本資料
const loadTemplate = async () => {
  try {
    const templateId = route.params.id;
    console.log("正在載入範本，ID:", templateId);
    const response = await getTemplateById(templateId);
    console.log("API 回傳資料:", response.data);

    if (response.data) {
      // 使用 Pinia store 設置範本名稱
      templateStore.setTemplateName(response.data.templateName);
      console.log("範本名稱已更新:", response.data.templateName);

      if (response.data.config) {
        try {
          const config = JSON.parse(response.data.config);
          elements.value = config.elements || [];

          // 只有當有節點時才執行自動布局
          if (elements.value.length > 0) {
            setTimeout(() => {
              layoutGraph();
            }, 100);
          }
        } catch (e) {
          console.error("解析範本配置失敗:", e);
          elements.value = [];
        }
      } else {
        elements.value = [];
      }
    }
  } catch (error) {
    console.error("載入範本失敗:", error);
    ElMessage.error("載入範本失敗");
  }
};

// 處理節點拖拽開始
const handleDragStart = (event, node) => {
  event.dataTransfer.setData(
    "application/vueflow",
    JSON.stringify({
      type: node.type,
      label: node.label,
      icon: node.icon,
    })
  );
  console.log("handleDragStart", node.type);
  event.dataTransfer.effectAllowed = "move";
};

// 處理刪除節點
const handleDeleteNode = async () => {
  try {
    await ElMessageBox.confirm(
      "確定要刪除此節點嗎？此操作不可恢復。",
      "刪除確認",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    if (selectedNode.value) {
      elements.value = elements.value.filter(
        (el) => el.id !== selectedNode.value.id
      );
      selectedNode.value = null;
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("刪除節點失敗");
    }
  }
};

// 處理發布範本
const handlePublish = async () => {
  try {
    await ElMessageBox.confirm(
      "確定要發布此範本嗎？發布後將不能修改。",
      "發布確認",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "info",
      }
    );

    const templateId = route.params.id;
    await publishTemplate(templateId);
    ElMessage.success("範本發布成功");
    router.push("/workflow-templates");
  } catch (error) {
    if (error !== "cancel") {
      console.error("發布範本失敗:", error);
      ElMessage.error("發布範本失敗");
    }
  }
};

// 處理拖拽經過
const handleDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

// 處理節點拖放
const handleDrop = (event) => {
  event.preventDefault();

  const nodeData = JSON.parse(
    event.dataTransfer.getData("application/vueflow")
  );

  // 獲取畫布的 DOM 元素和位置資訊
  const bounds = event.target.getBoundingClientRect();
  const position = project({
    x: event.clientX - bounds.left - 90,
    y: event.clientY - bounds.top - 50,
  });

  // 如果啟用了網格對齊，將位置四捨五入到最近的網格點
  if (snapToGrid.value) {
    position.x = Math.round(position.x / 20) * 20;
    position.y = Math.round(position.y / 20) * 20;
  }

  // 創建新節點 這是給節點的初始化設定(點擊節點後的初始化設定)
  const getInitialConfig = (type) => {
    switch (type) {
      case "dataInput":
        return {
          source: "file",
          fileType: ["csv", "xlsx", "json"],
          validateSchema: true,
          maxFileSize: 10,
          encoding: "utf-8",
          timeout: 60,
          retryCount: 0,
          errorHandler: "stop",
        };
      case "apiRequest":
        return {
          apiEndpoint: "",
          apiMethod: "POST",
          headers: {},
          params: {},
          timeout: 60,
          retryCount: 0,
          errorHandler: "stop",
        };
      case "dataProcess":
        return {
          processType: "filter",
          condition: "",
          timeout: 60,
          retryCount: 0,
          errorHandler: "stop",
        };
      case "dataOutput":
        return {
          format: "csv",
          outputPath: "",
          compress: false,
          timeout: 60,
          retryCount: 0,
          errorHandler: "stop",
        };
      default:
        return {
          timeout: 60,
          retryCount: 0,
          errorHandler: "stop",
        };
    }
  };
  //這個好像沒用到
  const getNodeStyle = (type) => {
    switch (type) {
      case "dataInput":
        return { borderColor: "#93c5fd", backgroundColor: "#eff6ff" };
      case "apiRequest": // TODO: CHECK
        return { borderColor: "#fdba74", backgroundColor: "red" };
      case "dataProcess":
        return { borderColor: "#86efac", backgroundColor: "#f0fdf4" };
      case "dataOutput":
        return { borderColor: "#d8b4fe", backgroundColor: "#faf5ff" };
      default:
        return { borderColor: "#e5e7eb", backgroundColor: "#ffffff" };
    }
  };

  const getNodeType = (type) => {
    switch (type) {
      case "input": // TODO: CHECK
        return "input"; // 只有輸出連接點
      case "dataInput":
        return "input"; // 只有輸出連接點
      case "dataOutput":
        return "output"; // 只有輸入連接點
      case "dataProcess":
      case "apiRequest":
        return "custom"; // 同時有輸入和輸出連接點
      default:
        return "default";
    }
  };

  const newNode = {
    id: `node_${Date.now()}`,
    type: getNodeType(nodeData.type), // 回傳的值是 input, output, default, custom
    position,
    data: {
      label: nodeData.label,
      type: nodeData.type,
      icon: nodeData.icon,
      status: "idle",
      description: "",
      //style: getNodeStyle(nodeData.type),
      config: getInitialConfig(nodeData.type),
    },
  };
  console.log("newNode", newNode);

  // 添加新節點到畫布
  elements.value = [...elements.value, newNode];
};

// 處理節點連接
const handleConnect = ({ source, target }) => {
  // 創建新的連接
  const newEdge = {
    id: `edge_${Date.now()}`,
    source,
    target,
    type: "smoothstep", // 或使用 'default', 'straight', 'step' 等
    animated: true,
    style: { stroke: "#b1b1b7" },
  };

  elements.value = [...elements.value, newEdge];
};

// 註冊自定義節點類型 !TODO: 好像也沒用到
const nodeTypes = {
  input: CustomNode,
  output: CustomNode,
  default: CustomNode,
};

// 註冊自定義邊線類型
const edgeTypes = {
  button: EdgeWithButton,
  custom: CustomEdge,
};

// 設置默認的連接線選項
const defaultEdgeOptions = {
  type: "button", // 這個會影響到節點的連接線類型
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
  setNodes,
} = useVueFlow({
  defaultEdgeOptions,
  edgesUpdatable: true,
  edgesDraggable: true,
  edgesFocusable: true,
  selectNodesOnDrag: false,
  elevateEdgesOnSelect: true,
});

// 節點點擊事件
const onNodeClick = (event) => {
  selectedNode.value = event.node;
};

// 畫布點擊事件
const onPaneClick = () => {
  selectedNode.value = null;
};

// 連接事件
const onConnect = (params) => {
  const newEdge = {
    id: `edge_${params.source}_${params.sourceHandle}_${params.target}_${params.targetHandle}`,
    ...params,
    type: "button",
    animated: true,
    style: {
      strokeWidth: 2,
      stroke: "#3f3f3f",
    },
    markerEnd: defaultEdgeOptions.markerEnd,
  };
  elements.value = [...elements.value, newEdge];
};

// 邊線點擊事件
const onEdgeClick = (event) => {
  console.log("Edge clicked:", event);
};

// 邊線更新事件
const onEdgeUpdate = (oldEdge, newConnection) => {
  const newEdge = {
    ...oldEdge,
    ...newConnection,
  };
  elements.value = elements.value.map((el) =>
    el.id === oldEdge.id ? newEdge : el
  );
};

// 邊線更新開始事件
const onEdgeUpdateStart = (event) => {
  console.log("Edge update started:", event);
};

// 邊線更新結束事件
const onEdgeUpdateEnd = (event) => {
  console.log("Edge update ended:", event);
};

// 節點拖動開始事件
const onNodeDragStart = (event) => {
  console.log("Node drag started:", event);
};

// 節點拖動結束事件
const onNodeDragStop = (event) => {
  console.log("Node drag stopped:", event);
};

// 節點變化事件
const onNodesChange = (changes) => {
  console.log("Nodes changed:", changes);
};

// 邊線變化事件
const onEdgesChange = (changes) => {
  console.log("Edges changed:", changes);
};

// 更新節點資料
const updateNodeData = () => {
  if (!selectedNode.value) return;

  elements.value = elements.value.map((el) =>
    el.id === selectedNode.value.id ? selectedNode.value : el
  );
};

const handleShowJson = () => {
  jsonDrawerVisible.value = true;
};

// 處理布局方向變更
const handleLayoutDirectionChange = (direction) => {
  layoutSettings.value.direction = direction;
  handleLayout();
};

// 處理重新布局
const handleLayout = () => {
  layoutGraph(layoutSettings.value.direction);
};

// 自動布局函數
const layoutGraph = (direction = "LR") => {
  if (!nodes.value || nodes.value.length === 0) return;

  const { spacing, nodeWidth, nodeHeight } = layoutSettings.value;

  if (direction === "RADIAL") {
    // 放射狀布局
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) / 3;
    const angleStep = (2 * Math.PI) / nodes.value.length;

    nodes.value.forEach((node, index) => {
      const angle = index * angleStep;
      node.position = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  } else {
    // 線性布局（左右/上下）
    const isHorizontal = direction === "LR" || direction === "RL";
    const isReverse = direction === "RL" || direction === "BT";

    // 設置起始位置
    const startPos = 100;

    // 計算總高度/寬度
    const totalNodes = nodes.value.length;
    const crossAxisTotal = totalNodes * (isHorizontal ? nodeHeight : nodeWidth);
    const crossAxisSpacing = (totalNodes - 1) * spacing;

    // 計算起始位置（置中）
    const crossAxisStart =
      (isHorizontal ? window.innerHeight : window.innerWidth) / 2 -
      (crossAxisTotal + crossAxisSpacing) / 2;

    // 直接對所有節點進行布局
    nodes.value.forEach((node, index) => {
      const crossAxisPos =
        crossAxisStart +
        index * (isHorizontal ? nodeHeight + spacing : nodeWidth + spacing);
      const mainAxisPos = startPos + index * spacing;

      let x, y;
      if (isHorizontal) {
        x = isReverse
          ? window.innerWidth - mainAxisPos - nodeWidth
          : mainAxisPos;
        y = crossAxisPos;
      } else {
        x = crossAxisPos;
        y = isReverse
          ? window.innerHeight - mainAxisPos - nodeHeight
          : mainAxisPos;
      }

      node.position = { x, y };
    });
  }

  // 更新節點位置
  setNodes([...nodes.value]);

  // 只有當有多個節點時才執行 fitView
  if (nodes.value.length > 1) {
    setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 100);
  }
};

onMounted(() => {
  loadTemplate();
});
</script>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";

/** 基礎的節點樣式 */
.vue-flow__node {
  /* @apply !px-0 !py-0 !border-0 !shadow-none !bg-transparent; */
  @apply bg-slate-100 rounded-md border border-slate-600 text-sm;
}

.vue-flow__handle {
  @apply !w-3 !h-3 !min-w-0;
}

/** 影響自定節點 ex: Custom的連接點 */
.vue-flow__handle-bottom {
  @apply !bottom-0 !translate-y-1/2;
}
/** 影響自定節點 ex: Custom的連接點 */
.vue-flow__handle-top {
  @apply !top-0 !-translate-y-1/2;
}
/** 影響自定節點 ex: Custom的連接點 */
.vue-flow__handle-left {
  @apply !left-0 !-translate-x-1/2;
}
/** 影響自定節點 ex: Custom的連接點 */
.vue-flow__handle-right {
  @apply !right-0 !translate-x-1/2;
}

.vue-flow__edge {
  @apply !stroke-2;
}

.vue-flow__edge.selected {
  @apply !stroke-blue-500;
}

.vue-flow__edge-path {
  @apply !stroke-current;
}

.vue-flow__edge.animated path {
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

/* JSON Viewer 自定義樣式 */
.custom-json-viewer {
  background-color: #f9fafb !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
  border: 1px solid #e5e7eb !important;
}

.custom-json-viewer .jv-container {
  background: none !important;
}

.custom-json-viewer .jv-container .jv-code {
  padding: 0 !important;
  background: none !important;
}

.custom-json-viewer .jv-container .jv-key {
  color: #2563eb !important;
}

.custom-json-viewer .jv-container .jv-item.jv-string {
  color: #059669 !important;
}

.custom-json-viewer .jv-container .jv-item.jv-number {
  color: #d97706 !important;
}

.custom-json-viewer .jv-container .jv-item.jv-boolean {
  color: #7c3aed !important;
}

.custom-json-viewer .jv-container .jv-item.jv-null {
  color: #dc2626 !important;
}
</style>
