<!-- 基礎節點組件 -->
<template>
  <div
    class="node-wrapper"
    :class="{
      'border-blue-500 shadow-blue-100': selected,
      'cursor-pointer': !disabled,
      'opacity-50 cursor-not-allowed': disabled,
      'flow-node--selected': selected,
      'flow-node--running': status === 'running',
      'flow-node--completed': status === 'completed',
      'flow-node--error': status === 'error' || status === 'failed',
    }"
    :style="{ width: `${nodeWidth}px`, height: `${nodeHeight}px` }"
  >
    <!-- 顯示 resize 手柄 -->
    <NodeResizer
      v-if="showResizer"
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
          'bg-gray-50 border-gray-50',
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
          <span class="text-lg font-medium text-gray-900"
            >{{ title }} {{ id }}</span
          >
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
      <div v-if="description" class="mt-1 text-xs text-gray-900">
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
        <!-- 節點內容區域 -->
        <slot></slot>
        <el-divider />
      </div>
    </div>

    <!-- 節點狀態 -->
    <div v-if="status" class="node-status">
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-500"
          >狀態-{{ flowStateStore.currentInstance.id }}</span
        >
        <div class="flex items-center space-x-2">
          <el-button
            type="success"
            size="small"
            @click="handleRun"
            :loading-icon="Refresh"
            :loading="running"
            :disabled="nodeState.status === 'running'"
            >測試執行</el-button
          >

          <el-tag
            :type="statusType"
            size="small"
            :class="{ 'animate-pulse': nodeState.status === 'running' }"
          >
            {{ statusText }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 錯誤訊息顯示區域 -->
    <div
      v-if="nodeState.status === 'error' || nodeState.status === 'failed'"
      class="error-message-container"
    >
      <div class="error-header">
        <i class="el-icon-warning-outline mr-1"></i>
        <span>執行錯誤</span>
        <el-button
          type="text"
          size="small"
          class="ml-auto"
          @click="showErrorDetails = !showErrorDetails"
        >
          {{ showErrorDetails ? "隱藏詳情" : "查看詳情" }}
        </el-button>
      </div>

      <div class="error-summary">
        {{ formatErrorMessage(nodeState.error) || "節點執行過程中發生錯誤" }}
      </div>

      <div v-if="showErrorDetails" class="error-details">
        <div v-if="nodeState.errorDetails" class="mt-2">
          <div v-if="nodeState.errorDetails.code" class="error-detail-item">
            <span class="error-detail-label">錯誤代碼:</span>
            <span class="error-detail-value">{{
              nodeState.errorDetails.code
            }}</span>
          </div>
          <div v-if="nodeState.errorDetails.name" class="error-detail-item">
            <span class="error-detail-label">錯誤類型:</span>
            <span class="error-detail-value">{{
              nodeState.errorDetails.name
            }}</span>
          </div>
          <div v-if="nodeState.retryCount" class="error-detail-item">
            <span class="error-detail-label">重試次數:</span>
            <span class="error-detail-value">{{ nodeState.retryCount }}</span>
          </div>
          <div v-if="nodeState.suggestion" class="error-detail-item">
            <span class="error-detail-label">建議:</span>
            <span class="error-detail-value">{{ nodeState.suggestion }}</span>
          </div>
        </div>

        <!-- 完整錯誤信息 -->
        <div v-if="nodeState.error && showFullError" class="mt-2">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs text-gray-600">完整錯誤信息:</span>
            <el-button type="text" size="small" @click="showFullError = false">
              隱藏
            </el-button>
          </div>
          <div
            class="text-xs text-red-600 p-2 bg-red-50 rounded overflow-auto max-h-32 whitespace-pre-wrap"
          >
            {{ nodeState.error }}
          </div>
        </div>

        <div
          v-else-if="nodeState.error && nodeState.error.length > 100"
          class="mt-2"
        >
          <el-button type="text" size="small" @click="showFullError = true">
            顯示完整錯誤信息
          </el-button>
        </div>

        <div class="error-actions mt-2">
          <el-button type="primary" size="small" @click="handleRun">
            重試執行
          </el-button>
          <el-button type="info" size="small" @click="handleClearError">
            清除錯誤
          </el-button>
        </div>
      </div>
    </div>

    <!-- 執行時間顯示 -->
    <div v-if="nodeContext.executionTime" class="execution-time">
      執行時間：{{ formatExecutionTime(nodeContext.executionTime) }}
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

    <!-- 節點錯誤指示器 -->
    <div
      v-if="status === 'error' || status === 'failed'"
      class="flow-node__error-indicator"
    >
      <el-tooltip :content="errorMessage || '節點執行失敗'" placement="top">
        <i class="el-icon-warning flow-node__error-icon"></i>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from "vue";
import { useFlowStateStore } from "@/stores/flowState";
import { storeToRefs } from "pinia";
import NodeHandles from "./NodeHandles.vue";
import { Box, ChevronUp } from "lucide-vue-next";
import { NodeResizer } from "@vue-flow/node-resizer";
import "@vue-flow/node-resizer/dist/style.css";
import { ElMessage } from "element-plus";

// 定義 props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  // 節點類型 目前只用到 custom-input, custom-process , 會影響連接點的顯示()
  nodeType: {
    type: String,
    default: "http-request",
    validator: (value) =>
      ["custom-input", "custom-process", "custom-output"].includes(value),
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
  // 節點寬度
  nodeWidth: {
    type: Number,
    default: 360,
  },
  // 節點高度
  nodeHeight: {
    type: Number,
    default: 400,
  },
  // TODO: 這個屬性是給外部傳入的樣式，目前沒有使用
  style: {
    type: Object,
    default: () => ({}),
  },
  // 是否顯示連接點標籤
  showHandleLabels: {
    type: Boolean,
    default: false,
  },
  // 節點頭部背景顏色
  headerBgColor: {
    type: String,
    default: "#F8FAFC", // slate-50
  },
  // 節點最小寬度
  minWidth: {
    type: Number,
    default: 240,
  },
  // 節點最小高度
  minHeight: {
    type: Number,
    default: 120,
  },
  // 是否顯示 resize 手柄
  showResizer: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: "",
  },
});

