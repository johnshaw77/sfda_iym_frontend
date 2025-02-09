<template>
  <div class="h-full bg-slate-50">
    <VueFlow
      v-model="elements"
      class="h-full"
      :default-zoom="1.5"
      :min-zoom="0.2"
      :max-zoom="4"
    >
      <Background pattern-color="#aaa" gap="8" />
      <MiniMap />
      <Controls />
    </VueFlow>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { VueFlow, Background, MiniMap, Controls } from "@vue-flow/core";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";

defineOptions({
  name: "WorkflowTest",
});

// 初始節點和連線
const elements = ref([
  {
    id: "1",
    type: "input",
    label: "開始節點",
    position: { x: 0, y: 0 },
    class: "light",
  },
  {
    id: "2",
    type: "default",
    label: "處理節點",
    position: { x: 100, y: 100 },
    class: "light",
  },
  {
    id: "3",
    type: "output",
    label: "結束節點",
    position: { x: 200, y: 200 },
    class: "light",
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
</script>

<style scoped>
:deep(.vue-flow__node) {
  @apply px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm;
}

:deep(.vue-flow__node.light) {
  @apply bg-white text-gray-800;
}

:deep(.vue-flow__edge-path) {
  @apply stroke-2 stroke-gray-400;
}

:deep(.vue-flow__minimap) {
  @apply rounded-lg border border-gray-200 bg-white;
}

:deep(.vue-flow__controls) {
  @apply rounded-lg border border-gray-200 bg-white shadow-sm;
}

:deep(.vue-flow__controls-button) {
  @apply border-gray-200 hover:bg-gray-50;
}
</style>
