<template>
  <div class="h-full bg-white rounded-lg shadow-lg overflow-hidden flex">
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
        :edges-updatable="true"
        :edges-draggable="true"
        :edges-focusable="true"
        :edges-selectable="true"
        :select-nodes-on-drag="false"
        :connect-on-click="false"
        :snap-to-grid="true"
        :snap-grid="[20, 20]"
        :connection-mode="ConnectionMode.Strict"
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
      >
        <Background pattern-color="#aaa" gap="8" />
        <MiniMap />
        <Controls />
        <Panel position="top-right" class="bg-white p-2 rounded shadow-md">
          <div class="flex flex-wrap gap-2">
            <el-button
              v-for="type in Object.values(NODE_TYPES)"
              :key="type.type"
              size="small"
              @click="() => onAddNode(type)"
            >
              <component
                :is="type.icon"
                :size="16"
                :stroke-width="1.5"
                class="mr-1"
              />
              {{ type.label }}
            </el-button>
            <el-divider direction="vertical" />
            <el-button size="small" @click="() => onAddNode('sticky')">
              <component
                :is="StickyNoteIcon"
                :size="16"
                :stroke-width="1.5"
                class="mr-1"
              />
              便利貼
            </el-button>
            <el-button size="small" @click="autoLayout">
              <component
                :is="Layout"
                :size="16"
                :stroke-width="1.5"
                class="mr-1"
              />
              自動布局
            </el-button>
            <el-button size="small" @click="generateMockData">
              <component
                :is="Database"
                :size="16"
                :stroke-width="1.5"
                class="mr-1"
              />
              模擬數據
            </el-button>
            <el-button size="small" @click="showJsonDrawer = true">
              <component
                :is="FileJson"
                :size="16"
                :stroke-width="1.5"
                class="mr-1"
              />
              查看JSON
            </el-button>
            <el-button size="small" @click="handleFitView">
              <component
                :is="Maximize"
                :size="16"
                :stroke-width="1.5"
                class="mr-1"
              />
              適應工作區
            </el-button>
            <el-button size="small" @click="handleUndo">
              <component
                :is="Undo2"
                :size="16"
                :stroke-width="1.5"
                class="mr-1"
              />
              撤銷
            </el-button>
            <el-button size="small" @click="handleRedo">
              <component
                :is="Redo2"
                :size="16"
                :stroke-width="1.5"
                class="mr-1"
              />
              重做
            </el-button>
          </div>
        </Panel>

        <!-- JSON 查看抽屜 -->
        <el-drawer
          v-model="showJsonDrawer"
          title="工作流 JSON 數據"
          direction="rtl"
          size="50%"
        >
          <div class="p-4">
            <el-button
              size="small"
              type="primary"
              @click="copyJson"
              class="mb-4"
            >
              複製 JSON
            </el-button>
            <pre
              class="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[calc(100vh-200px)]"
            ><code>{{ JSON.stringify(elements, null, 2) }}</code></pre>
          </div>
        </el-drawer>

        <!-- 線條刪除按鈕 -->
        <!-- <template #edge-label="props">
          <div
            class="edge-button-wrapper"
            :class="{ 'opacity-100': props.selected }"
          >
            <el-button
              circle
              size="large"
              type="danger"
              class="edge-delete-button"
              @click="deleteEdge(props.id)"
              @mousedown.stop
              @click.stop
            >
              <X :size="16" />
            </el-button>
          </div>
        </template> -->

        <template #edge-button="buttonEdgeProps">
          <EdgeWithButton
            v-bind="buttonEdgeProps"
            :source="buttonEdgeProps.source"
            :target="buttonEdgeProps.target"
            :selected="buttonEdgeProps.selected"
            :animated="buttonEdgeProps.animated"
            :label="buttonEdgeProps.label"
          />
        </template>
        <template #edge-custom="props">
          <CustomEdge v-bind="props" />
        </template>
      </VueFlow>
    </div>

    <NodeConfigPanel
      v-if="selectedNode"
      :selected-node="selectedNode"
      @update:node="updateNode"
      @close="selectedNode = null"
      class="border-l"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
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
import { NODE_TYPES } from "./config/nodeTypes";
import {
  Layout,
  StickyNote as StickyNoteIcon,
  X,
  Database,
  FileJson,
  Maximize,
  Undo2,
  Redo2,
} from "lucide-vue-next";
import dagre from "@dagrejs/dagre";
import { ElMessageBox, ElMessage } from "element-plus";