const flowStateStore = useFlowStateStore();
const { currentInstance } = storeToRefs(flowStateStore);

// 計算節點的實際狀態
const nodeState = computed(() => {
  return flowStateStore.getNodeState(props.id);
});
console.log("241", nodeState.value);
// 修改狀態類型映射
const statusType = computed(() => {
  const typeMap = {
    idle: "info",
    running: "warning",
    completed: "success",
    error: "danger",
    paused: "warning",
    pending: "info",
  };
  return typeMap[nodeState.value.status] || "info";
});

// 修改狀態文字映射
const statusText = computed(() => {
  const textMap = {
    idle: "待執行",
    running: "執行中",
    completed: "已完成",
    error: "錯誤",
    paused: "已暫停",
    pending: "等待中",
  };
  return textMap[nodeState.value.status] || nodeState.value.status;
});

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
        // label: " ",
      },
    ],
    outputs: [
      {
        id: "output",
        position: "right",
        type: "source",
        // label: " ",
      },
    ],
  };

  //根據節點類型決定顯示哪些連接點;
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
          },
        ],
      };
    case "custom-process":
      return {
        inputs: [
          {
            id: "input",
            position: "left",
            type: "target",
            //label: "輸入",
          },
        ],
        outputs: [
          {
            id: "output",
            position: "right",
            type: "source",
          },
        ],
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
  // if (props.headerBorderColor) {
  //   style.borderColor = props.headerBorderColor;
  // }
  return style;
});

// 添加自定義類名計算屬性
const customHeaderClass = computed(() => {
  if (props.headerBgColor || props.headerBorderColor) {
    return "custom-header";
  }
  return "";
});

// 獲取節點上下文數據
const nodeContext = computed(() => {
  return flowStateStore.getNodeContext(props.id);
});

// 獲取節點日誌
const nodeLogs = computed(() => {
  return flowStateStore.getNodeLogs(props.id);
});

const running = ref(false);
// 修改測試執行函數
const handleRun = async () => {
  try {
    running.value = true;
    await flowStateStore.executeNode(
      currentInstance.value.id,
      props.id,
      nodeContext.value.input
    );
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    running.value = false;
  }
};

// 定義事件
const emit = defineEmits([
  "click",
  "handle-connect",
  "handle-disconnect",
  "update:data",
]);

// 處理連接事件
const handleConnect = (data) => {
  emit("handle-connect", { id: props.id, ...data });
};

// 處理斷開連接事件
const handleDisconnect = (data) => {
  emit("handle-disconnect", { id: props.id, ...data });
};

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

const executeNode = async () => {
  throw new Error("executeNode must be implemented by child component");
};

