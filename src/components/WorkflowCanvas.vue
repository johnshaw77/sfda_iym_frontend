<template>
  <div class="workflow-canvas">
    <VueFlow
      v-model="elements"
      :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      :min-zoom="0.2"
      :max-zoom="4"
      class="vue-flow-container"
      :default-edges="{ type: 'smoothstep' }"
    >
      <Background pattern-color="#aaa" gap="8" />
      <MiniMap />
      <Controls />
      <Panel position="top-right" class="node-panel">
        <div class="node-types">
          <div
            v-for="type in nodeTypes"
            :key="type.type"
            class="node-type-item"
            :class="[`node-type-${type.type}`]"
            @click="addNode(type)"
          >
            <font-awesome-icon :icon="type.icon" class="mr-2" />
            {{ type.label }}
          </div>
        </div>
      </Panel>

      <template #node-custom="nodeProps">
        <div
          :class="['custom-node', `node-type-${nodeProps.data.type}`]"
          @click="handleNodeClick(nodeProps)"
        >
          <div class="custom-node-header">
            <font-awesome-icon
              :icon="getNodeIcon(nodeProps.data.type)"
              class="mr-2"
            />
            {{ nodeProps.data.label }}
          </div>
          <div class="custom-node-body">
            {{ nodeProps.data.content }}
          </div>
        </div>
      </template>
    </VueFlow>
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

// 只引入核心樣式
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";

const { onNodeClick, addNodes } = useVueFlow();

// 節點類型定義
const nodeTypes = [
  { type: "input", label: "數據輸入", icon: faFileUpload },
  { type: "process", label: "數據處理", icon: faGears },
  { type: "analysis", label: "數據分析", icon: faChartLine },
  { type: "chart", label: "圖表展示", icon: faTable },
  { type: "result", label: "分析結果", icon: faClipboardCheck },
];

// 獲取節點圖標
const getNodeIcon = (type) => {
  const nodeType = nodeTypes.find((t) => t.type === type);
  return nodeType ? nodeType.icon : faGears;
};

// 添加新節點
const addNode = (type) => {
  const position = { x: 100, y: 100 };
  const newNode = {
    id: `${type.type}-${Date.now()}`,
    type: "custom",
    position,
    data: {
      type: type.type,
      label: type.label,
      content: `新的${type.label}節點`,
    },
  };
  addNodes([newNode]);
};

const handleNodeClick = (nodeProps) => {
  console.log("Node clicked:", nodeProps);
};

// 模擬節點數據
const elements = ref([
  // 數據輸入節點
  {
    id: "input1",
    type: "custom",
    position: { x: 100, y: 100 },
    data: {
      type: "input",
      label: "原始數據輸入",
      content: "上傳製程數據文件",
    },
  },
  // 數據預處理節點
  {
    id: "process1",
    type: "custom",
    position: { x: 400, y: 50 },
    data: {
      type: "process",
      label: "數據預處理",
      content: "清洗和標準化數據",
    },
  },
  // 統計分析節點
  {
    id: "analysis1",
    type: "custom",
    position: { x: 400, y: 200 },
    data: {
      type: "analysis",
      label: "製程分析",
      content: "分析製程參數影響",
    },
  },
  // 圖表節點
  {
    id: "chart1",
    type: "custom",
    position: { x: 700, y: 50 },
    data: {
      type: "chart",
      label: "趨勢圖表",
      content: "良率趨勢分析",
    },
  },
  // 結果節點
  {
    id: "result1",
    type: "custom",
    position: { x: 700, y: 200 },
    data: {
      type: "result",
      label: "分析結果",
      content: "關鍵影響因素報告",
    },
  },
  // 連接
  {
    id: "e1-2",
    source: "input1",
    target: "process1",
    animated: true,
    type: "smoothstep",
  },
  {
    id: "e1-3",
    source: "input1",
    target: "analysis1",
    animated: true,
    type: "smoothstep",
  },
  {
    id: "e2-4",
    source: "process1",
    target: "chart1",
    animated: true,
    type: "smoothstep",
  },
  {
    id: "e3-5",
    source: "analysis1",
    target: "result1",
    animated: true,
    type: "smoothstep",
  },
]);
</script>

<style>
.workflow-canvas {
  @apply w-full h-full relative;
}

.vue-flow-container {
  @apply w-full h-full;
}

.custom-node {
  @apply bg-white rounded-lg shadow-md p-4 min-w-[180px] cursor-pointer hover:shadow-lg transition-shadow;
}

.custom-node-header {
  @apply text-lg font-bold mb-2 flex items-center;
}

.custom-node-body {
  @apply text-sm;
}

.node-panel {
  @apply bg-white rounded-lg shadow-lg p-4;
}

.node-types {
  @apply space-y-2;
}

.node-type-item {
  @apply flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors;
}

/* 不同類型節點的樣式 */
.node-type-input {
  @apply border-l-4 border-blue-500;
}

.node-type-process {
  @apply border-l-4 border-green-500;
}

.node-type-analysis {
  @apply border-l-4 border-purple-500;
}

.node-type-chart {
  @apply border-l-4 border-yellow-500;
}

.node-type-result {
  @apply border-l-4 border-red-500;
}

/* Vue Flow 自定義樣式 */
:root {
  --vf-node-color: transparent;
  --vf-connection-color: #64748b;
  --vf-handle-color: #64748b;
}

.vue-flow__edge-path {
  stroke: var(--vf-connection-color);
  stroke-width: 2;
}

.vue-flow__handle {
  background: var(--vf-handle-color);
}

.vue-flow__background {
  background: #f8fafc;
}

.vue-flow__minimap {
  background-color: #fff;
}

.vue-flow__controls {
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
}

.vue-flow__controls button {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.vue-flow__controls button:hover {
  background: #f8fafc;
}
</style>
