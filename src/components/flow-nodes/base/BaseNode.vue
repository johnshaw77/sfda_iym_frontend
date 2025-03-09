<!-- 基礎節點組件 -->
<template>
  <div
    class="node-wrapper"
    :class="{
      'border-blue-500 shadow-blue-100': selected,
      'border-purple-500 shadow-purple-300 bg-purple-50 border-[5px]':
        nodeState.status === 'running',
      'cursor-pointer': !disabled,
      'opacity-50 cursor-not-allowed': disabled,
      'flow-node--selected': selected,
      'flow-node--running': nodeState.status === 'running',
      'flow-node--completed': nodeState.status === 'completed',
      'flow-node--error':
        nodeState.status === 'error' || nodeState.status === 'failed',
    }"
    :style="{
      width: `${nodeWidth}px`,
      height: autoHeight ? 'auto' : `${nodeHeight}px`,
    }"
    ref="nodeWrapperRef">
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
      }" />
    <!-- 節點標題 -->
    <div
      class="node-header bg-opacity-30 text-red-700"
      :class="[
        customHeaderClass ||
          headerClasses[nodeType] ||
          'bg-gray-50 border-gray-50',
        { 'cursor-grab': !disabled },
        {
          'bg-purple-100 border-purple-200': nodeState.status === 'running',
        },
      ]"
      :style="customHeaderStyle">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <component
            :is="icon"
            :class="[iconClasses[nodeType] || 'text-gray-600']"
            :size="32" />
          <span class="text-lg font-medium text-gray-900">{{ title }}</span>
          <el-tag
            size="small"
            :type="statusType">
            {{ statusText }}
          </el-tag>
        </div>
      </div>
      <div
        v-if="description"
        class="mt-1 text-xs text-gray-900">
        {{ description }}
      </div>
    </div>

    <!-- 節點內容 -->
    <div
      class="node-content relative p-4"
      ref="nodeContentRef">
      <!-- 節點內容區域 -->
      <slot></slot>
      <el-divider />
    </div>

    <!-- 節點狀態 -->
    <div class="node-status">
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-500"> </span>
        <div class="flex items-center space-x-2">
          <el-button
            type="success"
            size="small"
            @click="handleRunClick"
            :loading-icon="RefreshCw"
            :loading="running"
            :disabled="nodeState.status === 'running'"
            >{{ hasExecutedBefore ? "重新執行" : "執行" }}</el-button
          >
          123
          <el-tag
            :type="statusType"
            size="small"
            :class="{ 'animate-pulse': nodeState.status === 'running' }">
            {{ statusText }}-{{ nodeState.status }}
          </el-tag>

          <el-popover
            placement="top"
            width="300"
            trigger="click">
            <template #reference>
              <el-button
                type="info"
                size="small"
                circle
                icon="InfoFilled" />
            </template>
            <div class="p-2">
              <h4 class="text-sm font-bold mb-2">節點狀態信息</h4>
              <div class="text-xs space-y-1">
                <div><strong>節點ID:</strong> {{ id }}</div>
                <div><strong>狀態:</strong> {{ nodeState.status }}</div>
                <div>
                  <strong>更新時間:</strong> {{ nodeState.updatedAt || "未知" }}
                </div>
                <div v-if="nodeState.error">
                  <strong>錯誤:</strong> {{ nodeState.error }}
                </div>
              </div>
            </div>
          </el-popover>
        </div>
      </div>
    </div>

    <!-- 錯誤訊息顯示區域 -->
    <div
      v-if="nodeState.status === 'error' || nodeState.status === 'failed'"
      class="error-message-container">
      <div class="error-header">
        <i class="el-icon-warning-outline mr-1"></i>
        <span>執行錯誤</span>
        <el-button
          type="text"
          size="small"
          class="ml-auto"
          @click="showErrorDetails = !showErrorDetails">
          {{ showErrorDetails ? "隱藏詳情" : "查看詳情" }}
        </el-button>
      </div>

      <div class="error-summary">
        {{ formatErrorMessage(nodeState.error) || "節點執行過程中發生錯誤" }}
      </div>

      <div
        v-if="showErrorDetails"
        class="error-details">
        <div
          v-if="nodeState.errorDetails"
          class="mt-2">
          <div
            v-if="nodeState.errorDetails.code"
            class="error-detail-item">
            <span class="error-detail-label">錯誤代碼:</span>
            <span class="error-detail-value">{{
              nodeState.errorDetails.code
            }}</span>
          </div>
          <div
            v-if="nodeState.errorDetails.name"
            class="error-detail-item">
            <span class="error-detail-label">錯誤類型:</span>
            <span class="error-detail-value">{{
              nodeState.errorDetails.name
            }}</span>
          </div>
          <div
            v-if="nodeState.retryCount"
            class="error-detail-item">
            <span class="error-detail-label">重試次數:</span>
            <span class="error-detail-value">{{ nodeState.retryCount }}</span>
          </div>
          <div
            v-if="nodeState.suggestion"
            class="error-detail-item">
            <span class="error-detail-label">建議:</span>
            <span class="error-detail-value">{{ nodeState.suggestion }}</span>
          </div>
        </div>

        <!-- 完整錯誤信息 -->
        <div
          v-if="nodeState.error && showFullError"
          class="mt-2">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs text-gray-600">完整錯誤信息:</span>
            <el-button
              type="text"
              size="small"
              @click="showFullError = false">
              隱藏
            </el-button>
          </div>
          <div
            class="text-xs text-red-600 p-2 bg-red-50 rounded overflow-auto max-h-32 whitespace-pre-wrap">
            {{ nodeState.error }}
          </div>
        </div>

        <div
          v-else-if="nodeState.error && nodeState.error.length > 100"
          class="mt-2">
          <el-button
            type="text"
            size="small"
            @click="showFullError = true">
            顯示完整錯誤信息
          </el-button>
        </div>

        <div class="error-actions mt-2">
          <el-button
            type="primary"
            size="small"
            @click="handleRunClick"
            :loading="running">
            重試執行
          </el-button>
          <el-button
            type="info"
            size="small"
            @click="handleClearError">
            清除錯誤
          </el-button>
        </div>
      </div>
    </div>

    <!-- 執行時間顯示 -->
    <div
      v-if="nodeContext.executionTime"
      class="execution-time">
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
      @disconnect="handleDisconnect" />

    <!-- 節點錯誤指示器 -->
    <div
      v-if="nodeState.status === 'error' || nodeState.status === 'failed'"
      class="flow-node__error-indicator">
      <el-tooltip
        :content="errorMessage || '節點執行失敗'"
        placement="top">
        <i class="el-icon-warning flow-node__error-icon"></i>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import { useFlowStore } from "@/stores/flowStore";
