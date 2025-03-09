<template>
  <BaseNode
    :id="id"
    ref="nodeRef"
    nodeType="custom-process"
    :title="title"
    :description="description"
    icon="BarChart3"
    :selected="selected"
    header-bg-color="#f3e79b"
    :node-width="400"
    :node-height="700"
    :handles="handles"
    @click="handleNodeClick"
    @handle-connect="handleConnect"
    @handle-disconnect="handleDisconnect"
    @run="handleRun">
    <!-- 主要內容區域 -->
    <div class="p-4 space-y-4">
      <!-- 不良率數據顯示 -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-3">
          前五大不良原因分析
        </h3>
        <div class="space-y-3">
          <div
            v-for="(defect, index) in topDefects"
            :key="index"
            class="relative">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-600">{{ defect.name }}</span>
              <span class="text-sm font-medium text-gray-700"
                >{{ defect.percentage }}%</span
              >
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :style="{
                  width: `${defect.percentage}%`,
                  backgroundColor: getBarColor(index),
                }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 總計資訊 -->
      <div
        class="flex items-center justify-between text-sm p-2 bg-blue-50 rounded-lg">
        <span class="text-gray-600">總不良數</span>
        <span class="font-medium text-gray-700">{{ totalDefects }}</span>
      </div>
    </div>
  </BaseNode>
</template>

<script setup>
import BaseNode from "../base/BaseNode.vue";
import { useFlowStore } from "@/stores/flowStore";
import { storeToRefs } from "pinia";
import { useFlowInstance } from "@/composables/useFlowInstance";
import { BarChart3 } from "lucide-vue-next";

