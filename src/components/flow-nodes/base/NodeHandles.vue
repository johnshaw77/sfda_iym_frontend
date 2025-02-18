<template>
  <div class="node-handles">
    <!-- 輸入端口 -->
    <div v-if="inputs.length > 0" class="node-handles__inputs">
      <div
        v-for="input in inputs"
        :key="input.id"
        class="node-handles__handle node-handles__handle--input"
        :class="{
          'node-handles__handle--required': input.required,
          'node-handles__handle--connected': input.connected,
        }"
        :style="{ top: `${input.position}%` }"
      >
        <el-tooltip
          :content="input.description || input.id"
          placement="left"
          :show-after="300"
        >
          <div class="node-handles__handle-point" />
        </el-tooltip>
      </div>
    </div>

    <!-- 輸出端口 -->
    <div v-if="outputs.length > 0" class="node-handles__outputs">
      <div
        v-for="output in outputs"
        :key="output.id"
        class="node-handles__handle node-handles__handle--output"
        :class="{
          'node-handles__handle--connected': output.connected,
        }"
        :style="{ top: `${output.position}%` }"
      >
        <el-tooltip
          :content="output.description || output.id"
          placement="right"
          :show-after="300"
        >
          <div class="node-handles__handle-point" />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  // 輸入端口配置
  inputs: {
    type: Array,
    default: () => [],
    validator: (value) => {
      return value.every((input) => {
        return (
          typeof input === "object" && "id" in input && "position" in input
        );
      });
    },
  },
  // 輸出端口配置
  outputs: {
    type: Array,
    default: () => [],
    validator: (value) => {
      return value.every((output) => {
        return (
          typeof output === "object" && "id" in output && "position" in output
        );
      });
    },
  },
});

// 事件
const emit = defineEmits([
  "handle-connect", // 當連接建立時
  "handle-disconnect", // 當連接斷開時
  "handle-click", // 當端口被點擊時
]);
</script>

<style lang="scss" scoped>
.node-handles {
  @apply absolute inset-0 pointer-events-none;

  // 輸入端口容器
  &__inputs {
    @apply absolute left-0 top-0 h-full;
    width: 20px;
    transform: translateX(-50%);
  }

  // 輸出端口容器
  &__outputs {
    @apply absolute right-0 top-0 h-full;
    width: 20px;
    transform: translateX(50%);
  }

  // 端口基本樣式
  &__handle {
    @apply absolute left-1/2 -translate-x-1/2 pointer-events-auto;
    width: 20px;
    height: 20px;

    // 端口連接點
    &-point {
      @apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2;
      @apply w-3 h-3 rounded-full border-2 border-gray-400 bg-white;
      @apply transition-all duration-200;
    }

    // 輸入端口特殊樣式
    &--input {
      .node-handles__handle-point {
        @apply border-blue-400;
      }

      &.node-handles__handle--required .node-handles__handle-point {
        @apply border-red-400;
      }
    }

    // 輸出端口特殊樣式
    &--output {
      .node-handles__handle-point {
        @apply border-green-400;
      }
    }

    // 已連接狀態
    &--connected {
      .node-handles__handle-point {
        @apply bg-gray-100;
      }
    }

    // 懸停效果
    &:hover {
      .node-handles__handle-point {
        @apply scale-125;
      }
    }
  }
}
</style>
