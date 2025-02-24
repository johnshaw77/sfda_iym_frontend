<template>
  <div class="h-full flex">
    <!-- 左側工具欄 -->
    <div
      class="bg-white border-r border-gray-200 flex flex-col transition-all duration-300"
      :class="[isCollapsed ? 'w-12' : 'w-64']"
    >
      <!-- 工具欄標題 -->
      <div
        class="p-2.5 bg-slate-50 border-b border-gray-200 flex items-center justify-between"
      >
        <h3 v-show="!isCollapsed" class="text-md font-medium text-gray-900">
          節點類型
        </h3>
        <div class="flex items-center">
          <el-tooltip
            :content="isCollapsed ? '展開面板' : '收合面板'"
            placement="right"
          >
            <div
              class="p-1 rounded hover:bg-gray-100 cursor-pointer"
              @click="handlePanelCollapse"
            >
              <component
                :is="isCollapsed ? 'PanelLeftOpen' : 'PanelLeftClose'"
                class="text-gray-500"
                :size="16"
              />
            </div>
          </el-tooltip>
        </div>
      </div>

      <!-- 節點類型列表 -->
      <div v-show="!isCollapsed" class="flex-1 overflow-y-auto p-4">
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
          <!-- <div class="space-y-2">
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
            </div> -->
        </div>
      </div>

      <!-- 收合時的圖示列表 -->
      <div v-show="isCollapsed" class="flex-1 overflow-y-auto py-4">
        <div class="space-y-4">
          <!-- 資料輸入節點 -->
          <div class="space-y-2">
            <div v-for="node in inputNodes" :key="node.type" class="px-2">
              <el-tooltip :content="node.label" placement="right">
                <div
                  class="p-2 rounded-lg cursor-move hover:bg-blue-50 transition-colors"
                  :class="{ 'opacity-50 cursor-not-allowed': node.disabled }"
                  draggable="true"
                  @dragstart="!node.disabled && handleDragStart($event, node)"
                >
                  <component :is="node.icon" class="text-blue-500" :size="16" />
                </div>
              </el-tooltip>
            </div>
          </div>

          <!-- 資料處理節點 -->
          <div class="space-y-2">
            <div v-for="node in processNodes" :key="node.type" class="px-2">
              <el-tooltip :content="node.label" placement="right">
                <div
                  class="p-2 rounded-lg cursor-move hover:bg-green-50 transition-colors"
                  :class="{ 'opacity-50 cursor-not-allowed': node.disabled }"
                  draggable="true"
                  @dragstart="!node.disabled && handleDragStart($event, node)"
                >
                  <component
                    :is="node.icon"
                    class="text-green-500"
                    :size="16"
                  />
                </div>
              </el-tooltip>
            </div>
          </div>

          <!-- 輸出節點 -->
          <!-- <div class="space-y-2">
              <div v-for="node in outputNodes" :key="node.type" class="px-2">
                <el-tooltip :content="node.label" placement="right">
                  <div
                    class="p-2 rounded-lg cursor-move hover:bg-purple-50 transition-colors"
                    :class="{ 'opacity-50 cursor-not-allowed': node.disabled }"
                    draggable="true"
                    @dragstart="!node.disabled && handleDragStart($event, node)"
                  >
                    <component
                      :is="node.icon"
                      class="text-purple-500"
                      :size="16"
                    />
                  </div>
                </el-tooltip>
              </div>
            </div> -->
        </div>
      </div>
    </div>

    <!-- 右側工作區 -->
    <div class="flex-1 flex flex-col">
      <!-- 工具列 TODO: 功能待實現-->
      <Teleport to="#header-actions">
        <div v-if="showHeaderContent" class="flex items-center space-x-2">
          <el-button-group>
            <el-tooltip content="清空畫布">
              <el-button :icon="icons.LayoutGrid" @click="handleReset" />
            </el-tooltip>
            <el-tooltip content="縮圖預覽">
              <el-button :icon="icons.Camera" @click="handlePreviewThumbnail" />
            </el-tooltip>
            <el-tooltip content="儲存">
              <el-button
                :icon="icons.Save"
                :type="hasUnsavedChanges ? 'warning' : 'default'"
                @click="handleSave"
              />
            </el-tooltip>
            <el-tooltip content="JSON 輸出">
              <el-button :icon="icons.Code2" @click="handleShowJson" />
            </el-tooltip>
            <el-tooltip content="重新布局">
              <el-button :icon="icons.Layout" @click="handleLayout" />
            </el-tooltip>
          </el-button-group>

          <el-dropdown @command="handleLayoutDirectionChange">
            <el-button>
              {{ layoutDirections[layoutSettings.direction].label }}
              <el-icon class="el-icon--right">
                <icons.ChevronDown />
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
          <Background pattern="lines" :gap="20" :size="1" />

          <Controls />
          <!-- <MiniMap :pannable="true" :zoomable="true" /> -->

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
      class="border-l border-gray-200 h-full flex flex-col bg-white transition-all duration-300"
      :class="[isRightCollapsed ? 'w-12' : 'w-96']"
    >
      <div
        class="p-2.5 border-b border-gray-200 bg-slate-50 flex items-center space-x-1"
      >
        <div class="flex items-center">
          <el-tooltip
            :content="isRightCollapsed ? '展開面板' : '收合面板'"
            placement="left"
          >
            <div
              class="p-1 rounded hover:bg-gray-100 cursor-pointer"
              @click="handleRightPanelCollapse"
            >
              <component
                :is="isRightCollapsed ? 'PanelRightOpen' : 'PanelRightClose'"
                class="text-gray-500"
                :size="16"
              />
            </div>
          </el-tooltip>
        </div>
        <h3
          v-show="!isRightCollapsed"
          class="text-sm font-medium text-gray-700"
        >
          基本屬性
        </h3>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-show="!isRightCollapsed" class="p-2 space-y-4">
          <!-- 基本屬性 -->
          <div class="space-y-2">
            <!-- 表單 -->
            <div v-loading="!flowTemplate" />

            <el-form
              v-if="flowTemplate"
              ref="formRef"
              :model="flowTemplate"
              :rules="formRules"
              label-width="80px"
              label-position="left"
            >
              <!-- // 如何判斷範本名稱是否已存在-->
              <el-form-item label="範本類型" prop="type">
                <el-select
                  v-model="flowTemplate.type"
                  placeholder="請選擇範本類型"
                  :fit-input-width="true"
                >
                  <el-option label="business" value="business" />
                </el-select>
                <el-tag type="info"
                  >先暫時固定 business (未來會有流程類型)</el-tag
                >
              </el-form-item>

              <el-form-item label="範本名稱" prop="name">
                <el-input v-model="flowTemplate.name" />
              </el-form-item>
              <el-form-item label="範本描述" prop="description">
                <el-input
                  v-model="flowTemplate.description"
                  type="textarea"
                  :rows="5"
                />
              </el-form-item>
              <el-form-item label="狀態" prop="status">
                <el-radio-group v-model="flowTemplate.status">
                  <el-radio-button label="active" value="active"
                    >啟用</el-radio-button
                  >
                  <el-radio-button label="inactive" value="inactive"
                    >停用</el-radio-button
                  >
                  <el-radio-button label="draft" value="draft"
                    >草稿</el-radio-button
                  >
                </el-radio-group>
              </el-form-item>

              <el-form-item label="元數據">
                <el-input
                  v-model="flowTemplate.metadata"
                  type="textarea"
                  :rows="5"
                />
                <el-tag type="info"> 暫時沒使用，備著 </el-tag>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div
          v-show="isRightCollapsed"
          class="p-4 text-sm writing-vertical-lr text-gray-700"
        >
          基本屬性
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  computed,
  onActivated,
  onDeactivated,
  onUnmounted,
} from "vue";
import { useFlowTemplateStore } from "@/stores/flowTemplate";
import { useRoute, useRouter } from "vue-router";
import { VueFlow, Panel, useVueFlow, ConnectionMode } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { ElMessage, ElMessageBox } from "element-plus";