// 錯誤詳情顯示控制
const showErrorDetails = ref(false);
const showFullError = ref(false);

// 格式化錯誤信息
const formatErrorMessage = (message) => {
  if (!message) return "未知錯誤";

  // 如果錯誤信息包含堆棧跟踪，只顯示第一行
  if (message.includes("\n")) {
    return message.split("\n")[0];
  }

  // 如果錯誤信息太長，截斷它
  if (message.length > 100) {
    return message.substring(0, 100) + "...";
  }

  // 處理特定類型的錯誤信息
  if (message.includes("不支持的節點類型")) {
    return "節點類型不支持，請聯繫系統管理員";
  }

  return message;
};

// 清除錯誤狀態
const handleClearError = async () => {
  try {
    // 更新節點狀態為默認
    if (currentInstance.value?.id) {
      await flowStateStore.updateNodeState(currentInstance.value.id, props.id, {
        status: "idle",
        error: null,
        errorDetails: null,
      });
      showErrorDetails.value = false;
      showFullError.value = false;
      ElMessage.success("已清除錯誤狀態");
    }
  } catch (error) {
    console.error("清除錯誤狀態失敗:", error);
    ElMessage.error("清除錯誤狀態失敗");
  }
};

// 格式化執行時間
const formatExecutionTime = (time) => {
  if (!time) return "未知";

  // 如果時間小於1秒，顯示毫秒
  if (time < 1) {
    return `${Math.round(time * 1000)}毫秒`;
  }

  // 如果時間大於60秒，顯示分鐘和秒
  if (time > 60) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.round(time % 60);
    return `${minutes}分${seconds}秒`;
  }

  // 否則顯示秒
  return `${time.toFixed(2)}秒`;
};

// 暴露方法和屬性
defineExpose({
  nodeState,
  nodeContext,
  nodeLogs,
  handleRun,
  handleClearError,
  formatErrorMessage,
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

.flow-node {
  @apply relative bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden;
  min-width: 200px;
  max-width: 320px;
  transition: all 0.2s ease;
}

.flow-node--selected {
  @apply shadow-md border-blue-400;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.flow-node--running {
  @apply border-blue-400;
  animation: pulse 2s infinite;
}

.flow-node--completed {
  @apply border-green-400;
}

.flow-node--error,
.flow-node--failed {
  @apply border-red-400;
  animation: shake 0.5s ease-in-out;
}

.flow-node--disabled {
  @apply opacity-60 cursor-not-allowed;
}

.flow-node__header {
  @apply flex items-center justify-between p-2 border-b border-gray-100 bg-gray-50;
}

.flow-node__title {
  @apply flex items-center;
}

.flow-node__icon {
  @apply mr-2 text-gray-500;
}

.flow-node__label {
  @apply font-medium text-gray-700 truncate;
  max-width: 180px;
}

.flow-node__content {
  @apply p-3;
}

.flow-node__handles {
  @apply absolute top-0 left-0 w-full h-full pointer-events-none;
}

.flow-node__handle {
  @apply absolute w-3 h-3 rounded-full bg-gray-300 border border-gray-400 cursor-pointer pointer-events-auto;
  transition: all 0.2s ease;
}

.flow-node__handle:hover {
  @apply bg-blue-400 border-blue-500;
  transform: scale(1.2);
}

.flow-node__handle--connected {
  @apply bg-green-400 border-green-500;
}

.flow-node__handle--input {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
}

.flow-node__handle--output {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
}

.flow-node__error-indicator {
  @apply absolute top-0 right-0 p-1;
}

.flow-node__error-icon {
  @apply text-red-500 text-lg;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}

.error-message-container {
  @apply mx-3 my-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm;
}

.error-header {
  @apply flex items-center text-red-600 font-medium mb-2;
}

.error-summary {
  @apply text-red-700 mb-2;
}

.error-details {
  @apply mt-2 pt-2 border-t border-red-200;
}

.error-detail-item {
  @apply flex justify-between mb-1;
}

.error-detail-label {
  @apply text-red-600 font-medium;
}

.error-detail-value {
  @apply text-red-800;
}

.error-actions {
  @apply flex justify-end space-x-2;
}

.execution-time {
  @apply mx-3 my-2 text-xs text-gray-500;
}

/* 添加錯誤狀態的閃爍邊框效果 */
.flow-node--error,
.flow-node--failed {
  animation: errorPulse 2s infinite;
}

@keyframes errorPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(220, 38, 38, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
  }
}
</style>