import { storeToRefs } from "pinia";
import NodeHandles from "./NodeHandles.vue";
import { NodeResizer } from "@vue-flow/node-resizer";
import "@vue-flow/node-resizer/dist/style.css";
import { useFlowInstance } from "@/composables/useFlowInstance";
import { Box, RefreshCw } from "lucide-vue-next";
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from "vue";

// 定義 props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  // TODO: nowork? 節點類型 目前只用到 custom-input, custom-process , 會影響連接點的顯示()
  nodeType: {
    type: String,
    default: "custom-process",
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
  // 是否自動調整高度
  autoHeight: {
    type: Boolean,
    default: true,
  },
});

const flowStore = useFlowStore();
const { currentInstance } = storeToRefs(flowStore);

// 使用流程實例 composable
const { clearNodeError } = useFlowInstance();

// 將計算屬性改為 ref
const nodeState = ref({ status: "default" });

// 獲取節點上下文數據
const nodeContext = computed(() => {
  return flowStore.getNodeContextById(props.id);
});

// 獲取節點日誌
const nodeLogs = computed(() => {
  return flowStore.getNodeLogsById(props.id);
});

// 添加發送狀態變更事件的方法
const sendStateChangeEvent = (status, result = null, error = null) => {
  console.log(
    `[${new Date().toISOString()}] 節點 ${props.id} 發送狀態變更事件: ${status}`
  );

  // 發送節點狀態變更事件，通知工作流管理器
  const event = new CustomEvent("flow:nodeStateChange", {
    detail: {
      nodeId: props.id,
      status: status,
      result: result || nodeContext.value?.output,
      error: error || nodeState.value.error,
      timestamp: new Date().toISOString(), // 添加時間戳，幫助追蹤事件順序
    },
  });
  window.dispatchEvent(event);
};