//import CustomNode from "./components/CustomNode.vue";
import CustomEdge from "./components/CustomEdge.vue";
import EdgeWithButton from "./components/EdgeWithButton.vue";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";
import JsonViewer from "vue-json-viewer";
import "vue-json-viewer/style.css";

// API
import {
  getFlowNodeDefinitions,
  getFlowTemplateById,
  updateFlowTemplate,
  publishFlowTemplate,
} from "@/api";

import { useFlowNodeComponents } from "@/composables/useFlowNodeComponents";

import { useIcons } from "@/composables/useIcons";
const { icons } = useIcons();

const route = useRoute();
const router = useRouter();
const flowTemplateStore = useFlowTemplateStore();

//#region 節點類型定義
const inputNodes = ref([]);
const processNodes = ref([]);

// 從資料庫載入節點定義(給左邊菜單使用)
const loadNodeDefinitions = async () => {
  try {
    const response = await getFlowNodeDefinitions();
    const definitions = response.data;
    // 將節點定義分類
    inputNodes.value = Object.values(definitions)
      .filter(
        (node) =>
          node.componentName &&
          node.componentPath &&
          node.category === "data-input"
      )
      .map((node) => ({
        //type: node.nodeType,
        componentName: node.componentName,
        label: node.name,
        icon: node.icon,
        description: node.description,
      }));

    processNodes.value = Object.values(definitions)
      .filter(
        (node) =>
          node.componentName &&
          node.componentPath &&
          ["data-process", "statistical-analysis"].includes(node.category)
      )
      .map((node) => ({
        type: node.nodeType,
        componentName: node.componentName,
        label: node.name,
        icon: node.icon,
        description: node.description,
      }));
  } catch (error) {
    console.error("載入節點定義失敗：", error);
    ElMessage.error("載入節點定義失敗");
  }
};

