<template>
  <BaseNode
    :id="id"
    node-type="custom-input"
    title="相關性分析"
    description="分析數據集中變量之間的相關性"
    :icon="BarChartHorizontalBig"
    :selected="selected"
    :disabled="disabled"
    :node-width="nodeWidth"
    :node-height="nodeHeight"
    :show-handle-labels="showHandleLabels"
    header-bg-color="#bfdeee"
    :show-resizer="showResizer"
    :handles="handles"
    @handle-connect="handleConnect"
    @handle-disconnect="handleDisconnect"
  >
    <div class="p-4">
      <div class="mb-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">相關性分析設定</h3>
        <el-form label-position="top" size="small">
          <el-form-item label="分析方法">
            <el-select
              v-model="formData.method"
              placeholder="請選擇分析方法"
              class="w-full"
            >
              <el-option label="皮爾森相關係數 (Pearson)" value="pearson" />
              <el-option label="斯皮爾曼相關係數 (Spearman)" value="spearman" />
              <el-option label="肯德爾相關係數 (Kendall)" value="kendall" />
            </el-select>
          </el-form-item>

          <el-form-item label="顯著性水平 (p-value)">
            <el-input-number
              v-model="formData.significanceLevel"
              :min="0.001"
              :max="0.1"
              :step="0.001"
              :precision="3"
              class="w-full"
            />
          </el-form-item>

          <el-form-item label="相關性熱圖顏色">
            <el-select
              v-model="formData.colorMap"
              placeholder="請選擇熱圖顏色"
              class="w-full"
            >
              <el-option label="藍紅 (coolwarm)" value="coolwarm" />
              <el-option label="彩虹 (rainbow)" value="rainbow" />
              <el-option label="熱力 (hot)" value="hot" />
              <el-option label="藍綠紅 (viridis)" value="viridis" />
            </el-select>
          </el-form-item>

          <el-form-item label="篩選閾值">
            <el-slider
              v-model="formData.threshold"
              :min="0"
              :max="1"
              :step="0.05"
              show-input
            />
          </el-form-item>
        </el-form>
      </div>

      <div class="mb-4">
        <el-divider content-position="left">輸入/輸出設定</el-divider>
        <el-form label-position="top" size="small">
          <el-form-item label="輸入數據欄位">
            <el-select
              v-model="formData.inputColumns"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="請選擇或輸入欄位名稱"
              class="w-full"
            >
              <el-option
                v-for="column in availableColumns"
                :key="column"
                :label="column"
                :value="column"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="輸出格式">
            <el-radio-group v-model="formData.outputFormat">
              <el-radio label="matrix">矩陣</el-radio>
              <el-radio label="list">列表</el-radio>
              <el-radio label="both">兩者</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="nodeContext.output">
        <el-divider content-position="left">分析結果</el-divider>
        <div class="result-container">
          <div v-if="nodeContext.output.correlationMatrix" class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">相關性矩陣</h4>
            <div class="correlation-heatmap">
              <!-- 這裡可以使用 echarts 或其他圖表庫顯示熱圖 -->
              <el-image
                v-if="nodeContext.output.heatmapUrl"
                :src="nodeContext.output.heatmapUrl"
                fit="contain"
                class="w-full"
              />
              <div v-else class="text-gray-500 text-sm">
                執行節點後將顯示熱圖
              </div>
            </div>
          </div>

          <div
            v-if="
              nodeContext.output.significantPairs &&
              nodeContext.output.significantPairs.length > 0
            "
          >
            <h4 class="text-sm font-medium text-gray-700 mb-2">顯著相關對</h4>
            <el-table
              :data="nodeContext.output.significantPairs"
              stripe
              style="width: 100%"
            >
              <el-table-column prop="variable1" label="變量1" />
              <el-table-column prop="variable2" label="變量2" />
              <el-table-column prop="correlation" label="相關係數">
                <template #default="scope">
                  <span :class="getCorrelationClass(scope.row.correlation)">
                    {{ scope.row.correlation.toFixed(4) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="pValue" label="p值">
                <template #default="scope">
                  {{ scope.row.pValue.toExponential(2) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <el-button
          type="primary"
          @click="handleAnalyze"
          :loading="analyzing"
          :disabled="!canAnalyze"
        >
          執行相關性分析
        </el-button>
      </div>
    </div>
  </BaseNode>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { BarChartHorizontalBig } from "lucide-vue-next";
import BaseNode from "../base/BaseNode.vue";
import { ElMessage } from "element-plus";
import { performCorrelationAnalysis } from "@/api/modules/analysis";
import { useFlowInstanceStore } from "@/stores/flowInstance";
import { storeToRefs } from "pinia";

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
    default: 400,
  },
  nodeHeight: {
    type: Number,
    default: 600,
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
    default: false,
  },
});

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

// 獲取 store
const flowInstanceStore = useFlowInstanceStore();
const { currentInstance } = storeToRefs(flowInstanceStore);

// 是否處於設計模式(在模板頁面中，節點不會執行)
const isDesingMode = computed(() => {
  return flowInstanceStore !== undefined;
});

// 表單數據
const formData = ref({
  method: "pearson",
  significanceLevel: 0.05,
  colorMap: "coolwarm",
  threshold: 0.5,
  inputColumns: [],
  outputFormat: "both",
});

// 分析狀態
const analyzing = ref(false);

// 可用的數據欄位
const availableColumns = ref([
  "temperature",
  "pressure",
  "humidity",
  "wind_speed",
  "particle_count",
  "yield",
  "defect_rate",
  "cycle_time",
]);

// 計算是否可以分析
const canAnalyze = computed(() => {
  return formData.value.inputColumns.length >= 2;
});

// 獲取相關係數的樣式類
const getCorrelationClass = (value) => {
  const absValue = Math.abs(value);
  if (absValue > 0.7) {
    return value > 0 ? "text-red-600 font-bold" : "text-blue-600 font-bold";
  } else if (absValue > 0.4) {
    return value > 0 ? "text-orange-500" : "text-blue-500";
  } else {
    return "text-gray-500";
  }
};

// 執行相關性分析
const handleAnalyze = async () => {
  if (!canAnalyze.value) {
    ElMessage.warning("請至少選擇兩個數據欄位進行分析");
    return;
  }

  try {
    analyzing.value = true;

    // 準備輸入數據
    const inputData = {
      method: formData.value.method,
      significanceLevel: formData.value.significanceLevel,
      colorMap: formData.value.colorMap,
      threshold: formData.value.threshold,
      columns: formData.value.inputColumns,
      outputFormat: formData.value.outputFormat,
    };

    // 執行節點
    await flowInstanceStore.executeNode(
      currentInstance.value.id,
      props.id,
      inputData
    );

    ElMessage.success("相關性分析完成");
  } catch (error) {
    console.error("相關性分析失敗:", error);
    ElMessage.error(`分析失敗: ${error.message || "未知錯誤"}`);
  } finally {
    analyzing.value = false;
  }
};

// 監聽上下文變化
const nodeContext = computed(() => {
  return flowInstanceStore.getNodeContext(props.id);
});

// 當節點連接到數據源時，自動獲取可用欄位
watch(
  () => nodeContext.value.input,
  (newInput) => {
    if (newInput && newInput.dataset && newInput.dataset.columns) {
      availableColumns.value = newInput.dataset.columns;
    }
  },
  { deep: true }
);

// 組件掛載時初始化
onMounted(() => {
  // 如果已有上下文數據，則恢復表單狀態
  if (nodeContext.value && nodeContext.value.input) {
    const input = nodeContext.value.input;
    if (input.method) formData.value.method = input.method;
    if (input.significanceLevel)
      formData.value.significanceLevel = input.significanceLevel;
    if (input.colorMap) formData.value.colorMap = input.colorMap;
    if (input.threshold) formData.value.threshold = input.threshold;
    if (input.columns) formData.value.inputColumns = input.columns;
    if (input.outputFormat) formData.value.outputFormat = input.outputFormat;
  }
});
</script>

<style scoped>
.correlation-heatmap {
  width: 100%;
  min-height: 200px;
  background-color: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 8px;
}
</style>
