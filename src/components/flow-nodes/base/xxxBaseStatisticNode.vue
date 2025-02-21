<template>
  <BaseNode
    :id="id"
    :type="type"
    :title="title"
    :description="description"
    :icon="icon"
    :status="status"
    :selected="selected"
    :disabled="disabled"
    :handles="handles"
    :style="style"
    :show-handle-labels="showHandleLabels"
    :header-bg-color="headerBgColor"
    :header-border-color="headerBorderColor"
    :min-width="minWidth"
    :min-height="minHeight"
    @click="handleClick"
    @handle-connect="handleConnect"
    @handle-disconnect="handleDisconnect"
  >
    <template #content>
      <!-- 統計分析相關的內容 -->
      <div class="p-4 space-y-4">
        <!-- 分析方法選擇 -->
        <div v-if="showMethodSelect" class="space-y-2">
          <label class="text-sm font-medium text-gray-700">分析方法</label>
          <el-select
            v-model="analysisMethod"
            class="w-full"
            placeholder="請選擇分析方法"
            @change="handleMethodChange"
          >
            <el-option
              v-for="method in availableMethods"
              :key="method.value"
              :label="method.label"
              :value="method.value"
            />
          </el-select>
        </div>

        <!-- 參數配置 -->
        <div v-if="showParameters" class="space-y-2">
          <label class="text-sm font-medium text-gray-700">參數設定</label>
          <div class="space-y-2">
            <template v-for="param in methodParameters" :key="param.name">
              <!-- 數值型參數 -->
              <div v-if="param.type === 'number'" class="space-y-1">
                <label class="text-xs text-gray-600">{{ param.label }}</label>
                <el-input-number
                  v-model="parameters[param.name]"
                  :min="param.min"
                  :max="param.max"
                  :step="param.step"
                  class="w-full"
                  @change="handleParameterChange"
                />
              </div>

              <!-- 選項型參數 -->
              <div v-else-if="param.type === 'select'" class="space-y-1">
                <label class="text-xs text-gray-600">{{ param.label }}</label>
                <el-select
                  v-model="parameters[param.name]"
                  class="w-full"
                  @change="handleParameterChange"
                >
                  <el-option
                    v-for="option in param.options"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </div>

              <!-- 布林型參數 -->
              <div v-else-if="param.type === 'boolean'" class="space-y-1">
                <el-switch
                  v-model="parameters[param.name]"
                  :active-text="param.label"
                  @change="handleParameterChange"
                />
              </div>
            </template>
          </div>
        </div>

        <!-- 分析結果 -->
        <div v-if="showResults" class="space-y-2">
          <label class="text-sm font-medium text-gray-700">分析結果</label>
          <div class="p-2 bg-gray-50 rounded text-sm">
            <template v-if="loading">
              <div class="flex items-center justify-center py-2">
                <el-icon class="animate-spin mr-2">
                  <Loading />
                </el-icon>
                正在計算...
              </div>
            </template>
            <template v-else-if="error">
              <div class="text-red-500">{{ error }}</div>
            </template>
            <template v-else>
              <pre class="whitespace-pre-wrap">{{ results }}</pre>
            </template>
          </div>
        </div>
      </div>
    </template>
  </BaseNode>
</template>

<script setup>
/**
 * TODO: check this file, it should be no longer used!!
 */
import { ref, computed } from "vue";
import BaseNode from "./BaseNode.vue";
import { Loading } from "@element-plus/icons-vue";

// 定義 props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "statistic-process",
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
    required: true,
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
      inputs: ["data"],
      outputs: ["result"],
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
  showMethodSelect: {
    type: Boolean,
    default: true,
  },
  showParameters: {
    type: Boolean,
    default: true,
  },
  showResults: {
    type: Boolean,
    default: true,
  },
  apiEndpoint: {
    type: String,
    default: "",
  },
});

// 定義事件
const emit = defineEmits([
  "click",
  "handle-connect",
  "handle-disconnect",
  "method-change",
  "parameter-change",
  "update:data",
]);

// 內部狀態
const analysisMethod = ref("");
const parameters = ref({});
const loading = ref(false);
const error = ref(null);
const results = ref(null);

// 可用的分析方法
const availableMethods = [
  { value: "chi-square", label: "卡方檢定" },
  { value: "t-test", label: "T 檢定" },
  { value: "correlation", label: "相關性分析" },
  { value: "regression", label: "回歸分析" },
  { value: "anova", label: "變異數分析" },
];

// 根據分析方法獲取參數配置
const methodParameters = computed(() => {
  switch (analysisMethod.value) {
    case "chi-square":
      return [
        {
          name: "significance",
          label: "顯著水準",
          type: "number",
          min: 0.01,
          max: 0.1,
          step: 0.01,
          default: 0.05,
        },
      ];
    case "t-test":
      return [
        {
          name: "type",
          label: "檢定類型",
          type: "select",
          options: [
            { value: "one-sample", label: "單樣本" },
            { value: "two-sample", label: "雙樣本" },
            { value: "paired", label: "成對樣本" },
          ],
        },
        {
          name: "significance",
          label: "顯著水準",
          type: "number",
          min: 0.01,
          max: 0.1,
          step: 0.01,
          default: 0.05,
        },
      ];
    // ... 其他分析方法的參數配置
    default:
      return [];
  }
});

// 事件處理
const handleClick = (event) => {
  emit("click", event);
};

const handleConnect = (event) => {
  emit("handle-connect", event);
};

const handleDisconnect = (event) => {
  emit("handle-disconnect", event);
};

const handleMethodChange = () => {
  // 重置參數
  parameters.value = {};
  // 設置默認值
  methodParameters.value.forEach((param) => {
    if (param.default !== undefined) {
      parameters.value[param.name] = param.default;
    }
  });
  emit("method-change", {
    method: analysisMethod.value,
    parameters: parameters.value,
  });
};

const handleParameterChange = () => {
  emit("parameter-change", {
    method: analysisMethod.value,
    parameters: parameters.value,
  });
};

// 修改 startAnalysis 方法
const startAnalysis = async (data) => {
  try {
    loading.value = true;
    error.value = null;

    const requestData = {
      method: analysisMethod.value,
      parameters: parameters.value,
      data: data,
    };

    // 使用 BaseNode 的 API 呼叫功能
    const result = await handleApiCall(requestData);

    if (result) {
      results.value = result;
    } else {
      // 如果沒有 API 端點，使用本地模擬分析
      results.value = {
        method: analysisMethod.value,
        parameters: parameters.value,
        data: data,
        results: "分析結果將在這裡顯示",
      };
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// 暴露方法
defineExpose({
  // 重置狀態
  reset() {
    analysisMethod.value = "";
    parameters.value = {};
    loading.value = false;
    error.value = null;
    results.value = null;
  },
});
</script>

<style scoped>
.el-input-number.w-full :deep(.el-input__wrapper) {
  width: 100%;
}
</style>
