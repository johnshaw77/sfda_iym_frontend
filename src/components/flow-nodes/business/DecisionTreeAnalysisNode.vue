<template>
  <BaseNode
    :id="id"
    node-type="custom-input"
    title="決策樹分析"
    description="使用決策樹模型分析數據並提供視覺化結果"
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
    @run="handleAnalyze">
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
          @click="handleAnalyze"
          :loading="analyzing"
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
const { executeNode, clearNodeError, flowStore } = useFlowInstance();
const { currentInstance } = storeToRefs(flowStore);

// 初始化 nodeContext，提供默認值避免 undefined 錯誤
const nodeContext = ref({
  output: null,
  input: null,
  status: "idle",
});

// 表單數據
const formData = ref({
  maxDepth: 3,
  minSamplesSplit: 5,
  targetVariable: "",
  featureVariables: [],
});

// 分析狀態
const analyzing = ref(false);

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

// 執行決策樹分析
const handleAnalyze = async () => {
  if (!canAnalyze.value) {
    ElMessage.warning("請先選擇目標變量和至少一個特徵變量");
    return;
  }

  analyzing.value = true;
  try {
    const result = await executeNode(props.id, {
      action: "analyze",
      params: {
        maxDepth: formData.value.maxDepth,
        minSamplesSplit: formData.value.minSamplesSplit,
        targetVariable: formData.value.targetVariable,
        featureVariables: formData.value.featureVariables,
      },
    });

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
    };

    // 更新節點上下文
    nodeContext.value = {
      ...nodeContext.value,
      output: mockResult,
      status: "completed",
    };

    ElMessage.success("決策樹分析完成");
  } catch (error) {
    console.error("決策樹分析失敗", error);
    ElMessage.error(`決策樹分析失敗: ${error.message || "未知錯誤"}`);
    // 設置錯誤狀態
    nodeContext.value.status = "error";
  } finally {
    analyzing.value = false;
  }
};
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
