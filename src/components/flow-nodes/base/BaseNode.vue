<!-- 基礎節點組件 -->
<template>
  <div
    class="node-wrapper"
    :class="{
      'border-blue-500 shadow-blue-100': selected,
      'cursor-pointer': !disabled,
      'opacity-50 cursor-not-allowed': disabled,
    }"
    :style="{ width: '100%' }"
  >
    <NodeResizer
      :isVisible="selected"
      class="!border-blue-400"
      :lineStyle="{ borderWidth: '1px' }"
      :handleStyle="{
        width: '16px',
        height: '16px',
        border: '2px solid white',
        transition: 'all 0.2s ease',
        zIndex: '1',
      }"
    />
    <!-- 節點標題 -->
    <div
      class="node-header bg-opacity-30 text-red-700"
      :class="[
        customHeaderClass ||
          headerClasses[nodeType] ||
          'bg-gray-50 border-gray-100',
        { 'cursor-grab': !disabled },
      ]"
      :style="customHeaderStyle"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <component
            :is="icon"
            :class="[iconClasses[nodeType] || 'text-gray-600']"
            :size="16"
          />
          <span class="text-sm font-medium text-gray-700">{{ title }}</span>
        </div>
        <!-- 展開時的摺疊按鈕 -->
        <button
          v-if="isExpanded"
          class="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
          @click="handleToggleExpand"
        >
          <component
            :is="ChevronUp"
            class="text-gray-400 hover:text-gray-600"
            :size="20"
          />
        </button>
      </div>
      <div v-if="description" class="mt-1 text-xs text-gray-500">
        {{ description }}
      </div>
    </div>

    <!-- 節點內容 -->
    <div class="node-content relative" :style="contentStyle">
      <!-- 大圖示區域 -->
      <div
        v-show="!isExpanded"
        ref="iconAreaRef"
        class="icon-area"
        :class="{ 'icon-area-collapsed': !isExpanded }"
        @click="handleToggleExpand"
      >
        <component
          :is="icon"
          :class="[iconClasses[nodeType] || 'text-gray-600']"
          :size="64"
        />
      </div>

      <!-- 可展開的內容區域 -->
      <div
        ref="expandableContentRef"
        class="expandable-content"
        :class="{ 'expandable-content-expanded': isExpanded }"
      >
        <slot></slot>
      </div>
    </div>

    <!-- 節點狀態 -->
    <div v-if="status" class="node-status">
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-500">狀態</span>
        <el-tag
          :type="statusType"
          size="small"
          :class="{ 'animate-pulse': status === 'running' }"
        >
          {{ statusText }}
        </el-tag>
      </div>
    </div>

    <!-- 使用 NodeHandles 組件 -->
    <NodeHandles
      :node-id="id"
      :node-type="nodeType"
      :inputs="defaultHandles.inputs"
      :outputs="defaultHandles.outputs"
      :show-labels="showHandleLabels"
      @connect="handleConnect"
      @disconnect="handleDisconnect"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from "vue";
import NodeHandles from "./NodeHandles.vue";
import { Box, ChevronUp } from "lucide-vue-next";
import { NodeResizer } from "@vue-flow/node-resizer";
import "@vue-flow/node-resizer/dist/style.css";

// 定義 props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  nodeType: {
    type: String,
    default: "http-request",
    validator: (value) =>
      ["custom-input", "custom-process", "http-request"].includes(value),
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  icon: {
    type: Object,
    default: () => Box,
  },
  status: {
    type: String,
    default: "idle",
  },
  selected: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  handles: {
    type: Object,
    default: () => ({
      inputs: [],
      outputs: [],
    }),
  },
  style: {
    type: Object,
    default: () => ({}),
  },
  showHandleLabels: {
    type: Boolean,
    default: false,
  },
  headerBgColor: {
    type: String,
    default: "#F8FAFC", // slate-50
  },
  headerBorderColor: {
    type: String,
    default: "#E2E8F0", // slate-200
  },
  minWidth: {
    type: Number,
    default: 240,
  },
  minHeight: {
    type: Number,
    default: 120,
  },
});

// 定義事件
const emit = defineEmits([
  "click",
  "handle-connect",
  "handle-disconnect",
  "update:data",
]);

// 節點類型樣式映射
const headerClasses = {
  "complaint-selector": "bg-blue-50 border-blue-100",
  "data-input": "bg-blue-50 border-blue-100",
  "data-process": "bg-green-50 border-green-100",
  "data-output": "bg-purple-50 border-purple-100",
  "api-request": "bg-orange-50 border-orange-100",
};

// 圖標顏色映射 TODO:modify this
const iconClasses = {
  "complaint-selector": "text-blue-600",
  "data-input": "text-blue-600",
  "data-process": "text-green-600",
  "data-output": "text-purple-600",
  "api-request": "text-orange-600",
};

