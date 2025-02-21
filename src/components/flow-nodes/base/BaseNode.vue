<!-- 基礎節點組件 -->
<template>
  <div
    class="node-wrapper"
    :class="{
      'border-blue-500 shadow-blue-100': selected,
      'cursor-pointer': !disabled,
      'opacity-50 cursor-not-allowed': disabled,
    }"
    :style="{ width: '100%', height: '100%' }"
  >
    <NodeResizer
      :minWidth="minWidth"
      :minHeight="minHeight"
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
          headerClasses[type] ||
          'bg-gray-50 border-gray-100',
        { 'cursor-grab': !disabled },
      ]"
      :style="customHeaderStyle"
    >
      <div class="flex items-center space-x-2">
        <component
          :is="icon"
          :class="[iconClasses[type] || 'text-gray-600']"
          :size="16"
        />
        <span class="text-sm font-medium text-gray-700">{{ title }}</span>
      </div>
      <div v-if="description" class="mt-1 text-xs text-gray-500">
        {{ description }}
      </div>
    </div>

    <!-- 節點內容 -->
    <div class="node-content">
      <slot></slot>
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
      :node-type="type"
      :inputs="defaultHandles.inputs"
      :outputs="defaultHandles.outputs"
      :show-labels="showHandleLabels"
      @connect="handleConnect"
      @disconnect="handleDisconnect"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import NodeHandles from "./NodeHandles.vue";
import { Box } from "lucide-vue-next";
import { NodeResizer } from "@vue-flow/node-resizer";
import "@vue-flow/node-resizer/dist/style.css";

// 定義 props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  // 節點類型 (!TODO: check this)
  type: {
    type: String,
    default: "http-request",
    validator: (value) =>
      ["custom-input", "custom-process", "http-request"].includes(
        value
      ),
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
  apiEndpoint: {
    type: String,
    default: "",
  },
  apiMethod: {
    type: String,
    default: "POST",
    validator: (value) => {
      return ["GET", "POST", "PUT", "DELETE"].includes(value);
    },
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

// 圖標顏色映射
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
  console.log("props.handles", props.handles);
  console.log("props.type", props.type);
  if (props.handles.inputs?.length > 0 || props.handles.outputs?.length > 0) {
    return props.handles;
  }

  const baseHandles = {
    inputs: [
      { id: "right", position: "right", type: "target" },
      { id: "bottom", position: "bottom", type: "target" },
    ],
    outputs: [
      { id: "left", position: "left", type: "source" },
      { id: "top", position: "top", type: "source" },
    ],
  };

  // 根據節點類型決定顯示哪些連接點
  switch (props.type) {
    case "input":
    case "custom-input":
      return {
        inputs: [],
        outputs: [
          { id: "right", position: "right", type: "source" },
          { id: "bottom", position: "bottom", type: "source" },
        ],
      };
    case "output":
      return {
        inputs: [
          { id: "left", position: "left", type: "target" },
          { id: "top", position: "top", type: "target" },
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

// API 相關的處理方法
const handleApiCall = async (data) => {
  if (!props.apiEndpoint) {
    return null;
  }

  try {
    const response = await fetch(props.apiEndpoint, {
      method: props.apiMethod,
      headers: {
        "Content-Type": "application/json",
      },
      body: props.apiMethod !== "GET" ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error("API 呼叫失敗");
    }

    return await response.json();
  } catch (error) {
    console.error("API 呼叫錯誤:", error);
    throw error;
  }
};

// 暴露方法
defineExpose({
  // ... existing code ...
  handleApiCall,
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
  @apply p-3;
}

.node-status {
  @apply px-3 py-2 border-t bg-gray-50 rounded-b-lg;
}
</style>
