<template>
  <div class="h-full flex">
    <!-- 左側工具欄 -->
    <ToolPanel
      :input-nodes="inputNodes"
      :process-nodes="processNodes"
      :is-collapsed="isLeftPanelCollapsed"
      @toggle-panel="handleLeftPanelToggle"
      @drag-start="handleDragStart" />

    <!-- 右側工作區 -->
    <div class="flex-1 flex flex-col">
      <!-- 工具列 -->
      <Teleport to="#header-actions">
        <FlowToolbar
          v-if="showHeaderContent"
          :layout-direction="layoutSettings.direction"
          :layout-directions="layoutDirections"
          :has-unsaved-changes="hasUnsavedChanges"
          @reset="handleReset"
          @preview-thumbnail="handlePreviewThumbnail"
          @save="handleSave"
          @show-json="handleShowJson"
          @layout="handleLayout"
          @layout-direction-change="handleLayoutDirectionChange"
          @publish="handlePublish" />
      </Teleport>

      <!-- JSON 輸出抽屜 -->
      <el-drawer
        v-model="jsonDrawerVisible"
        title="工作流程 JSON"
        direction="rtl"
        size="50%">
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
            class="custom-json-viewer" />
        </div>
      </el-drawer>

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
          @nodes-initialized="() => {}">
          <Background
            pattern="lines"
            :gap="20"
            :size="1" />

          <Controls />

          <Panel
            position="top-right"
            class="!bg-transparent !border-0">
            <div class="bg-white p-2 rounded shadow-lg">
              <el-switch
                v-model="snapToGrid"
                active-text="網格對齊" />
            </div>
          </Panel>
        </VueFlow>
      </div>
    </div>

    <!-- 右側屬性面板 -->
    <PropertyPanel
      :flow-template="flowTemplate"
      :form-rules="formRules"
      :is-collapsed="isRightPanelCollapsed"
      @toggle-panel="handleRightPanelToggle" />
  </div>
</template>

<script setup>
import { VueFlow, Panel, useVueFlow, ConnectionMode } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";

import EdgeWithButton from "@/components/flow-nodes/base/EdgeWithButton.vue";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import JsonViewer from "vue-json-viewer";
import "vue-json-viewer/style.css";

// 導入子元件
import ToolPanel from "./components/ToolPanel.vue";
import PropertyPanel from "./components/PropertyPanel.vue";
import FlowToolbar from "./components/FlowToolbar.vue";

// 導入 composables
import { useFlowTemplate } from "@/composables/flow/useFlowTemplate";
import { useFlowLayout } from "@/composables/flow/useFlowLayout";
import { useFlowNodes } from "@/composables/flow/useFlowNodes";
import { useFlowEdges } from "@/composables/flow/useFlowEdges";
import { useFlowNodeComponents } from "@/composables/useFlowNodeComponents";
import { useScreenshot } from "@/composables/useScreenshot"; //TODO: 待測，想擷取後上傳存檔當做封面
import { useTeleportVisibility } from "@/composables/useTeleportVisibility";

const route = useRoute();
const router = useRouter();
const { showHeaderContent } = useTeleportVisibility();

// 使用 composables
const {
  flowTemplate,
  hasUnsavedChanges,
  formRules,
  loadTemplate,
  saveTemplate,
  publishTemplate,
  handleBeforeUnload,
  setupRouteGuard,
} = useFlowTemplate();

const {
  layoutSettings,
  layoutDirections,
  layoutGraph,
  isLeftPanelCollapsed,
  isRightPanelCollapsed,
  loadPanelStates,
  toggleLeftPanel,
  toggleRightPanel,
} = useFlowLayout();

const {
  inputNodes,
  processNodes,
  selectedNode,
  loadNodeDefinitions,
  handleDragStart,
  handleDrop: nodeHandleDrop,
  handleDragOver,
  handleDeleteNode,
  onNodeClick,
  onPaneClick,
  onNodeDragStart: nodeOnDragStart,
  onNodeDragStop: nodeOnDragStop,
  onNodesChange: nodeOnNodesChange,
} = useFlowNodes();

