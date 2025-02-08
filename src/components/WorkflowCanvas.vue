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
        :default-edge-options="defaultEdgeOptions"
        :auto-connect="true"
        :edges-updatable="true"
        :edges-draggable="true"
        :edges-deletable="true"
        @nodeClick="onNodeClick"
        @connect="onConnect"
        @paneClick="onPaneClick"
        @edgeClick="onEdgeClick"
        @edgeUpdate="onEdgeUpdate"
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
        <template #edge-label="props">
          <div class="edge-button-wrapper">
            <el-button
              circle
              size="small"
              type="danger"
              class="edge-delete-button !bg-white hover:!bg-red-50"
              @click="deleteEdge(props.id)"
              @mousedown.stop
              @click.stop
            >
              <X :size="12" />
            </el-button>
          </div>
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
import { VueFlow, useVueFlow, Panel, Position } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import { Controls } from "@vue-flow/controls";
import { NODE_TYPES } from "../config/nodeTypes";
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

import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";

// 註冊自定義節點類型
const nodeTypes = {
  custom: CustomNode,
  sticky: StickyNote,
};

// 設置默認的連接線選項
const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: {
    strokeWidth: 2,
    stroke: "#3f3f3f",
  },
  markerEnd: {
    type: "arrowclosed",
    color: "#3f3f3f",
  },
  updatable: true,
};

const elements = ref([]);
const { project, fitView, nodes, edges, viewport, getZoom } = useVueFlow();
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
  LAYOUT_CHANGED: "LAYOUT_CHANGED",
  MULTIPLE_CHANGES: "MULTIPLE_CHANGES",
};

// 記錄單個操作
const recordAction = (type, data) => {
  console.log("recordAction", type, data);
  if (!history.value.isRecording) return;

  const action = {
    type,
    data,
    timestamp: Date.now(),
  };

  history.value.past.push(action);
  history.value.future = [];
  console.log("history", history.value);
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

  const newNode = {
    id: `node_${Date.now()}`,
    type: type === "sticky" ? "sticky" : "custom",
    data:
      type === "sticky"
        ? {
            content: "",
            color: "#fef3c7",
          }
        : {
            type: type.type,
            content: `新的${type.label}`,
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

const onConnect = (connection) => {
  const existingConnection = elements.value.find(
    (el) =>
      el.source === connection.source &&
      el.target === connection.target &&
      el.sourceHandle === connection.sourceHandle &&
      el.targetHandle === connection.targetHandle
  );

  if (!existingConnection) {
    const newConnection = {
      id: `edge_${connection.source}_${connection.sourceHandle}_${connection.target}_${connection.targetHandle}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: "smoothstep",
      animated: true,
      style: defaultEdgeOptions.style,
      markerEnd: defaultEdgeOptions.markerEnd,
    };
    recordAction(ActionTypes.EDGE_ADDED, { edge: newConnection });
  }
};

// 刪除線條
const deleteEdge = (edgeId) => {
  ElMessageBox.confirm("確定要刪除這條連接線嗎？", "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const newElements = elements.value.filter((el) => el.id !== edgeId);
      recordAction(ActionTypes.EDGE_REMOVED, {
        edge: elements.value.find((el) => el.id === edgeId),
      });
      ElMessage({
        type: "success",
        message: "已刪除連接線",
      });
    })
    .catch(() => {});
};

// 線條更新事件
const onEdgeUpdate = (oldEdge, newConnection) => {
  const edge = elements.value.find((el) => el.id === oldEdge.id);
  if (edge) {
    const index = elements.value.indexOf(edge);
    const newEdge = {
      ...edge,
      source: newConnection.source,
      target: newConnection.target,
      sourceHandle: newConnection.sourceHandle,
      targetHandle: newConnection.targetHandle,
    };
    elements.value.splice(index, 1, newEdge);
    elements.value = [...elements.value];
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

    // 避免自己連接自己
    if (sourceNode.id !== targetNode.id) {
      const edge = {
        id: `edge_${Date.now()}_${i}`,
        source: sourceNode.id,
        target: targetNode.id,
        type: "smoothstep",
        animated: true,
        style: defaultEdgeOptions.style,
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
  console.log("handleUndo", history.value);
  if (history.value.past.length === 0) return;

  const action = history.value.past.pop();
  console.log("action", action);
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

/* 只為一般節點設置樣式，不包括便利貼 */
.vue-flow__node[data-type="custom"] {
  @apply px-4 py-2 rounded-lg shadow-md bg-white border-2 border-gray-200;
}

.vue-flow__node[data-type="custom"].selected {
  @apply border-blue-500;
}

.vue-flow__edge {
  @apply stroke-gray-600;
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
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

.edge-button-wrapper {
  @apply flex items-center justify-center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.vue-flow__edge:hover .edge-button-wrapper {
  opacity: 1;
}

.edge-delete-button {
  @apply !w-5 !h-5 !p-0 !border !border-red-200;
}

:deep(.edge-delete-button .el-icon) {
  @apply !w-3 !h-3;
}
</style>
