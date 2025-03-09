<template>
  <BaseNode
    :id="id"
    ref="nodeRef"
    node-type="custom-input"
    :title="title"
    :description="description"
    :icon="GitBranch"
    :selected="selected"
    :disabled="disabled"
    :node-width="nodeWidth"
    :node-height="nodeHeight"
    :show-handle-labels="showHandleLabels"
    header-bg-color="#d0f0c0"
    :show-resizer="showResizer"
    :handles="handles"
    @handle-connect="handleConnect"
    @handle-disconnect="handleDisconnect"
    @run="handleRun">
    <div class="p-4">
      <div class="mb-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">決策樹模型參數</h3>
        <el-form
          label-position="top"
          size="small">
          <el-form-item label="最大深度">
            <el-input-number
              v-model="formData.maxDepth"
              :min="1"
              :max="10"
              :step="1"
              class="w-full" />
          </el-form-item>

          <el-form-item label="最小分裂樣本數">
            <el-input-number
              v-model="formData.minSamplesSplit"
              :min="2"
              :max="20"
              :step="1"
              class="w-full" />
          </el-form-item>

          <el-form-item label="目標變量">
            <el-select
              v-model="formData.targetVariable"
              placeholder="請選擇目標變量"
              class="w-full">
              <el-option
                v-for="variable in targetVariables"
                :key="variable"
                :label="variable"
                :value="variable" />
            </el-select>
          </el-form-item>

          <el-form-item label="選擇特徵變量">
            <el-select
              v-model="formData.featureVariables"
              multiple
              filterable
              placeholder="請選擇特徵變量"
              class="w-full">
              <el-option
                v-for="variable in featureVariables"
                :key="variable"
                :label="variable"
                :value="variable" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="nodeContext && nodeContext.output">
        <el-divider content-position="left">分析結果</el-divider>
        <div class="result-container">
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">決策樹視覺化</h4>
            <div class="decision-tree-visualization">
              <el-image
                v-if="nodeContext.output && nodeContext.output.treeImageUrl"
                :src="nodeContext.output.treeImageUrl"
                fit="contain"
                class="w-full" />
              <div
                v-else
                class="text-gray-500 text-sm">
                執行節點後將顯示決策樹視覺化
              </div>
            </div>
          </div>

          <div
            v-if="nodeContext.output && nodeContext.output.modelInfo"
            class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">模型信息</h4>
            <el-descriptions
              :column="1"
              border>
              <el-descriptions-item label="準確率">
                {{ (nodeContext.output.modelInfo.accuracy * 100).toFixed(2) }}%
              </el-descriptions-item>
              <el-descriptions-item label="樣本數量">
                {{ nodeContext.output.modelInfo.sampleCount }}
              </el-descriptions-item>
              <el-descriptions-item label="特徵重要性">
                <div
                  v-for="(importance, feature) in nodeContext.output.modelInfo
                    .featureImportance"
                  :key="feature">
                  <span>{{ feature }}: </span>
                  <el-progress
                    :percentage="Math.round(importance * 100)"
                    :color="getImportanceColor(importance)" />
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <el-button
          type="primary"
          @click="handleRun"
          :loading="executing"
          :disabled="!canAnalyze">
          執行決策樹分析
        </el-button>
      </div>
    </div>
  </BaseNode>
</template>

<script setup>
import BaseNode from "../base/BaseNode.vue";
import { useFlowStore } from "@/stores/flowStore";
import { storeToRefs } from "pinia";
import { useFlowInstance } from "@/composables/useFlowInstance";
import { GitBranch } from "lucide-vue-next";