import CustomNode from "./nodes/CustomNode.vue";
import StickyNote from "./nodes/StickyNote.vue";
import NodeConfigPanel from "./NodeConfigPanel.vue";
import CustomEdge from "./nodes/CustomEdge.vue";
import EdgeWithButton from "./nodes/EdgeWithButton.vue";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";

// 註冊自定義節點類型
const nodeTypes = {
  custom: CustomNode,
  sticky: StickyNote,
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

const elements = ref([]);
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
} = useVueFlow({
  defaultEdgeOptions,
  edgesUpdatable: true,
  edgesDraggable: true,
  edgesFocusable: true,
  selectNodesOnDrag: false,
  elevateEdgesOnSelect: true,
});
const selectedNode = ref(null);
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
  dragStartPosition.value = { ...node.position };
};

// 節點拖動結束時記錄位置變化
const onNodeDragStop = (event) => {
  const { node } = event;
  if (dragStartPosition.value) {
    recordAction(ActionTypes.NODE_MOVED, {
      id: node.id,
      oldPosition: dragStartPosition.value,
      newPosition: { ...node.position },
    });
    dragStartPosition.value = null;
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

  setTimeout(handleFitView, 100);
};

const onNodeClick = (event) => {
  selectedNode.value = event.node;
};

const onPaneClick = () => {
  selectedNode.value = null;
};

const onAddNode = (type) => {
  // 找出當前最小的 zIndex
  const minZIndex = Math.min(
    ...elements.value
      .filter((el) => !el.source) // 只考慮節點，不考慮連線
      .map((el) => el.zIndex || 0)
  );
  const id = `node_${Date.now()}`;
  const newNode = {
    id,
    type: type === "sticky" ? "sticky" : "custom",
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
  };

  // 先記錄動作
  recordAction(ActionTypes.NODE_ADDED, {
    node: newNode,
    elements: elements.value, // 保存當前狀態
  });

  // 再更新畫布
  elements.value = [...elements.value, newNode];
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
  }
};

// 連接處理函數
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
    class: "vue-flow__edge",
  };

  elements.value = [...elements.value, newEdge];
  recordAction(ActionTypes.EDGE_ADDED, { edge: newEdge });
};

// 刪除線條
const deleteEdge = (edgeId) => {
  ElMessageBox.confirm("確定要刪除這條連接線嗎？", "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 先保存要刪除的邊以供撤銷使用
      const edgeToRemove = elements.value.find((el) => el.id === edgeId);
      if (!edgeToRemove) {
        ElMessage({
          type: "error",
          message: "找不到要刪除的連接線",
        });
        return;
      }

      // 記錄刪除操作
      recordAction(ActionTypes.EDGE_REMOVED, {
        edge: edgeToRemove,
      });

      // 更新元素列表
      elements.value = elements.value.filter((el) => el.id !== edgeId);

      ElMessage({
        type: "success",
        message: "已刪除連接線",
      });
    })
    .catch(() => {
      // 用戶取消刪除操作
    });
};
const onEdgeUpdateStart = (event) => {
  console.log("onEdgeUpdateStart", event);
};
const onEdgeUpdateEnd = (event) => {
  console.log("onEdgeUpdateEnd", event);
};
// 線條更新事件