// const outputNodes = [
//   { type: "dataOutput", label: "檔案輸出", icon: FileOutput, disabled: true },
//   { type: "dataOutput", label: "資料表", icon: Table, disabled: false },
// ];
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

// 添加頁面離開警告控制
const hasUnsavedChanges = ref(false);

// 處理瀏覽器原生的離開提示（用於重新整理和關閉頁面）
const handleBeforeUnload = (e) => {
  if (hasUnsavedChanges.value) {
    const message = "您有未保存的更改，確定要離開嗎？";
    e.returnValue = message;
    return message;
  }
};

// 處理路由變化的提示（使用 Element Plus 對話框）
const handleRouteChange = async (to, from, next) => {
  if (hasUnsavedChanges.value) {
    try {
      await ElMessageBox.confirm(
        "您有未保存的更改，確定要離開嗎？",
        "離開確認",
        {
          confirmButtonText: "確定離開",
          cancelButtonText: "取消",
          type: "warning",
        }
      );
      hasUnsavedChanges.value = false; // 重置未保存狀態
      next();
    } catch (error) {
      next(false);
    }
  } else {
    next();
  }
};

const flowTemplate = ref(null);
const handleFitView = () => {
  setTimeout(() => {
    fitView({ padding: 0.2 });
  }, 400);
};
// 載入範本資料
const loadTemplate = async () => {
  try {
    const templateId = route.params.id;
    const response = await getFlowTemplateById(templateId);
    flowTemplate.value = response.data;

    if (response.data) {
      // 使用 Pinia store 設置範本名稱
      flowTemplateStore.setTemplateName(flowTemplate.value.name);

      try {
        const nodes = flowTemplate.value.nodes;
        const edges = flowTemplate.value.edges;

        elements.value = [...nodes, ...edges];

        // // 只有當有節點時才執行自動布局
        // if (elements.value.length > 0) {
        //   setTimeout(() => {
        //     handleLayoutGraph();
        //   }, 100);
        //}
        handleFitView();
        setTimeout(() => {
          hasUnsavedChanges.value = false;
        }, 400);
      } catch (e) {
        console.error("解析範本配置失敗:", e);
        elements.value = [];
      }
    }
  } catch (error) {
    console.error("載入範本失敗:", error);
    ElMessage.error("載入範本失敗");
  }
};
const nodeTypes = {
  // 基礎節點類型
  //custom: HttpRequestNode, // TODO: remove this
  //default: BaseNode,
  //HttpRequestNode,
  // 業務輸入節點
  //ComplaintSelectorNode, // 客訴單號選擇器
  // 業務處理節點
  //TopDefectsNode, // 前五大不良分析
  //StatisticProcessNode, // 統計分析節點
  // API 請求節點
  //ApiRequestNode: HttpRequestNode, // TODO:暫時使用 CustomNode 作為 API 請求節點的基礎
};

// 註冊自定義節點類型
const { flowNodeComponents, loadFlowNodeComponents } = useFlowNodeComponents();

loadFlowNodeComponents();

Object.entries(flowNodeComponents.value).forEach(([key, value]) => {
  const componentName = key
    .replace("/src/components/flow-nodes/business/", "")
    .replace(".vue", "");
  nodeTypes[componentName] = value.default || value;
});

// 處理節點拖拽開始
const handleDragStart = (event, node) => {
  event.dataTransfer.setData(
    "application/vueflow",
    JSON.stringify({
      type: node.componentName.replace(".vue", ""),
      componentName: node.componentName,
      label: node.label,
      icon: node.icon,
      description: node.description,
    })
  );
  event.dataTransfer.effectAllowed = "move";
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

  // 創建新節點
  const newNode = {
    id: `node_${Date.now()}`,
    type: nodeData.componentName.replace(".vue", ""), // 使用 componentName 作為節點類型
    position,
    data: {
      label: nodeData.name,
      type: nodeData.type,
      icon: nodeData.icon,
      description: nodeData.description,
      status: "idle",
      config: getInitialConfig(nodeData.type),
    },
  };

  // 添加新節點到畫布
  elements.value = [...elements.value, newNode];
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

// 處理拖拽經過
const handleDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

// 獲取節點初始配置 (TODO: 需要優化)
const getInitialConfig = (nodeType) => {
  // 根據節點類型返回對應的初始配置
  switch (nodeType) {
    case "custom-input":
      return {
        dataSource: "",
        validation: {
          required: true,
        },
      };
    case "custom-process":
      return {
        operations: [],
        filters: [],
        transformations: [],
      };
    case "statistic-process":
      return {
        analysisType: "",
        parameters: {},
        modelType: "",
      };
    case "http-request":
      return {
        method: "GET",
        endpoint: "",
        headers: {},
        body: {},
      };
    default:
      return {};
  }
};

// 註冊自定義邊線類型 (TODO: 需要優化)
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
  vueFlowRef,
} = useVueFlow({
  defaultEdgeOptions,
  edgesUpdatable: true,
  edgesDraggable: true,
  edgesFocusable: true,
  selectNodesOnDrag: false,
  elevateEdgesOnSelect: true,
});

