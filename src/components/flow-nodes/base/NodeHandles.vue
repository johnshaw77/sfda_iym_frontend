<!-- 節點連接點系統組件 -->
<template>
  <div class="node-handles">
    <!-- 輸入連接點 -->
    <template v-for="handle in inputs" :key="handle.id">
      <Handle
        :id="handle.id"
        :type="handle.type"
        :position="handle.position"
        :class="[
          'handle',
          `handle-${handle.position}`,
          {
            'handle-connected': isHandleConnected(handle.id),
            'handle-input': true,
          },
        ]"
      >
        <span v-if="showLabels" class="handle-label">{{
          handle.label || handle.id
        }}</span>
      </Handle>
    </template>

    <!-- 輸出連接點 -->
    <template v-for="handle in outputs" :key="handle.id">
      <Handle
        :id="handle.id"
        :type="handle.type"
        :position="handle.position"
        :class="[
          'handle',
          `handle-${handle.position}`,
          {
            'handle-connected': isHandleConnected(handle.id),
            'handle-output': true,
          },
        ]"
      >
        <span v-if="showLabels" class="handle-label">{{
          handle.label || handle.id
        }}</span>
      </Handle>
    </template>
  </div>
</template>

<script setup>
import { Handle } from "@vue-flow/core";
import { computed } from "vue";
import { useVueFlow } from "@vue-flow/core";

const props = defineProps({
  nodeId: {
    type: String,
    required: true,
  },
  nodeType: {
    type: String,
    default: "default",
  },
  inputs: {
    type: Array,
    default: () => [],
  },
  outputs: {
    type: Array,
    default: () => [],
  },
  showLabels: {
    type: Boolean,
    default: false,
  },
});

const { edges } = useVueFlow();

const isHandleConnected = (handleId) => {
  return edges.value.some(
    (edge) =>
      (edge.source === props.nodeId && edge.sourceHandle === handleId) ||
      (edge.target === props.nodeId && edge.targetHandle === handleId)
  );
};
</script>

<style scoped>
.node-handles {
  @apply absolute inset-0 pointer-events-none;
}

.handle {
  @apply w-3 h-3 rounded-full bg-gray-400 border-2 border-white transition-all duration-200 pointer-events-auto;
}

.handle:hover {
  @apply scale-125 bg-blue-500;
}

.handle-connected {
  @apply bg-green-500;
}

/* 輸入連接點樣式（箭頭） */
.handle-input {
  @apply bg-blue-500;
}

/* 輸出連接點樣式（圓形） */
.handle-output {
  @apply bg-green-500;
}

/* 位置相關樣式 */
.handle-left {
  @apply left-0 top-1/2 -translate-x-1/2 -translate-y-1/2;
}

.handle-right {
  @apply right-0 top-1/2 translate-x-1/2 -translate-y-1/2;
}

.handle-top {
  @apply top-0 left-1/2 -translate-x-1/2 -translate-y-1/2;
}

.handle-bottom {
  @apply bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2;
}

.handle-label {
  @apply absolute whitespace-nowrap text-xs text-gray-600 pointer-events-none;
  left: 50%;
  transform: translateX(-50%);
}

.handle-left .handle-label {
  @apply -left-1 translate-x-0;
}

.handle-right .handle-label {
  @apply -right-1 translate-x-0;
}

.handle-top .handle-label {
  @apply -top-5;
}

.handle-bottom .handle-label {
  @apply -bottom-5;
}
</style>
