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
import { computed, onMounted } from "vue";
import { useVueFlow } from "@vue-flow/core";

const props = defineProps({
  // 節點ID
  nodeId: {
    type: String,
    required: true,
  },
  // 節點類型
  nodeType: {
    type: String,
    default: "default",
  },
  // 節點連接點配置
  inputs: {
    type: Array,
    default: () => [],
  },
  // 節點輸出連接點配置
  outputs: {
    type: Array,
    default: () => [],
  },
  // 是否顯示連接點標籤
  showLabels: {
    type: Boolean,
    default: false,
  },
});

const { edges } = useVueFlow();

/**
 * 判斷連接點是否已連接
 * @param {string} handleId - 連接點ID
 * @returns {boolean} - 是否已連接
 */
const isHandleConnected = (handleId) => {
  return edges.value.some(
    (edge) =>
      (edge.source === props.nodeId && edge.sourceHandle === handleId) ||
      (edge.target === props.nodeId && edge.targetHandle === handleId)
  );
};

onMounted(() => {});
</script>

<style scoped>
.node-handles {
  @apply absolute inset-0 pointer-events-none;
}

.handle {
  @apply transition-all duration-200 pointer-events-auto;
}

.handle:hover {
  @apply scale-125 bg-gray-500;
}

.handle-connected {
  @apply bg-green-500;
}

/* 輸入連接點樣式（方形） */
.handle-input {
  @apply !w-3 !h-8 bg-gray-500 rounded-none;
}

/* 輸出連接點樣式（圓形） */
.handle-output {
  @apply !w-4 !h-4 bg-gray-500 rounded-full;
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
