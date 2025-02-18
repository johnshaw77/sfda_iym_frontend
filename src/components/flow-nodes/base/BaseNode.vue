<template>
  <div
    class="flow-node"
    :class="[`flow-node--${status}`, { 'flow-node--selected': selected }]"
    :style="{
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
    }"
    @click="handleNodeClick"
  >
    <!-- 標題區域 -->
    <div class="flow-node__header">
      <slot name="icon">
        <component :is="icon" :size="16" class="flow-node__icon" />
      </slot>
      <div class="flow-node__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <slot name="header-actions" />
    </div>

    <!-- 描述區域（可選） -->
    <div
      v-if="description || $slots.description"
      class="flow-node__description"
    >
      <slot name="description">{{ description }}</slot>
    </div>

    <!-- 主要內容區域 -->
    <div class="flow-node__content">
      <slot />
    </div>

    <!-- 底部區域（可選） -->
    <div v-if="$slots.footer" class="flow-node__footer">
      <slot name="footer" />
    </div>

    <!-- 連接點 -->
    <NodeHandles
      :inputs="processedInputs"
      :outputs="processedOutputs"
      @handle-connect="handleConnect"
      @handle-disconnect="handleDisconnect"
      @handle-click="handleHandleClick"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Component } from "lucide-vue-next";
import NodeHandles from "./NodeHandles.vue";

const props = defineProps({
  // 節點基本資訊
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  icon: {
    type: [String, Object],
    default: () => Component,
  },

  // 節點狀態
  status: {
    type: String,
    default: "default",
    validator: (value) =>
      ["default", "processing", "success", "error"].includes(value),
  },
  selected: {
    type: Boolean,
    default: false,
  },

  // 節點樣式
  style: {
    type: Object,
    default: () => ({
      backgroundColor: "#ffffff",
      borderColor: "#64748b",
    }),
  },

  // 連接點配置
  handles: {
    type: Object,
    default: () => ({
      inputs: [],
      outputs: [],
    }),
    validator: (value) => {
      return (
        typeof value === "object" &&
        Array.isArray(value.inputs) &&
        Array.isArray(value.outputs)
      );
    },
  },
});

// 事件
const emit = defineEmits([
  "click",
  "handle-connect",
  "handle-disconnect",
  "handle-click",
]);

// 處理節點點擊
const handleNodeClick = (event) => {
  emit("click", event);
};

// 處理連接點事件
const handleConnect = (data) => {
  emit("handle-connect", data);
};

const handleDisconnect = (data) => {
  emit("handle-disconnect", data);
};

const handleHandleClick = (data) => {
  emit("handle-click", data);
};

// 處理連接點位置計算
const processedInputs = computed(() => {
  return props.handles.inputs.map((input, index) => ({
    ...input,
    position: calculatePosition(index, props.handles.inputs.length),
  }));
});

const processedOutputs = computed(() => {
  return props.handles.outputs.map((output, index) => ({
    ...output,
    position: calculatePosition(index, props.handles.outputs.length),
  }));
});

// 計算連接點位置
const calculatePosition = (index, total) => {
  if (total === 1) return 50;
  if (total === 2) return index === 0 ? 30 : 70;
  const step = 100 / (total + 1);
  return step * (index + 1);
};
</script>

<style lang="scss" scoped>
.flow-node {
  @apply relative rounded-lg border p-3 shadow-sm transition-all duration-200;
  min-width: 200px;
  max-width: 320px;

  // 狀態樣式
  &--default {
    @apply border-slate-300;
  }

  &--processing {
    @apply border-blue-400;
  }

  &--success {
    @apply border-green-400;
  }

  &--error {
    @apply border-red-400;
  }

  // 選中狀態
  &--selected {
    @apply ring-2 ring-blue-500 ring-offset-2;
  }

  // 標題區域
  &__header {
    @apply flex items-center space-x-2 mb-2;
  }

  &__icon {
    @apply flex-shrink-0 text-gray-500;
  }

  &__title {
    @apply flex-1 font-medium text-gray-900 truncate;
  }

  // 描述區域
  &__description {
    @apply text-sm text-gray-500 mb-3;
  }

  // 內容區域
  &__content {
    @apply relative;
  }

  // 底部區域
  &__footer {
    @apply mt-3 pt-3 border-t border-gray-100;
  }

  // 懸停效果
  &:hover:not(&--selected) {
    @apply shadow-md;
  }
}
</style>
