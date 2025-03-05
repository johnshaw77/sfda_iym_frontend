<template>
  <BaseNode
    :id="id"
    nodeType="statistic-process"
    :title="title"
    :description="description"
    :icon="icon"
    :status="status"
    :selected="selected"
    header-bg-color="#bfdeee"
    :handles="handles"
    :node-width="600"
    :node-height="720"
    @click="handleNodeClick"
    @handle-connect="handleConnect"
    @handle-disconnect="handleDisconnect"
    @run="handleRun">
    <!-- 主要內容區域? -->
    <div class="p-4 space-y-4">
      <!-- 4M1E 分析結果 -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-3">4M1E 分析結果</h3>
        <div class="space-y-3">
          <div
            v-for="(factor, index) in factors"
            :key="index"
            class="relative">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-600">{{ factor.name }}</span>
              <span class="text-sm font-medium text-gray-700">{{
                factor.value
              }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :style="{
                  width: `${factor.percentage}%`,
                  backgroundColor: getBarColor(index),
                }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 統計資訊 -->
      <div class="grid grid-cols-2 gap-2">
        <div class="p-2 bg-blue-50 rounded-lg">
          <div class="text-xs text-gray-500">卡方值</div>
          <div class="text-sm font-medium text-gray-700">
            {{ chiSquareValue }}
          </div>
        </div>
        <div class="p-2 bg-green-50 rounded-lg">
          <div class="text-xs text-gray-500">P值</div>
          <div class="text-sm font-medium text-gray-700">{{ pValue }}</div>
        </div>
      </div>
    </div>
  </BaseNode>
</template>

<script setup>
import BaseNode from "../base/BaseNode.vue";
import { useFlowStore } from "@/stores/flowStore";
import { storeToRefs } from "pinia";
import { useFlowInstance } from "@/composables/useFlowInstance";

// 節點基本屬性
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "卡方圖分析 4M1E",
  },
  description: {
    type: String,
    default:
      "運用卡方圖針對人員(Man)、機器(Machine)、物料(Material)、方法(Method)、環境(Environment)等因素進行分析",
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

// 視覺相關設定
const headerBgColor = ref("#ff704d"); // 淺綠色背景
const headerBorderColor = ref("#cfcfcf"); // 淺紅色邊框
const icon = BarChart2;

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

// 節點狀態
const status = ref("idle");
const errorMessage = ref("");
const errorDetails = ref(null);
const outputData = ref(null);

// 模擬數據
const factors = ref([
  { name: "人員 (Man)", value: "15.6", percentage: 78 },
  { name: "機器 (Machine)", value: "12.3", percentage: 62 },
  { name: "物料 (Material)", value: "8.9", percentage: 45 },
  { name: "方法 (Method)", value: "6.7", percentage: 34 },
  { name: "環境 (Environment)", value: "4.2", percentage: 21 },
]);

const chiSquareValue = ref("47.7");
const pValue = ref("0.0023");

// 獲取顏色函數
const getBarColor = (index) => {
  const colors = [
    "#ef4444", // 紅色
    "#f97316", // 橙色
    "#eab308", // 黃色
    "#22c55e", // 綠色
    "#3b82f6", // 藍色
  ];
  return colors[index] || colors[0];
};

// 使用流程實例 composable
const {
  executeNode,
  clearNodeError,
  flowStore,
  updateSharedData,
  getSharedData,
  getExecutionPhase,
} = useFlowInstance();
const { currentInstance } = storeToRefs(flowStore);

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
    status.value = "running";

    // 模擬數據處理
    setTimeout(() => {
      status.value = "completed";

      const result = {
        factors: factors.value,
        chiSquareValue: chiSquareValue.value,
        pValue: pValue.value,
        timestamp: new Date().toISOString(),
      };

      emit("update:data", {
        id: props.id,
        data: result,
      });

      resolve(result);
    }, 1000);
  });
};

// 執行節點
const handleRun = async () => {
  try {
    status.value = "running";
    errorMessage.value = "";
    errorDetails.value = null;

    // 使用 composable 執行節點
    const result = await executeNode(
      props.id,
      {}, // 輸入數據
      processData // 處理函數
    );

    // 將分析結果保存到共享數據中
    await updateSharedData("statisticResults", {
      factors: factors.value,
      chiSquareValue: chiSquareValue.value,
      pValue: pValue.value,
      timestamp: new Date().toISOString(),
      nodeId: props.id,
    });

    // 更新組件狀態
    status.value = "success";
    outputData.value = result;
    ElMessage.success("統計處理執行成功");
  } catch (error) {
    console.error("執行節點時發生錯誤:", error);
    status.value = "error";
    errorMessage.value = error.message || "執行節點時發生未知錯誤";
    errorDetails.value = {
      message: error.message,
      stack: error.stack,
    };

    ElMessage.error(`執行失敗: ${errorMessage.value}`);
  }
};

// 檢查是否有之前的分析結果
onMounted(async () => {
  // 嘗試從共享數據中獲取之前的分析結果
  const previousResults = getSharedData("statisticResults");
  if (previousResults && previousResults.nodeId === props.id) {
    console.log("找到之前的分析結果:", previousResults);
    // 可以選擇是否要恢復之前的結果
    // factors.value = previousResults.factors;
    // chiSquareValue.value = previousResults.chiSquareValue;
    // pValue.value = previousResults.pValue;
  }
});

// 清除錯誤
const handleClearError = async () => {
  await clearNodeError(props.id);
};

// 暴露方法給父元件
defineExpose({
  handleRun,
  processData,
  handleClearError,
});
</script>

<style scoped>
.factor-bar {
  @apply transition-all duration-300 ease-in-out;
}
</style>
