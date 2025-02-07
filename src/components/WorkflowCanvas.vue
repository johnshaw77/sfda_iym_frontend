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
        fit-view-on-init
        @nodeClick="onNodeClick"
        @connect="onConnect"
        @paneClick="onPaneClick"
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
          </div>
        </Panel>
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
import { ref } from "vue";
import { VueFlow, useVueFlow, Panel, Position } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import { Controls } from "@vue-flow/controls";
import { NODE_TYPES } from "../config/nodeTypes";
import { Layout, StickyNote as StickyNoteIcon } from "lucide-vue-next";
import dagre from "@dagrejs/dagre";

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
  },
  markerEnd: {
    type: "arrowclosed",
    color: "#b1b1b7",
  },
};

const elements = ref([]);
const { project, fitView, getNodes, getEdges, setNodes } = useVueFlow();
const selectedNode = ref(null);

// 自動布局功能
const autoLayout = () => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 100 });
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

  setTimeout(() => {
    fitView({ padding: 50 });
  }, 100);
};

const onNodeClick = (event) => {
  selectedNode.value = event.node;
};

const onPaneClick = () => {
  selectedNode.value = null;
};

const onAddNode = (type) => {
  const newNode = {
    id: `node_${Date.now()}`,
    type: type === "sticky" ? "sticky" : "custom",
    data:
      type === "sticky"
        ? {
            content: "",
            color: "#fef3c7",
            zIndex: 0,
          }
        : {
            type: type.type,
            content: `新的${type.label}`,
            status: "IDLE",
            config: { ...type.defaultConfig },
          },
    position: project({ x: 100, y: 100 }),
    zIndex: type === "sticky" ? 0 : 1,
  };
  elements.value = [...elements.value, newNode];
};

const updateNode = (updatedNode) => {
  const index = elements.value.findIndex((el) => el.id === updatedNode.id);
  if (index !== -1) {
    elements.value[index] = updatedNode;
    elements.value = [...elements.value];
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
    elements.value = [...elements.value, newConnection];
  }
};
</script>

<style scoped>
.vue-flow {
  @apply bg-gray-50;
}

.vue-flow__node {
  @apply px-4 py-2 rounded-lg shadow-md bg-white border-2 border-gray-200;
}

.vue-flow__node.selected {
  @apply border-blue-500;
}

.vue-flow__edge {
  @apply stroke-gray-400;
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
}

:deep(.vue-flow__edge-text) {
  font-size: 12px;
}

:deep(.vue-flow__edge-textbg) {
  fill: white;
}

:deep(.vue-flow__edge-path) marker {
  fill: #b1b1b7;
  stroke: none;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) marker {
  fill: #3b82f6;
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}
</style>