const {
  defaultEdgeOptions,
  edgeTypes: flowEdgeTypes,
  onConnect: edgeOnConnect,
  onEdgeClick,
  onEdgeUpdate: edgeOnEdgeUpdate,
  onEdgeUpdateStart,
  onEdgeUpdateEnd,
  onEdgesChange: edgeOnEdgesChange,
} = useFlowEdges();

// Vue Flow 相關狀態
const elements = ref([]);
const snapToGrid = ref(true);
const jsonDrawerVisible = ref(false);

// 註冊自定義節點類型
const { flowNodeComponents, loadFlowNodeComponents } = useFlowNodeComponents();
const nodeTypes = ref({});

// 載入節點元件
const loadNodeComponents = async () => {
  await loadFlowNodeComponents();

  Object.entries(flowNodeComponents.value).forEach(([key, value]) => {
    const componentName = key
      .replace("/src/components/flow-nodes/business/", "")
      .replace(".vue", "");
    nodeTypes.value[componentName] = value.default || value;
  });
};

// 註冊自定義邊線類型
const edgeTypes = {
  button: EdgeWithButton,
};

// Vue Flow 相關函數
const { project, fitView, nodes, edges, setEdges, setNodes, vueFlowRef } =
  useVueFlow({
    defaultEdgeOptions,
    edgesUpdatable: true,
    edgesDraggable: true,
    edgesFocusable: true,
    selectNodesOnDrag: false,
    elevateEdgesOnSelect: true,
  });

// 截圖功能
const { capture } = useScreenshot();

// 處理左側面板摺疊
const handleLeftPanelToggle = () => {
  toggleLeftPanel(() => fitView({ padding: 0.2 }));
};

// 處理右側面板摺疊
const handleRightPanelToggle = () => {
  toggleRightPanel(() => fitView({ padding: 0.2 }));
};

// 處理拖放
const handleDrop = (event) => {
  nodeHandleDrop(event, project, elements, snapToGrid.value);
};

// 處理重置畫布
const handleReset = () => {
  setNodes([]);
  setEdges([]);
};

// 處理 JSON 顯示
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
  layoutGraph(nodes, setNodes, fitView, layoutSettings.value.direction);
};

// 處理儲存
const handleSave = async () => {
  await saveTemplate(route.params.id, elements);
};

// 處理發布範本
const handlePublish = async () => {
  await publishTemplate(route.params.id);
};

// 處理縮圖預覽
const handlePreviewThumbnail = async () => {
  if (!vueFlowRef.value) {
    console.warn("VueFlow element not found");
    return;
  }
  const data = await capture(vueFlowRef.value, { shouldDownload: false });
  flowTemplate.value.thumbnail = data;
};

// 處理 fitView
const handleFitView = () => {
  setTimeout(() => {
    fitView({ padding: 0.2 });
  }, 400);
};

// 節點拖動開始事件
const onNodeDragStart = (event) => {
  nodeOnDragStart(event, () => (hasUnsavedChanges.value = true));
};

// 節點拖動結束事件
const onNodeDragStop = (event) => {
  nodeOnDragStop(event, () => (hasUnsavedChanges.value = true));
};

// 節點變化事件
const onNodesChange = (changes) => {
  nodeOnNodesChange(changes, () => (hasUnsavedChanges.value = true));
};

// 連接事件
const onConnect = (params) => {
  edgeOnConnect(params, elements);
};

// 邊線更新事件
const onEdgeUpdate = (oldEdge, newConnection) => {
  edgeOnEdgeUpdate(oldEdge, newConnection, elements);
};

// 邊線變化事件
const onEdgesChange = (changes) => {
  edgeOnEdgesChange(changes, () => (hasUnsavedChanges.value = true));
};

onMounted(async () => {
  // 載入面板狀態
  loadPanelStates();

  // 載入節點定義和元件
  await loadNodeDefinitions();
  await loadNodeComponents();

  // 載入範本資料
  await loadTemplate(route.params.id, elements, handleFitView);

  // 添加瀏覽器原生的離開提示
  window.addEventListener("beforeunload", handleBeforeUnload);

  // 添加路由守衛
  const removeRouteGuard = setupRouteGuard(router);

  onUnmounted(() => {
    // 移除瀏覽器原生的離開提示
    window.removeEventListener("beforeunload", handleBeforeUnload);

    // 移除路由守衛
    removeRouteGuard();
  });
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
