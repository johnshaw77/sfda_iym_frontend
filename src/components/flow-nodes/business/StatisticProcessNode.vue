<template>
  <BaseNode
    :id="id"
    ref="nodeRef"
    node-type="statistic-process"
    :title="title"
    :description="description"
    :icon="BarChart2"
    :selected="selected"
    :disabled="disabled"
    :node-width="nodeWidth"
    :node-height="nodeHeight"
    :show-handle-labels="showHandleLabels"
    header-bg-color="#bfdeee"
    :show-resizer="false"
    :handles="handles"
    @handle-connect="handleConnect"
    @handle-disconnect="handleDisconnect"
    @run="handleRun">
    <div class="p-4">
      <!-- 參數設定區域 -->
      <div class="mb-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">4M1E 分析參數</h3>
        <el-form
          label-position="top"
          size="small">
          <el-form-item label="分析方法">
            <el-select
              v-model="formData.analysisMethod"
              placeholder="請選擇分析方法"
              class="w-full">
              <el-option
                v-for="method in analysisMethods"
                :key="method.value"
                :label="method.label"
                :value="method.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="顯示項目數量">
            <el-input-number
              v-model="formData.displayCount"
              :min="3"
              :max="10"
              :step="1"
              class="w-full" />
          </el-form-item>

          <el-form-item label="顯示閾值 (%)">
            <el-slider
              v-model="formData.threshold"
              :min="0"
              :max="100"
              :step="5"
              show-input />
          </el-form-item>
        </el-form>
      </div>

      <!-- 分析結果區域 -->
      <div v-if="nodeContext && nodeContext.output">
        <el-divider content-position="left">分析結果</el-divider>
        <div class="result-container">
          <!-- 4M1E 分析結果 -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">
              4M1E 分析結果
            </h4>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="space-y-3">
                <div
                  v-for="(factor, index) in nodeContext.output.factors"
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
          </div>

          <!-- 統計資訊 -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">統計資訊</h4>
            <el-descriptions
              :column="2"
              border>
              <el-descriptions-item label="卡方值">
                {{ nodeContext.output.chiSquareValue }}
              </el-descriptions-item>
              <el-descriptions-item label="P值">
                {{ nodeContext.output.pValue }}
              </el-descriptions-item>
              <el-descriptions-item
                label="分析時間"
                :span="2">
                {{ formatTimestamp(nodeContext.output.timestamp) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>

      <!-- 執行按鈕 -->
      <div class="mt-4">
        <el-button
          type="primary"
          @click="handleRun"
          :loading="executing"
          :disabled="!canAnalyze">
          執行統計分析
        </el-button>
      </div>
    </div>
  </BaseNode>
</template>

<script setup>
import BaseNode from "../base/BaseNode.vue";
import { useFlowInstance } from "@/composables/useFlowInstance";
import { BarChart2 } from "lucide-vue-next";
import { logger } from "@/utils/logger";
import { formatTimestamp } from "@/utils/dateUtils";
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
  disabled: {
    type: Boolean,
    default: false,
  },
  nodeWidth: {
    type: Number,
    default: 450,
  },
  nodeHeight: {
    type: Number,
    default: 650,
  },
  showHandleLabels: {
    type: Boolean,
    default: false,
  },
  showResizer: {
    type: Boolean,
    default: true,
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

// 節點狀態
const errorMessage = ref("");
const errorDetails = ref(null);
const outputData = ref(null);
const nodeRef = ref(null);
const executing = ref(false);

// 初始化 nodeContext，提供默認值避免 undefined 錯誤
const nodeContext = ref({
  output: null,
  input: null,
  status: "idle",
});

// 分析方法選項
const analysisMethods = [
  { label: "卡方分析", value: "chi_square" },
  { label: "帕累托分析", value: "pareto" },
  { label: "因果分析", value: "cause_effect" },
];

// 表單數據
const formData = ref({
  analysisMethod: "chi_square",
  displayCount: 5,
  threshold: 20,
});

// 計算是否可以分析
const canAnalyze = computed(() => {
  return formData.value.analysisMethod !== "";
});

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

// 事件處理
const emit = defineEmits([
  "update:data",
  "handle-connect",
  "handle-disconnect",
]);

const handleConnect = (data) => {
  emit("handle-connect", { id: props.id, ...data });
};

const handleDisconnect = (data) => {
  emit("handle-disconnect", { id: props.id, ...data });
};

// 數據處理函數
const processData = (inputData) => {
  return new Promise((resolve) => {
    // 模擬數據處理
    setTimeout(() => {
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
    }, 3000);
  });
};

// 統一的狀態更新方法
const updateNodeStatus = (newStatus, result = null, error = null) => {
  logger.debug(
    "StatisticProcessNode",
    `更新節點 ${props.id} 狀態為 ${newStatus}`
  );

  // 如果有節點引用，使用 BaseNode 中的方法更新狀態
  if (nodeRef.value) {
    logger.debug("StatisticProcessNode", `使用 nodeRef 更新狀態`);
    nodeRef.value.updateNodeStatus(newStatus, result, error);
  } else {
    // 如果節點引用不可用，直接更新 flowStore
    logger.debug("StatisticProcessNode", `nodeRef 不可用，直接更新 flowStore`);
    flowStore.updateNodeState(flowStore.currentInstance?.id, props.id, {
      status: newStatus,
      data: result,
      error: error ? error.message || "未知錯誤" : null,
      _isDataUpdate: true, // 標記為數據更新
    });
  }
};

// 執行節點
const handleRun = async (context = {}) => {
  logger.info("StatisticProcessNode", `統計分析節點 handleRun 被調用`);
  logger.debug("StatisticProcessNode", "上下文數據:", context);

  // 檢查是否有來自上一個節點的數據
  if (context && context.sourceNodeId) {
    logger.info(
      "StatisticProcessNode",
      `節點 ${props.id} 被節點 ${context.sourceNodeId} 自動觸發執行`
    );

    // 如果有上一個節點的輸出數據，可以使用它
    if (context.sourceNodeOutput) {
      logger.debug("StatisticProcessNode", `收到上一個節點的輸出數據`);
      // 這裡可以根據需要處理上一個節點的輸出數據
    }

    // 如果有客訴單號，可以使用它
    if (context.complaintId) {
      logger.debug(
        "StatisticProcessNode",
        `使用客訴單號: ${context.complaintId}`
      );
      // 這裡可以根據客訴單號獲取相關數據
    }
  }

  executing.value = true;

  try {
    // 統一使用 updateNodeStatus 方法更新狀態
    updateNodeStatus("running");

    errorMessage.value = "";
    errorDetails.value = null;

    // 準備輸入數據
    const inputData = {
      // 如果有上下文數據，則包含在輸入數據中
      ...(context || {}),
      analysisMethod: formData.value.analysisMethod,
      displayCount: formData.value.displayCount,
      threshold: formData.value.threshold,
      timestamp: new Date().toISOString(),
    };

    logger.info("StatisticProcessNode", "準備執行統計分析");
    logger.debug("StatisticProcessNode", "輸入數據:", inputData);

    // 使用 composable 執行節點
    const result = await executeNode(props.id, inputData, processData);

    // 將分析結果保存到共享數據中
    await updateSharedData(props.id, {
      detail: result,
      timestamp: new Date().toISOString(),
      nodeId: props.id,
      nodeName: props.title,
    });

    // 更新本地狀態
    outputData.value = result;
    nodeContext.value = {
      ...nodeContext.value,
      output: result,
    };

    ElMessage.success("統計處理執行成功");

    // 構建完整的結果對象
    const completeResult = {
      factors: result.factors,
      chiSquareValue: result.chiSquareValue,
      pValue: result.pValue,
      timestamp: result.timestamp,
      nodeId: props.id,
      nodeName: props.title,
      ...result,
      // 如果有客訴單號等重要信息，也傳遞過去
      ...(context.complaintId
        ? {
            complaintId: context.complaintId,
            complaintDetail: context.complaintDetail,
          }
        : {}),
    };

    // 統一使用 updateNodeStatus 方法更新狀態
    updateNodeStatus("completed", completeResult);

    // 觸發節點狀態變更事件，確保工作流管理器能夠捕獲到
    const event = new CustomEvent("node:stateChange", {
      detail: {
        nodeId: props.id,
        status: "completed",
        result: completeResult,
        timestamp: new Date().toISOString(),
      },
    });
    window.dispatchEvent(event);

    logger.info("StatisticProcessNode", "節點執行完成，已觸發狀態變更事件");

    return completeResult;
  } catch (error) {
    logger.error("StatisticProcessNode", "統計分析失敗", error);
    ElMessage.error(`執行失敗: ${error.message || "未知錯誤"}`);

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
    logger.info("StatisticProcessNode", "找到之前的分析結果");
    logger.debug("StatisticProcessNode", "之前的分析結果:", previousData);

    // 恢復之前的分析結果
    nodeContext.value = {
      ...nodeContext.value,
      output: previousData.detail,
    };
  }
});

// 暴露方法給父元件
defineExpose({
  handleRun,
  processData,
  handleClearError,
});
</script>

<style scoped>
.result-container {
  max-height: 400px;
  overflow-y: auto;
}
</style>