// 定義 props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "決策樹分析",
  },
  description: {
    type: String,
    default: "使用決策樹模型分析數據並提供視覺化結果",
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
  style: {
    type: Object,
    default: () => ({}),
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

// 定義事件
const emit = defineEmits([
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

// 使用流程實例 composable
const {
  executeNode,
  clearNodeError,
  flowStore,
  updateSharedData,
  getSharedData,
  getExecutionPhase,
} = useFlowInstance();

// 節點引用
const nodeRef = ref(null);

// 初始化 nodeContext，提供默認值避免 undefined 錯誤
const nodeContext = ref({
  output: null,
  input: null,
  status: "idle",
});

// 分析狀態
const executing = ref(false);
// 移除本地狀態變數，使用 BaseNode 的 nodeState.status
const errorMessage = ref("");
const errorDetails = ref(null);
const outputData = ref(null);

// 可用的目標變量
const targetVariables = ref([
  "缺陷率",
  "產品品質",
  "生產良率",
  "客戶滿意度",
  "故障頻率",
]);

// 可用的特徵變量
const featureVariables = ref([
  "溫度",
  "壓力",
  "濕度",
  "機器設備",
  "操作員",
  "原料供應商",
  "生產批次",
  "生產速度",
  "維護頻率",
  "工作時段",
]);

// 模擬數據
// 0-4 隨機數
const getRandomNumber = () => {
  return Math.floor(Math.random() * 5);
};
const mokeTargetVariable = targetVariables.value[getRandomNumber()];

// 從 featureVariables 中隨機選擇 3 個
const mokeFeatureVariables = featureVariables.value.slice(
  getRandomNumber(),
  getRandomNumber() + 3
);
// 表單數據
const formData = ref({
  maxDepth: 3,
  minSamplesSplit: 5,
  targetVariable: mokeTargetVariable,
  featureVariables: mokeFeatureVariables,
});

// 計算是否可以分析
const canAnalyze = computed(() => {
  return (
    formData.value.targetVariable && formData.value.featureVariables.length > 0
  );
});

// 獲取特徵重要性顏色
const getImportanceColor = (importance) => {
  if (importance > 0.6) return "#67c23a"; // 綠色
  if (importance > 0.3) return "#e6a23c"; // 黃色
  return "#f56c6c"; // 紅色
};

// 數據處理函數
const processData = (inputData) => {
  return new Promise((resolve) => {
    // 模擬數據處理
    setTimeout(() => {
      // 模擬結果 - 實際應用中這部分會由後端返回
      const mockResult = {
        treeImageUrl: "/uploads/iym/tree.png", // 使用指定的圖片路徑
        modelInfo: {
          accuracy: 0.87,
          sampleCount: 1250,
          featureImportance: {
            溫度: 0.35,
            壓力: 0.25,
            濕度: 0.15,
            原料供應商: 0.12,
            維護頻率: 0.08,
            操作員: 0.05,
          },
        },
        myName: "john",
      };

      resolve(mockResult);
    }, 5000);
  });
};

// 統一的狀態更新方法
const updateNodeStatus = (newStatus, result = null, error = null) => {
  console.log(
    `[DecisionTreeAnalysisNode] 更新節點 ${props.id} 狀態為 ${newStatus}`
  );

  // 如果有節點引用，使用 BaseNode 中的方法更新狀態
  if (nodeRef.value) {
    console.log(`[DecisionTreeAnalysisNode] 使用 nodeRef 更新狀態`);
    nodeRef.value.updateNodeStatus(newStatus, result, error);
  } else {
    // 如果節點引用不可用，直接更新 flowStore
    console.log(
      `[DecisionTreeAnalysisNode] nodeRef 不可用，直接更新 flowStore`
    );
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
    `[${new Date().toISOString()}] 決策樹分析節點 handleRun 被調用`,
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

    console.log("準備執行決策樹分析，輸入數據:", inputData);

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
    ElMessage.success("決策樹分析完成");

    // 統一使用 updateNodeStatus 方法更新狀態
    updateNodeStatus("completed", result);

    return result;
  } catch (error) {
    console.error("決策樹分析失敗", error);
    ElMessage.error(`決策樹分析失敗: ${error.message || "未知錯誤"}`);

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
    nodeContext.value = {
      ...nodeContext.value,
      output: previousData.detail,
    };
  }
});

// 暴露方法給父元件
defineExpose({
  handleRun,
  handleClearError,
});
</script>

<style scoped>
.decision-tree-visualization {
  min-height: 300px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 8px;
  background-color: #f9fafb;
}

.result-container {
  max-height: 400px;
  overflow-y: auto;
}
</style>