// 節點基本屬性
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "前五大不良分析",
  },
  description: {
    type: String,
    default: "針對不良率數據列出top五的主要不良原因",
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

// 連接點配置
const handles = {
  inputs: [
    {
      id: "input",
      type: "target",
      position: "left",
    },
  ],
  outputs: [
    {
      id: "output",
      type: "source",
      position: "right",
    },
  ],
};

// 使用流程實例 composable
const {
  executeNode,
  clearNodeError,
  flowStore,
  updateSharedData,
  getSharedData,
} = useFlowInstance();

// 節點引用
const nodeRef = ref(null);

// 節點狀態
const executing = ref(false);
const errorMessage = ref("");
const errorDetails = ref(null);
const outputData = ref(null);

// 1-100 隨機數
const getRandomNumber = () => {
  const randomNumber = ref(Math.floor(Math.random() * 100) + 1);
  return randomNumber;
};

// 模擬數據
const topDefects = ref([
  { name: "表面刮傷", percentage: getRandomNumber() },
  { name: "尺寸不符", percentage: getRandomNumber() },
  { name: "色差異常", percentage: getRandomNumber() },
  { name: "材質瑕疵", percentage: getRandomNumber() },
  { name: "組裝偏移", percentage: getRandomNumber() },
]);

const totalDefects = ref(150);

// 獲取顏色函數
const getBarColor = (index) => {
  const colors = [
    "#3b82f6", // 藍色
    "#10b981", // 綠色
    "#6366f1", // 靛藍色
    "#8b5cf6", // 紫色
    "#ec4899", // 粉色
  ];
  return colors[index] || colors[0];
};

// 事件處理
const emit = defineEmits(["update:data", "click", "connect", "disconnect"]);

const handleNodeClick = (event) => {
  emit("click", { id: props.id, event });
};

const handleConnect = (data) => {
  emit("connect", { id: props.id, ...data });
};

const handleDisconnect = (data) => {
  emit("disconnect", { id: props.id, ...data });
};

// 數據處理函數
const processData = (inputData) => {
  return new Promise((resolve) => {
    // 模擬數據處理
    setTimeout(() => {
      // 如果有來自上一個節點的數據，可以在這裡處理
      if (inputData.sourceNodeOutput) {
        console.log("收到上一個節點的數據:", inputData.sourceNodeOutput);
        // 這裡可以根據上一個節點的數據調整不良率分析結果
      }

      topDefects.value = [
        { name: "表面刮傷", percentage: getRandomNumber() },
        { name: "尺寸不符", percentage: getRandomNumber() },
        { name: "色差異常", percentage: getRandomNumber() },
        { name: "材質瑕疵", percentage: getRandomNumber() },
        { name: "組裝偏移", percentage: getRandomNumber() },
      ];
      // 返回處理結果
      const result = {
        topDefects: topDefects.value,
        totalDefects: totalDefects.value,
        timestamp: new Date().toISOString(),
      };

      resolve(result);
    }, 5000);
  });
};

// 統一的狀態更新方法
const updateNodeStatus = (newStatus, result = null, error = null) => {
  console.log(`[TopDefectsNode] 更新節點 ${props.id} 狀態為 ${newStatus}`);

  // 如果有節點引用，使用 BaseNode 中的方法更新狀態
  if (nodeRef.value) {
    console.log(`[TopDefectsNode] 使用 nodeRef 更新狀態`);
    nodeRef.value.updateNodeStatus(newStatus, result, error);
  } else {
    // 如果節點引用不可用，直接更新 flowStore
    console.log(`[TopDefectsNode] nodeRef 不可用，直接更新 flowStore`);
    flowStore.updateNodeState(props.id, {
      status: newStatus,
      data: result,
      error: error ? error.message || "未知錯誤" : null,
    });
  }
};

// 實作 handleRun 方法，處理節點執行
const handleRun = async (context = {}) => {
  console.log(
    `[${new Date().toISOString()}] 前五大不良分析節點 handleRun 被調用`,
    context
  );

  // 檢查是否有來自上一個節點的數據
  if (context && context.sourceNodeId) {
    console.log(`節點 ${props.id} 被節點 ${context.sourceNodeId} 自動觸發執行`);
    console.log("上下文數據:", context);

    // 如果有上下文數據，可以在這裡處理
    if (context.sourceNodeOutput) {
      console.log(`收到上一個節點的輸出數據`);
      // 可以根據上一個節點的數據設置一些參數
    }
  }

  executing.value = true;

  try {
    // 統一使用 updateNodeStatus 方法更新狀態
    updateNodeStatus("running");

    // 準備輸入數據
    const inputData = {
      // 如果有上下文數據，則包含在輸入數據中
      ...(context || {}),
      timestamp: new Date().toISOString(),
    };

    console.log("準備執行前五大不良分析，輸入數據:", inputData);

    // 使用 composable 執行節點
    const result = await executeNode(
      props.id,
      inputData,
      processData // 處理函數
    );

    // 將分析結果保存到共享數據中
    await updateSharedData(props.id, {
      detail: result,
      timestamp: new Date().toISOString(),
      nodeId: props.id,
      nodeName: props.title,
    });

    outputData.value = result;
    ElMessage.success("前五大不良分析完成");

    // 統一使用 updateNodeStatus 方法更新狀態
    updateNodeStatus("completed", result);

    return result;
  } catch (error) {
    console.error("前五大不良分析失敗", error);
    ElMessage.error(`前五大不良分析失敗: ${error.message || "未知錯誤"}`);

    // 設置錯誤狀態
    errorMessage.value = error.message || "執行節點時發生未知錯誤";
    errorDetails.value = {
      message: error.message,
      stack: error.stack,
    };

    // 統一使用 updateNodeStatus 方法更新狀態
    updateNodeStatus("error", null, error);

    throw error;
  } finally {
    executing.value = false;
    // 重置 loading 狀態
    nodeRef.value?.setRunningState(false);
  }
};

// 清除錯誤
const handleClearError = async () => {
  await clearNodeError(props.id);
};

// 檢查是否有之前的分析結果
onMounted(async () => {
  // 嘗試從共享數據中獲取之前的分析結果
  const previousData = getSharedData(props.id);
  if (previousData && previousData.detail) {
    console.log("找到之前的分析結果:", previousData);
    // 恢復之前的分析結果
    if (previousData.detail.topDefects) {
      topDefects.value = previousData.detail.topDefects;
    }
    if (previousData.detail.totalDefects) {
      totalDefects.value = previousData.detail.totalDefects;
    }
  }
});

// 暴露方法給父元件
defineExpose({
  handleRun,
  handleClearError,
});
</script>

<style scoped>
.defect-bar {
  @apply transition-all duration-300 ease-in-out;
}
</style>
