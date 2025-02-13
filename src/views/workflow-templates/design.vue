<template>
  <div class="h-full flex">
    <!-- 左側工具欄 -->
    <div class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <!-- 工具欄標題 -->
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">節點類型</h3>
        <p class="mt-1 text-sm text-gray-500">拖拽節點到畫布中</p>
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
      <!-- 工具列 -->
      <div
        class="h-12 border-b border-gray-200 bg-white px-4 flex items-center justify-between"
      >
        <div class="flex items-center space-x-2">
          <el-button-group>
            <el-button :icon="Undo2">復原</el-button>
            <el-button :icon="Redo2">重做</el-button>
          </el-button-group>

          <el-divider direction="vertical" />

          <el-button-group>
            <el-button :icon="ZoomIn">放大</el-button>
            <el-button :icon="ZoomOut">縮小</el-button>
            <el-button :icon="LayoutGrid">重置</el-button>
          </el-button-group>

          <el-divider direction="vertical" />

          <el-button-group>
            <el-button :icon="Save">儲存</el-button>
            <el-button :icon="Play">測試</el-button>
          </el-button-group>
        </div>

        <div class="flex items-center space-x-2">
          <el-button type="primary" @click="handlePublish">
            <Send class="mr-1" :size="14" />
            發布範本
          </el-button>
        </div>
      </div>

      <!-- 畫布區域 -->
      <div class="flex-1 bg-gray-50 relative">
        <!-- Vue Flow 畫布 -->
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
          :fit-view-on-init="true"
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
        >
          <!-- 添加箭頭定義 -->
          <!-- <svg width="0" height="0">
            <defs>
              <marker
                id="vue-flow__arrowhead"
                markerWidth="12"
                markerHeight="12"
                viewBox="-10 -10 20 20"
                orient="auto"
                refX="0"
                refY="0"
              >
                <polyline
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
                  points="-5,-4 0,0 -5,4"
                  fill="none"
                  stroke="currentColor"
                />
              </marker>
            </defs>
          </svg> -->

          <template #node-custom="props">
            <CustomNode v-bind="props" />
          </template>

          <Background :pattern-color="'#aaa'" :gap="8" />

          <Controls />
          <!-- <MiniMap /> -->

          <Panel position="top-right" class="!bg-transparent !border-0">
            <div class="bg-white p-2 rounded shadow-lg">
              <el-switch v-model="snapToGrid" active-text="網格對齊" />
            </div>
          </Panel>
        </VueFlow>
      </div>
    </div>

    <!-- 右側屬性面板 -->
    <div v-if="selectedNode" class="properties-panel">
      <div class="p-4 space-y-4">
        <!-- 基本屬性 -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700">基本屬性</h3>
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
              >
                <el-option label="實線" value="solid" />
                <el-option label="虛線" value="dashed" />
                <el-option label="點線" value="dotted" />
              </el-select>
            </el-form-item>
          </el-form>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { VueFlow, Panel, useVueFlow, ConnectionMode } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Save,
  Play,
  Send,
  Trash2,
  FileInput,
  Database,
  Filter,
  Calculator,
  ChartBar,
  FileOutput,
  Table,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  Braces,
} from "lucide-vue-next";
import CustomNode from "./components/CustomNode.vue";
import CustomEdge from "./components/CustomEdge.vue";
import EdgeWithButton from "./components/EdgeWithButton.vue";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";
import { getTemplateById, updateTemplate, publishTemplate } from "@/api";

const route = useRoute();
const router = useRouter();

// 節點類型定義
const inputNodes = [
  { type: "dataInput", label: "檔案上傳", icon: FileInput, disabled: true },
  { type: "dataInput", label: "資料庫查詢", icon: Database, disabled: true },
];

const processNodes = [
  { type: "dataProcess", label: "資料過濾", icon: Filter, disabled: true },
  { type: "dataProcess", label: "數據計算", icon: Calculator, disabled: true },
  { type: "dataProcess", label: "資料分析", icon: ChartBar, disabled: true },
  { type: "apiRequest", label: "API 呼叫", icon: Braces, disabled: false },
];

const outputNodes = [
  { type: "dataOutput", label: "檔案輸出", icon: FileOutput, disabled: true },
  { type: "dataOutput", label: "資料表", icon: Table, disabled: true },
];

// Vue Flow 相關狀態
const elements = ref([]);
const selectedNode = ref(null);
const snapToGrid = ref(true);

// 載入範本資料
const loadTemplate = async () => {
  try {
    const templateId = route.params.id;
    const response = await getTemplateById(templateId);

    if (response.data.config) {
      const config = JSON.parse(response.data.config);
      elements.value = config.elements || [];
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
    x: event.clientX - bounds.left - 90, // 減去節點寬度的一半
    y: event.clientY - bounds.top - 50, // 減去節點高度的一半
  });

  // 如果啟用了網格對齊，將位置四捨五入到最近的網格點
  if (snapToGrid.value) {
    position.x = Math.round(position.x / 20) * 20;
    position.y = Math.round(position.y / 20) * 20;
  }

  // 創建新節點
  const newNode = {
    id: `node_${Date.now()}`,
    type: "custom",
    position,
    data: {
      label: nodeData.label,
      type: nodeData.type,
      icon: nodeData.icon,
      status: "idle",
      description: "",
      style: {
        backgroundColor: "",
        borderStyle: "solid",
      },
      config: {
        source: "API",
        fileType: [],
        processType: "filter",
        condition: "",
        timeout: 60,
        format: "csv",
        outputPath: "",
        compress: false,
        retryCount: 0,
        errorHandler: "stop",
      },
    },
  };

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

// 註冊自定義節點類型
const nodeTypes = {
  custom: CustomNode,
};

// 註冊自定義邊線類型
const edgeTypes = {
  button: EdgeWithButton,
  custom: CustomEdge,
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

onMounted(() => {
  loadTemplate();
  setTimeout(() => {
    fitView();
  }, 0);
});
</script>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";

.vue-flow__node {
  @apply !px-0 !py-0 !border-0 !shadow-none !bg-transparent;
}

.vue-flow__handle {
  @apply !w-3 !h-3 !min-w-0;
}

.vue-flow__handle-bottom {
  @apply !bottom-0 !translate-y-1/2;
}

.vue-flow__handle-top {
  @apply !top-0 !-translate-y-1/2;
}

.vue-flow__handle-left {
  @apply !left-0 !-translate-x-1/2;
}

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
</style>
