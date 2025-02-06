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
        @nodeClick="onNodeClick"
      >
        <Background pattern-color="#aaa" gap="8" />
        <MiniMap />
        <Controls />
        <Panel position="top-right" class="bg-white p-2 rounded shadow-md">
          <div class="flex space-x-2">
            <button
              v-for="type in availableNodeTypes"
              :key="type.type"
              class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              @click="() => onAddNode(type)"
            >
              <font-awesome-icon :icon="type.icon" class="mr-2" />
              {{ type.label }}
            </button>
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
import { VueFlow, useVueFlow, Panel } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import { Controls } from "@vue-flow/controls";
import {
  faFileUpload,
  faGears,
  faChartLine,
  faTable,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";

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

// 可用的節點類型
const availableNodeTypes = [
  { type: "input", label: "數據輸入", icon: faFileUpload },
  { type: "process", label: "數據處理", icon: faGears },
  { type: "analysis", label: "數據分析", icon: faChartLine },
  { type: "visualization", label: "數據可視化", icon: faTable },
  { type: "output", label: "輸出結果", icon: faClipboardCheck },
];

const elements = ref([
  {
    id: "1",
    type: "custom",
    data: {
      type: "input",
      label: "數據輸入",
      content: "上傳製程數據",
    },
    position: { x: 250, y: 0 },
  },
  {
    id: "2",
    type: "custom",
    data: {
      type: "analysis",
      label: "數據分析",
      content: "分析製程參數",
    },
    position: { x: 250, y: 150 },
  },
  {
    id: "3",
    type: "custom",
    data: {
      type: "output",
      label: "分析結果",
      content: "生成報告",
    },
    position: { x: 250, y: 300 },
  },
  {
    id: "e1-2",
    source: "1",
    target: "2",
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
  },
]);

const { project } = useVueFlow();
const selectedNode = ref(null);

const onNodeClick = (event) => {
  selectedNode.value = event.node;
};

const onAddNode = (type) => {
  const newNode = {
    id: `${Date.now()}`,
    type: "custom",
    data: {
      type: type.type,
      label: type.label,
      content: `新的${type.label}`,
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
</style>