const onEdgeUpdate = (oldEdge, newConnection) => {
  if (!oldEdge || !newConnection) {
    console.warn("更新線條時缺少必要參數");
    return;
  }

  console.log("Updating edge:", { oldEdge, newConnection });

  try {
    // 直接使用 updateEdge 方法
    const success = updateEdge(oldEdge, newConnection);

    if (success) {
      // 更新成功後，更新本地狀態
      elements.value = elements.value.map((el) => {
        if (el.id === oldEdge.id) {
          return {
            ...el,
            source: newConnection.source,
            target: newConnection.target,
            sourceHandle: newConnection.sourceHandle,
            targetHandle: newConnection.targetHandle,
          };
        }
        return el;
      });

      // 記錄更新操作
      recordAction(ActionTypes.EDGE_UPDATED, {
        oldEdge,
        newEdge: elements.value.find((el) => el.id === oldEdge.id),
      });

      ElMessage({
        type: "success",
        message: "已更新連線位置",
      });
    } else {
      throw new Error("更新邊線失敗");
    }
  } catch (error) {
    console.error("更新邊線時發生錯誤:", error);
    ElMessage({
      type: "error",
      message: "更新連線失敗",
    });
  }
};

// 線條點擊事件
const onEdgeClick = (event) => {
  // 可以在這裡添加其他線條點擊相關的邏輯
};

// 生成隨機節點數據
const generateMockData = () => {
  // 清空現有數據
  elements.value = [];

  // 生成 5-10 個隨機節點
  const nodeCount = Math.floor(Math.random() * 6) + 5;
  const mockNodes = [];
  const nodeTypes = Object.values(NODE_TYPES);

  // 生成隨機節點
  for (let i = 0; i < nodeCount; i++) {
    const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
    const node = {
      id: `node_${Date.now()}_${i}`,
      type: "custom",
      data: {
        type: type.type,
        content: `${type.label}_${Math.floor(Math.random() * 1000)}`,
        status: "IDLE",
        config: { ...type.defaultConfig },
      },
      position: {
        x: Math.random() * 800,
        y: Math.random() * 600,
      },
    };
    mockNodes.push(node);
  }

  // 生成隨機連接線
  const mockEdges = [];
  const edgeCount = Math.floor(Math.random() * (nodeCount - 2)) + 2;

  for (let i = 0; i < edgeCount; i++) {
    const sourceNode = mockNodes[Math.floor(Math.random() * mockNodes.length)];
    const targetNode = mockNodes[Math.floor(Math.random() * mockNodes.length)];

    const edgeTypes = ["step", "button"];
    const edgeType = edgeTypes[Math.floor(Math.random() * edgeTypes.length)];
    // 避免自己連接自己
    if (sourceNode.id !== targetNode.id) {
      const edge = {
        id: `edge_${Date.now()}_${i}`,
        source: sourceNode.id,
        target: targetNode.id,
        label: edgeType,
        class: "normal-edge",
        type: "button",
        animated: true,
        markerEnd: defaultEdgeOptions.markerEnd,
      };
      mockEdges.push(edge);
    }
  }

  // 更新畫布
  elements.value = [...mockNodes, ...mockEdges];

  // 自動布局
  setTimeout(() => {
    autoLayout();
  }, 100);

  // 顯示提示
  ElMessage({
    type: "success",
    message: `已生成 ${mockNodes.length} 個節點和 ${mockEdges.length} 條連接線`,
  });
};

// 複製 JSON 到剪貼簿
const copyJson = () => {
  const json = JSON.stringify(elements.value, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    ElMessage({
      type: "success",
      message: "已複製到剪貼簿",
    });
  });
};

// 修改適應工作區功能
const handleFitView = () => {
  fitView({
    padding: 50,
    maxZoom: 1,
    minZoom: 0.8,
    duration: 150,
    includeHiddenNodes: true,
  });
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
};

// 監聽鍵盤事件
onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
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
</style>
