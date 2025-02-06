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

import CustomNode from "./nodes/CustomNode.vue";
import NodeConfigPanel from "./NodeConfigPanel.vue";

import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";

// 註冊自定義節點類型
const nodeTypes = {
  custom: CustomNode,
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
const { project } = useVueFlow();
const selectedNode = ref(null);

const onNodeClick = (event) => {
  selectedNode.value = event.node;
};

const onPaneClick = () => {
  selectedNode.value = null;
};

const onAddNode = (type) => {
  const newNode = {
    id: `node_${Date.now()}`,
    type: "custom",
    data: {
      type: type.type,
      content: `新的${type.label}`,
      status: "IDLE",
      config: { ...type.defaultConfig },
    },
    position: project({ x: 100, y: 100 }),
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
  // 檢查是否已經存在相同的連接
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