// 統一的狀態更新方法
const updateNodeStatus = (nodeId, newStatus, result = null, error = null) => {
  // 如果第一個參數不是 nodeId，而是 newStatus，則調整參數順序
  if (
    typeof nodeId === "string" &&
    (nodeId === "running" ||
      nodeId === "completed" ||
      nodeId === "error" ||
      nodeId === "default" ||
      nodeId === "info")
  ) {
    error = result;
    result = newStatus;
    newStatus = nodeId;
    nodeId = props.id;
  }

  console.log(
    `[BaseNode] 更新節點 ${nodeId} 狀態為 ${newStatus}，當前節點ID: ${props.id}`
  );

  // 確保只更新當前節點的狀態，而不是其他節點
  if (nodeId !== props.id) {
    console.warn(
      `[BaseNode] 嘗試從節點 ${props.id} 更新其他節點 ${nodeId} 的狀態，這可能導致狀態混亂。已忽略此操作。`
    );
    return;
  }

  // 更新 flowStore 中的狀態
  const updatedState = {
    status: newStatus,
    data: result,
    error: error ? error.message || "未知錯誤" : null,
    updatedAt: new Date().toISOString(),
  };

  console.log(`[BaseNode] 準備更新 flowStore 中的節點狀態:`, updatedState);

  // 更新本地 ref 狀態
  nodeState.value = { ...nodeState.value, ...updatedState };

  // 更新 flowStore 中的狀態
  flowStore.updateNodeState(nodeId, updatedState);

  console.log(`[BaseNode] 狀態更新完成，當前節點狀態:`, nodeState.value);

  // 發送狀態變更事件
  sendStateChangeEvent(newStatus, result, error);
};

// 修改狀態類型映射
const statusType = computed(() => {
  const typeMap = {
    idle: "info",
    running: "warning",
    completed: "success",
    error: "danger",
    paused: "warning",
    pending: "info",
    default: "info",
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
    default: "預設",
  };
  return textMap[nodeState.value.status] || nodeState.value.status;
});

// 判斷節點是否已經執行過
const hasExecutedBefore = computed(() => {
  // 檢查節點狀態是否為已完成
  if (nodeState.value.status === "completed") {
    return true;
  }

  // 檢查節點上下文是否有數據
  if (nodeContext.value && Object.keys(nodeContext.value).length > 0) {
    return true;
  }

  // 檢查 sharedData 或 globalVariables 中是否有該節點的數據
  const sharedData = currentInstance.value?.context?.sharedData || {};
  const globalVariables = currentInstance.value?.context?.globalVariables || {};

  // 檢查 sharedData 中是否有與該節點相關的數據
  // 遍歷 sharedData 中的所有項目，檢查是否有任何項目的 nodeId 與當前節點 ID 匹配
  const hasSharedData = Object.values(sharedData).some((item) => {
    // 檢查項目是否為對象且包含 nodeId 屬性
    return item && typeof item === "object" && item.nodeId === props.id;
  });

  if (hasSharedData) {
    return true;
  }

  // 檢查 globalVariables 中是否有與該節點相關的變數
  const hasGlobalVar = Object.entries(globalVariables).some(([key, value]) => {
    // 檢查鍵值是否包含節點 ID
    if (key.includes(props.id)) {
      return value !== undefined && value !== null;
    }

    // 檢查變數中是否有 sourceNodeId 欄位與當前節點 ID 匹配
    if (value && typeof value === "object" && value.sourceNodeId === props.id) {
      return true;
    }

    return false;
  });

  return hasGlobalVar;
});