//#region 畫布事件

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
const onEdgeClick = (event) => {};

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
  //console.log("Edge update started:", event);
};

// 邊線更新結束事件
const onEdgeUpdateEnd = (event) => {
  //console.log("Edge update ended:", event);
};

// 節點拖動開始事件
const onNodeDragStart = (event) => {
  //console.log("Node drag started:", event);
};

// 節點拖動結束事件
const onNodeDragStop = (event) => {
  //console.log("Node drag stopped:", event);
};

// 節點變化事件
const onNodesChange = (changes) => {
  hasUnsavedChanges.value = true;
};

// 邊線變化事件
const onEdgesChange = (changes) => {
  //console.log("Edges changed:", changes);
  // TODO: 會與從資料庫載入的打架
  hasUnsavedChanges.value = true;
};
//#endregion

// 更新節點資料
const updateNodeData = () => {
  if (!selectedNode.value) return;

  elements.value = elements.value.map((el) =>
    el.id === selectedNode.value.id ? selectedNode.value : el
  );
  hasUnsavedChanges.value = true;
};

// 處理重置畫布(清空)
const handleReset = () => {
  // 重置畫布
  setNodes([]);
  setEdges([]);
};

// JSON 顯示
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
  handleLayoutGraph(layoutSettings.value.direction);
};

// 自動布局函數
const handleLayoutGraph = (direction = "LR") => {
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
    handleFitView();
  }
};

const formRules = {
  name: [{ required: true, message: "請輸入範本名稱" }],
  description: [{ required: true, message: "請輸入範本描述" }],
};

// 處理儲存
const handleSave = async () => {
  try {
    // 從 elements 中的，取出 nodes (沒有屬性 sourceHandle 的)
    const nodes = elements.value.filter((el) => !el.sourceHandle);
    const edges = elements.value.filter((el) => el.sourceHandle);
    // 在這裡添加儲存邏輯
    await updateFlowTemplate(route.params.id, {
      ...flowTemplate.value,
      config: JSON.stringify({ elements: elements.value }),
      nodes: nodes,
      edges: edges,
    });
    hasUnsavedChanges.value = false;
    ElMessage.success("儲存成功");
  } catch (error) {
    console.error("儲存失敗:", error);
    ElMessage.error("儲存失敗");
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
    await publishFlowTemplate(templateId);
    ElMessage.success("範本發布成功");
    router.push("/workflow-templates");
  } catch (error) {
    if (error !== "cancel") {
      console.error("發布範本失敗:", error);
      ElMessage.error("發布範本失敗");
    }
  }
};

import { useScreenshot } from "@/composables/useScreenshot";

const { capture } = useScreenshot();
// 縮圖預覽
const handlePreviewThumbnail = async () => {
  if (!vueFlowRef.value) {
    console.warn("VueFlow element not found");
    return;
  }
  const data = await capture(vueFlowRef.value, { shouldDownload: false });

  flowTemplate.value.thumbnail = data;

  //TODO: base64 太大了，先不儲存
  // handleSave();

  return capture(vueFlowRef.value, { shouldDownload: false });
};

// 面板摺疊狀態
const isCollapsed = ref(false);
const isRightCollapsed = ref(false);
// 處理面板摺疊
const handlePanelCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  handleFitView();
};

const handleRightPanelCollapse = () => {
  isRightCollapsed.value = !isRightCollapsed.value;
  handleFitView();
};

onMounted(() => {
  loadNodeDefinitions(); // 載入節點定義
  loadTemplate();
  // 添加瀏覽器原生的離開提示
  window.addEventListener("beforeunload", handleBeforeUnload);
  // 添加路由守衛
  router.beforeEach(handleRouteChange);
});

onUnmounted(() => {
  // 移除瀏覽器原生的離開提示
  window.removeEventListener("beforeunload", handleBeforeUnload);
  // 移除路由守衛
  router.beforeEach(handleRouteChange);
});
</script>

<style>
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