// 狀態類型映射
const statusType = computed(() => {
  const typeMap = {
    idle: "info",
    running: "warning",
    completed: "success",
    error: "danger",
  };
  return typeMap[props.status] || "info";
});

// 狀態文字映射
const statusText = computed(() => {
  const textMap = {
    idle: "待執行",
    running: "執行中",
    completed: "已完成",
    error: "錯誤",
  };
  return textMap[props.status] || props.status;
});

// 處理連接事件
const handleConnect = (data) => {
  emit("handle-connect", { id: props.id, ...data });
};

// 處理斷開連接事件
const handleDisconnect = (data) => {
  emit("handle-disconnect", { id: props.id, ...data });
};

const defaultHandles = computed(() => {
  // 如果有傳入 handles，優先使用傳入的設定
  if (props.handles.inputs?.length > 0 || props.handles.outputs?.length > 0) {
    return props.handles;
  }

  const baseHandles = {
    inputs: [
      {
        id: "input",
        position: "left",
        type: "target",
        label: "輸入",
      },
    ],
    outputs: [
      {
        id: "output",
        position: "right",
        type: "source",
        label: "輸出",
      },
    ],
  };

  // 根據節點類型決定顯示哪些連接點
  switch (props.nodeType) {
    case "input":
    case "custom-input":
      return {
        inputs: [],
        outputs: [
          {
            id: "output",
            position: "right",
            type: "source",
            label: "輸出",
          },
        ],
      };
    case "output":
      return {
        inputs: [
          {
            id: "input",
            position: "left",
            type: "target",
            label: "輸入",
          },
        ],
        outputs: [],
      };
    case "process":
    default:
      return baseHandles;
  }
});

// 添加自定義樣式計算屬性
const customHeaderStyle = computed(() => {
  const style = {};
  if (props.headerBgColor) {
    style.backgroundColor = props.headerBgColor;
  }
  if (props.headerBorderColor) {
    style.borderColor = props.headerBorderColor;
  }
  return style;
});

// 添加自定義類名計算屬性
const customHeaderClass = computed(() => {
  if (props.headerBgColor || props.headerBorderColor) {
    return "custom-header";
  }
  return "";
});

// 展開狀態
const isExpanded = ref(false);

// 參考元素
const iconAreaRef = ref(null);
const expandableContentRef = ref(null);
const contentHeight = ref(0);

// 計算內容區域高度
const updateContentHeight = () => {
  if (isExpanded.value) {
    const expandedContent = expandableContentRef.value;
    if (expandedContent) {
      contentHeight.value = expandedContent.scrollHeight;
    }
  } else {
    const iconArea = iconAreaRef.value;
    if (iconArea) {
      contentHeight.value = iconArea.scrollHeight;
    }
  }
};

// 監聽展開狀態變化
watch(isExpanded, () => {
  nextTick(() => {
    updateContentHeight();
  });
});

// 計算內容樣式
const contentStyle = computed(() => ({
  height: `${contentHeight.value}px`,
  transition: "height 0.3s ease-in-out",
}));

// 處理展開/摺疊
const handleToggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

onMounted(() => {
  updateContentHeight();
  // 監聽視窗大小變化
  window.addEventListener("resize", updateContentHeight);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateContentHeight);
});

// 暴露方法
defineExpose({
  // ... existing code ...
});
</script>

<style scoped>
.node-wrapper {
  @apply bg-white rounded-lg border transition-all duration-200 min-w-[200px];
  box-shadow: 0 1px 13px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.node-wrapper:hover {
  @apply shadow-md;
}

.node-wrapper.selected {
  @apply shadow-lg;
}

.node-header {
  @apply p-3 border-b rounded-t-lg transition-colors duration-200 bg-opacity-30;
}

.node-header:hover {
  @apply bg-opacity-80;
}

.node-content {
  @apply relative overflow-hidden;
}

.node-status {
  @apply px-3 py-2 border-t bg-gray-50 rounded-b-lg;
}

.icon-area {
  @apply flex items-center justify-center p-4 transition-all duration-300 ease-in-out cursor-pointer hover:bg-gray-50;
  min-height: 160px;
}

.icon-area:hover {
  @apply border-gray-300 bg-gray-50;
}

.icon-area-collapsed {
  @apply transform scale-100;
}

.expandable-content {
  @apply absolute top-0 left-0 w-full bg-white opacity-0 invisible transition-all duration-300 ease-in-out p-4;
  transform: translateY(10px);
}

.expandable-content-expanded {
  @apply opacity-100 visible static;
  transform: translateY(0);
}

.collapse-button {
  @apply absolute bottom-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200;
}
</style>