// 節點類型樣式映射
const headerClasses = {
  "complaint-selector": "bg-blue-50 border-blue-100",
  "data-input": "bg-blue-50 border-blue-100",
  "data-process": "bg-green-50 border-green-100",
  "data-output": "bg-purple-50 border-purple-100",
};

// 圖標顏色映射 TODO:modify this
const iconClasses = {
  "complaint-selector": "text-blue-600",
  "data-input": "text-blue-600",
  "data-process": "text-green-600",
  "data-output": "text-purple-600",
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

const running = ref(false);
// 修改測試執行函數為空方法，讓子類別必須自行實作
const handleRun = async () => {
  console.log("BaseNode handleRun 被調用，但這是一個空方法，應該由子類別實作");
  // 不再拋出錯誤，而是提供一個默認的空實現
  // 實際的執行邏輯應該由子類別通過監聽 run 事件來實現
};

// 處理執行按鈕點擊
const handleRunClick = async (context = {}) => {
  // 防止重複點擊
  if (running.value) {
    console.log("節點正在執行中，忽略重複點擊");
    return;
  }

  // 設置載入中狀態
  running.value = true;

  try {
    console.log(
      `[${new Date().toISOString()}] 節點 ${
        props.id
      } handleRunClick 被調用，上下文:`,
      context
    );

    // 觸發 run 事件，並傳遞上下文數據
    emit("run", context);

    // 由於實際執行是在父組件中處理的，這裡我們不自動重置狀態
    // 而是等待父組件通過 setRunningState 方法通知執行完成
  } catch (error) {
    console.error("執行節點時發生錯誤:", error);
    running.value = false;

    // 更新錯誤狀態
    updateNodeStatus("error", null, error);
  }
};

// 設置執行狀態，供父組件調用
const setRunningState = (isRunning) => {
  running.value = isRunning;
  console.log("isRunning", props.id, isRunning);
  // 同時更新 nodeState.status
  if (isRunning) {
    nodeState.value = {
      ...nodeState.value,
      status: "running",
    };
    // 發送狀態變更事件
    updateNodeStatus("running");
  } else if (nodeState.value.status === "running") {
    // 只有當當前狀態為 running 時才更新為 default
    // 避免覆蓋其他狀態（如 completed 或 error）
    nodeState.value = {
      ...nodeState.value,
      status: "default",
    };
  }
};

// 定義 emits
const emit = defineEmits([
  "click",
  "run",
  "handle-connect",
  "handle-disconnect",
  "nodeSizeChange", // 添加節點尺寸變化事件
]);

// 處理連接事件
const handleConnect = (data) => {
  emit("handle-connect", { id: props.id, ...data });
};

// 處理斷開連接事件
const handleDisconnect = (data) => {
  emit("handle-disconnect", { id: props.id, ...data });
};

// 節點包裝器引用
const nodeWrapperRef = ref(null);
// 節點內容引用
const nodeContentRef = ref(null);
// ResizeObserver 實例
let resizeObserver = null;

// 更新節點高度
const updateNodeHeight = async () => {
  if (!props.autoHeight || !nodeWrapperRef.value || !nodeContentRef.value)
    return;

  await nextTick();

  // 獲取內容高度
  const contentHeight = nodeContentRef.value.scrollHeight;
  // 獲取節點頭部高度
  const headerHeight =
    nodeWrapperRef.value.querySelector(".node-header")?.offsetHeight || 0;
  // 獲取節點狀態區域高度
  const statusHeight =
    nodeWrapperRef.value.querySelector(".node-status")?.offsetHeight || 0;

  // 計算總高度，加上一些額外的間距
  const totalHeight = contentHeight + headerHeight + statusHeight + 20;

  // 確保高度不小於最小高度
  const finalHeight = Math.max(totalHeight, props.minHeight);

  // 更新節點高度
  if (nodeWrapperRef.value) {
    nodeWrapperRef.value.style.height = `${finalHeight}px`;
  }

  // 通知 Vue Flow 節點尺寸已變更
  emit("nodeSizeChange", { id: props.id, height: finalHeight });
};

// 監聽節點選擇狀態變化
watch(
  () => props.selected,
  async () => {
    await nextTick();
    updateNodeHeight();
  },
  { immediate: true }
);

// 監聽節點狀態變化
watch(
  () => props.status,
  async () => {
    await nextTick();
    updateNodeHeight();
  },
  { immediate: true }
);

// 在 onMounted 中初始化 nodeState
onMounted(() => {
  // 從 flowStore 獲取初始狀態
  const initialState = flowStore.getNodeStateById(props.id);
  console.log(`[BaseNode ${props.id}] 初始化節點狀態:`, initialState);
  nodeState.value = initialState;

  nextTick(() => {
    updateNodeHeight();

    // 創建 ResizeObserver 來監聽內容尺寸變化
    if (window.ResizeObserver && nodeContentRef.value) {
      resizeObserver = new ResizeObserver(() => {
        updateNodeHeight();
      });

      resizeObserver.observe(nodeContentRef.value);
    }
  });

  // 添加節點執行事件監聽器
  const handleExecuteNodeEvent = (event) => {
    const { nodeId, ...context } = event.detail;

    // 檢查是否是當前節點
    if (nodeId === props.id) {
      console.log(
        `[${new Date().toISOString()}] 節點 ${nodeId} 收到執行事件，準備執行，上下文:`,
        context
      );
      // 調用 handleRun 方法，並傳遞上下文數據
      handleRunClick(context);
    }
  };

  // 添加事件監聽器
  window.addEventListener("flow:executeNode", handleExecuteNodeEvent);

  // 保存事件監聽器引用，以便在 onUnmounted 中移除
  nodeWrapperRef.value._handleExecuteNodeEvent = handleExecuteNodeEvent;
});

// 清理 ResizeObserver 和事件監聽器
onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  // 移除節點執行事件監聽器
  if (nodeWrapperRef.value && nodeWrapperRef.value._handleExecuteNodeEvent) {
    window.removeEventListener(
      "flow:executeNode",
      nodeWrapperRef.value._handleExecuteNodeEvent
    );
    nodeWrapperRef.value._handleExecuteNodeEvent = null;
  }
});

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
      await clearNodeError(props.id);

      // 重置本地狀態
      showErrorDetails.value = false;
      showFullError.value = false;

      console.log(`已清除節點 ${props.id} 的錯誤狀態`);
    }
  } catch (error) {
    console.error("清除錯誤狀態失敗:", error);
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
  setRunningState,
  updateNodeStatus, // 暴露統一的狀態更新方法
  sendStateChangeEvent, // 暴露發送狀態變更事件的方法
});
</script>

<style scoped>
.node-wrapper {
  @apply relative bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col;
  transition: all 0.3s ease;
  min-height: v-bind('minHeight + "px"');
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
  @apply relative overflow-visible;
  min-height: 50px;
}

.node-status {
  @apply px-3 py-2 border-t bg-gray-50 rounded-b-lg;
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
  @apply border-purple-500 bg-purple-50;
  animation: purplePulse 1.5s infinite;
  box-shadow: 0 0 15px rgba(147, 51, 234, 0.7) !important;
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

/* 確保連結點能夠正確顯示 */
:deep(.vue-flow__handle) {
  z-index: 50;
  position: absolute;
}

:deep(.vue-flow__handle.left) {
  left: 0;
  transform: translateX(-50%);
}

:deep(.vue-flow__handle.right) {
  right: 0;
  transform: translateX(50%);
}

@keyframes purplePulse {
  0% {
    box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.8);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(147, 51, 234, 0.3);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
  }
}

/* 執行中節點的特殊樣式 */
.node-wrapper.flow-node--running::before {
  content: "";
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 3px solid #a855f7;
  border-radius: 12px;
  animation: borderPulse 2s infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes borderPulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.03);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
