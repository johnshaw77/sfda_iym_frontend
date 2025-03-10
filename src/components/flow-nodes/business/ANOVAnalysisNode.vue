<template>
  <BaseNode
    :id="id"
    ref="nodeRef"
    node-type="anova-analysis"
    :title="title"
    :description="description"
    :icon="BarChart2"
    :selected="selected"
    :disabled="disabled"
    :node-width="nodeWidth"
    :node-height="nodeHeight"
    :show-handle-labels="showHandleLabels"
    header-bg-color="#e6f598"
    :show-resizer="false"
    :handles="handles"
    @handle-connect="handleConnect"
    @handle-disconnect="handleDisconnect"
    @run="handleRun">
    <div class="p-4">
      <div class="mb-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">ANOVA 分析設定</h3>
        <el-form
          label-position="top"
          size="small">
          <el-form-item label="分析類型">
            <el-select
              v-model="formData.anovaType"
              placeholder="請選擇分析類型"
              class="w-full">
              <el-option
                label="單因子變異數分析 (One-Way ANOVA)"
                value="one-way" />
              <el-option
                label="雙因子變異數分析 (Two-Way ANOVA)"
                value="two-way" />
              <el-option
                label="重複測量變異數分析 (RM-ANOVA)"
                value="repeated-measures" />
            </el-select>
          </el-form-item>

          <el-form-item label="顯著性水平 (α)">
            <el-input-number
              v-model="formData.alpha"
              :min="0.001"
              :max="0.1"
              :step="0.001"
              :precision="3"
              class="w-full" />
          </el-form-item>

          <el-form-item label="事後檢定方法">
            <el-select
              v-model="formData.postHocTest"
              placeholder="請選擇事後檢定方法"
              class="w-full">
              <el-option
                label="Tukey HSD"
                value="tukey" />
              <el-option
                label="Bonferroni"
                value="bonferroni" />
              <el-option
                label="Scheffe"
                value="scheffe" />
              <el-option
                label="無需事後檢定"
                value="none" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div class="mb-4">
        <el-divider content-position="left">變數設定</el-divider>
        <el-form
          label-position="top"
          size="small">
          <el-form-item label="因子變數 (Factor)">
            <el-select
              v-model="formData.factors"
              multiple
              :multiple-limit="formData.anovaType === 'one-way' ? 1 : 2"
              filterable
              placeholder="請選擇因子變數"
              class="w-full">
              <el-option
                v-for="factor in availableFactors"
                :key="factor"
                :label="factor"
                :value="factor" />
            </el-select>
            <div class="text-xs text-gray-500 mt-1">
              {{
                formData.anovaType === "one-way"
                  ? "單因子分析僅需選擇一個因子"
                  : "雙因子分析需選擇兩個因子"
              }}
            </div>
          </el-form-item>

          <el-form-item label="反應變數 (Response)">
            <el-select
              v-model="formData.response"
              filterable
              placeholder="請選擇反應變數"
              class="w-full">
              <el-option
                v-for="variable in availableResponses"
                :key="variable"
                :label="variable"
                :value="variable" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div class="mt-4 mb-4">
        <el-button
          type="primary"
          @click="handleRun"
          :loading="analyzing"
          :disabled="!canAnalyze">
          執行變異數分析
        </el-button>
      </div>

      <div
        v-if="nodeContext && nodeContext.output && nodeContext.output.results">
        <el-divider content-position="left">分析結果</el-divider>
        <div class="result-container">
          <!-- ANOVA 摘要表 -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">ANOVA 摘要表</h4>
            <el-table
              :data="nodeContext.output.results.summary"
              stripe
              style="width: 100%">
              <el-table-column
                prop="source"
                label="變異來源" />
              <el-table-column
                prop="df"
                label="自由度" />
              <el-table-column
                prop="sumSq"
                label="平方和">
                <template #default="scope">
                  {{ Number(scope.row.sumSq).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="meanSq"
                label="均方">
                <template #default="scope">
                  {{ Number(scope.row.meanSq).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="fValue"
                label="F值">
                <template #default="scope">
                  {{ Number(scope.row.fValue).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="pValue"
                label="p值">
                <template #default="scope">
                  <span
                    :class="{
                      'text-red-500 font-bold':
                        scope.row.pValue < formData.alpha,
                    }">
                    {{
                      scope.row.pValue < 0.001
                        ? "< 0.001"
                        : Number(scope.row.pValue).toFixed(4)
                    }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="significance"
                label="顯著性">
                <template #default="scope">
                  <span
                    v-if="scope.row.pValue < formData.alpha"
                    class="text-red-500"
                    >*</span
                  >
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 事後檢定結果 -->
          <div
            v-if="
              nodeContext.output.results.postHoc &&
              nodeContext.output.results.postHoc.length > 0
            "
            class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">
              事後檢定結果 ({{ formData.postHocTest }})
            </h4>
            <el-table
              :data="nodeContext.output.results.postHoc"
              stripe
              style="width: 100%">
              <el-table-column
                prop="comparison"
                label="組別比較" />
              <el-table-column
                prop="difference"
                label="均值差異">
                <template #default="scope">
                  {{ Number(scope.row.difference).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="lowerCI"
                label="信賴區間下限">
                <template #default="scope">
                  {{ Number(scope.row.lowerCI).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="upperCI"
                label="信賴區間上限">
                <template #default="scope">
                  {{ Number(scope.row.upperCI).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="pValue"
                label="p值">
                <template #default="scope">
                  <span
                    :class="{
                      'text-red-500 font-bold':
                        scope.row.pValue < formData.alpha,
                    }">
                    {{
                      scope.row.pValue < 0.001
                        ? "< 0.001"
                        : Number(scope.row.pValue).toFixed(4)
                    }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="significance"
                label="顯著性">
                <template #default="scope">
                  <span
                    v-if="scope.row.pValue < formData.alpha"
                    class="text-red-500"
                    >*</span
                  >
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 組別統計信息 -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">組別統計信息</h4>
            <el-table
              :data="nodeContext.output.results.groupStats"
              stripe
              style="width: 100%">
              <el-table-column
                prop="group"
                label="組別" />
              <el-table-column
                prop="n"
                label="樣本數" />
              <el-table-column
                prop="mean"
                label="平均值">
                <template #default="scope">
                  {{ Number(scope.row.mean).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="std"
                label="標準差">
                <template #default="scope">
                  {{ Number(scope.row.std).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="min"
                label="最小值">
                <template #default="scope">
                  {{ Number(scope.row.min).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="max"
                label="最大值">
                <template #default="scope">
                  {{ Number(scope.row.max).toFixed(2) }}
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 盒鬚圖顯示 -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">盒鬚圖比較</h4>
            <div class="boxplot-container bg-gray-50 p-4 rounded border">
              <div class="text-center text-gray-500">模擬盒鬚圖顯示區域</div>
              <div class="flex justify-around mt-4">
                <div
                  v-for="(stats, index) in nodeContext.output.results
                    .groupStats"
                  :key="index"
                  class="boxplot-item">
                  <div
                    class="boxplot-bar"
                    :style="{
                      height: `${30 + stats.mean * 10}px`,
                      backgroundColor: getGroupColor(index),
                    }"></div>
                  <div class="text-xs mt-1 text-center">{{ stats.group }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 解釋文字 -->
          <div class="bg-blue-50 p-3 rounded text-sm">
            <p
              v-if="nodeContext.output.results.isSignificant"
              class="text-blue-800">
              <strong>結論：</strong>
              根據分析結果，有足夠的證據表明組間存在顯著差異 (p
              {{
                nodeContext.output.results.mainPValue < 0.001
                  ? "< 0.001"
                  : `= ${nodeContext.output.results.mainPValue.toFixed(4)}`
              }})。
              {{ nodeContext.output.results.interpretation }}
            </p>
            <p
              v-else
              class="text-blue-800">
              <strong>結論：</strong>
              根據分析結果，沒有足夠的證據表明組間存在顯著差異 (p
              {{
                nodeContext.output.results.mainPValue < 0.001
                  ? "< 0.001"
                  : `= ${nodeContext.output.results.mainPValue.toFixed(4)}`
              }})。
            </p>
          </div>
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
import { BarChart2 } from "lucide-vue-next";
import { logger } from "@/utils/logger";

// 定義 props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "變異數分析(ANOVA)",
  },
  description: {
    type: String,
    default: "比較多組數據之間的差異顯著性",
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
    default: 800,
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
  "update:data",
  "handle-connect",
  "handle-disconnect",
]);

// 處理連接事件
const handleConnect = (data) => {
  emit("handle-connect", { id: props.id, ...data });
};

// 處理斷開連接事件
const handleDisconnect = (data) => {
  emit("handle-disconnect", { id: props.id, ...data });
};

// 節點引用
const nodeRef = ref(null);

// 使用流程實例 composable
const {
  executeNode,
  clearNodeError,
  flowStore,
  updateSharedData,
  getSharedData,
} = useFlowInstance();

// 初始化 nodeContext，提供默認值避免 undefined 錯誤
const nodeContext = ref({
  output: null,
  input: null,
  status: "idle",
});

// 表單數據
const formData = ref({
  anovaType: "one-way",
  alpha: 0.05,
  postHocTest: "tukey",
  factors: ["treatment"],
  response: "defect_rate",
});

// 分析狀態
const analyzing = ref(false);
const showResults = ref(false);

// 可用的因子變數
const availableFactors = ref([
  "treatment",
  "machine",
  "recipe",
  "operator",
  "batch",
  "temperature",
  "pressure",
  "supplier",
  "time",
]);

// 可用的反應變數
const availableResponses = ref([
  "yield",
  "defect_rate",
  "thickness",
  "resistivity",
  "cycle_time",
  "adhesion",
  "uniformity",
  "reliability",
]);

// 計算是否可以分析
const canAnalyze = computed(() => {
  if (formData.value.anovaType === "one-way") {
    return formData.value.factors.length === 1 && formData.value.response;
  } else {
    return formData.value.factors.length === 2 && formData.value.response;
  }
});

// 模擬的 ANOVA 結果
const anovaResults = ref({
  summary: [],
  postHoc: [],
  groupStats: [],
  isSignificant: false,
  mainPValue: 0,
  interpretation: "",
});

// 取得組別顏色
const getGroupColor = (index) => {
  const colors = [
    "#4299e1", // blue-500
    "#38b2ac", // teal-500
    "#ed8936", // orange-500
    "#667eea", // indigo-500
    "#9f7aea", // purple-500
    "#f56565", // red-500
    "#48bb78", // green-500
    "#ecc94b", // yellow-500
  ];
  return colors[index % colors.length];
};

// 獲取節點上下文
const getNodeContext = () => {
  return flowStore.getNodeContextById(props.id);
};

// 執行分析
const handleRun = async (context = {}) => {
  logger.info("ANOVAnalysisNode", `ANOVA 分析節點 handleRun 被調用`);
  logger.debug("ANOVAnalysisNode", "上下文數據:", context);

  // 檢查是否有來自上一個節點的數據
  if (context && context.sourceNodeId) {
    logger.info(
      "ANOVAnalysisNode",
      `節點 ${props.id} 被節點 ${context.sourceNodeId} 自動觸發執行`
    );

    // 如果有上一個節點的輸出數據，可以使用它
    if (context.sourceNodeOutput) {
      logger.debug("ANOVAnalysisNode", `收到上一個節點的輸出數據`);
      // 這裡可以根據需要處理上一個節點的輸出數據
    }
  }

  if (!canAnalyze.value) {
    ElMessage.warning("請先選擇必要的分析參數");
    return;
  }

  analyzing.value = true;

  try {
    // 更新節點狀態為執行中
    updateNodeStatus("running");

    // 準備輸入數據
    const inputData = {
      // 如果有上下文數據，則包含在輸入數據中
      ...(context || {}),
      anovaType: formData.value.anovaType,
      alpha: formData.value.alpha,
      postHocTest: formData.value.postHocTest,
      factors: formData.value.factors,
      response: formData.value.response,
      timestamp: new Date().toISOString(),
    };

    logger.info("ANOVAnalysisNode", "準備執行變異數分析");
    logger.debug("ANOVAnalysisNode", "輸入數據:", inputData);

    // 使用 composable 執行節點
    const result = await executeNode(props.id, inputData, async (input) => {
      // 模擬分析過程
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 生成模擬結果
      generateSimulatedResults();

      return {
        anovaType: input.anovaType,
        alpha: input.alpha,
        postHocTest: input.postHocTest,
        factors: input.factors,
        response: input.response,
        results: anovaResults.value,
        timestamp: new Date().toISOString(),
      };
    });

    // 將分析結果保存到共享數據中
    await updateSharedData(props.id, {
      detail: result,
      timestamp: new Date().toISOString(),
      nodeId: props.id,
      nodeName: props.title,
    });

    // 更新本地狀態
    nodeContext.value = {
      ...nodeContext.value,
      output: result,
    };
    showResults.value = true;

    ElMessage.success("ANOVA 分析完成");

    // 構建完整的結果對象
    const completeResult = {
      anovaType: result.anovaType,
      alpha: result.alpha,
      postHocTest: result.postHocTest,
      factors: result.factors,
      response: result.response,
      results: result.results,
      timestamp: result.timestamp,
      nodeId: props.id,
      nodeName: props.title,
      ...result,
    };

    // 更新節點狀態為完成
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

    logger.info("ANOVAnalysisNode", "節點執行完成，已觸發狀態變更事件");

    return completeResult;
  } catch (error) {
    logger.error("ANOVAnalysisNode", "ANOVA 分析失敗", error);
    ElMessage.error(`分析失敗: ${error.message || "未知錯誤"}`);

    // 更新節點狀態為錯誤
    updateNodeStatus("error", null, error);

    throw error;
  } finally {
    analyzing.value = false;
    // 重置 loading 狀態
    nodeRef.value?.setRunningState(false);
  }
};

// 清除錯誤
const handleClearError = async () => {
  await clearNodeError(props.id);
};

// 生成模擬的 ANOVA 結果
const generateSimulatedResults = () => {
  // 決定是否顯著
  const isSignificant = Math.random() > 0.3; // 70% 機率顯著
  const mainPValue = isSignificant
    ? Math.random() * 0.04
    : 0.05 + Math.random() * 0.3;

  if (formData.value.anovaType === "one-way") {
    // 單因子 ANOVA
    const factor = formData.value.factors[0];
    const groups = ["A組", "B組", "C組", "D組"];

    // 摘要表
    anovaResults.value.summary = [
      {
        source: factor,
        df: 3,
        sumSq: 250 + Math.random() * 100,
        meanSq: 85 + Math.random() * 30,
        fValue: isSignificant ? 8 + Math.random() * 15 : 1 + Math.random() * 2,
        pValue: mainPValue,
      },
      {
        source: "殘差",
        df: 36,
        sumSq: 450 + Math.random() * 100,
        meanSq: 12 + Math.random() * 5,
        fValue: null,
        pValue: null,
      },
      {
        source: "總和",
        df: 39,
        sumSq: 700 + Math.random() * 150,
        meanSq: null,
        fValue: null,
        pValue: null,
      },
    ];

    // 事後檢定
    if (isSignificant && formData.value.postHocTest !== "none") {
      anovaResults.value.postHoc = [
        {
          comparison: "A組 - B組",
          difference: 15 + Math.random() * 10,
          lowerCI: 5 + Math.random() * 3,
          upperCI: 25 + Math.random() * 5,
          pValue: Math.random() * 0.03,
        },
        {
          comparison: "A組 - C組",
          difference: 8 + Math.random() * 5,
          lowerCI: -2 - Math.random() * 2,
          upperCI: 18 + Math.random() * 4,
          pValue: 0.05 + Math.random() * 0.1,
        },
        {
          comparison: "A組 - D組",
          difference: 20 + Math.random() * 8,
          lowerCI: 10 + Math.random() * 3,
          upperCI: 30 + Math.random() * 5,
          pValue: Math.random() * 0.01,
        },
        {
          comparison: "B組 - C組",
          difference: -7 - Math.random() * 5,
          lowerCI: -17 - Math.random() * 3,
          upperCI: 3 + Math.random() * 2,
          pValue: 0.15 + Math.random() * 0.2,
        },
        {
          comparison: "B組 - D組",
          difference: 5 + Math.random() * 3,
          lowerCI: -5 - Math.random() * 2,
          upperCI: 15 + Math.random() * 3,
          pValue: 0.2 + Math.random() * 0.3,
        },
        {
          comparison: "C組 - D組",
          difference: 12 + Math.random() * 5,
          lowerCI: 2 + Math.random() * 2,
          upperCI: 22 + Math.random() * 4,
          pValue: Math.random() * 0.04,
        },
      ];
    } else {
      anovaResults.value.postHoc = [];
    }

    // 組別統計
    anovaResults.value.groupStats = groups.map((group, index) => {
      const baseMean = 50 + index * 10 * (isSignificant ? 1 : 0.2);
      const mean = baseMean + Math.random() * 5;
      const std = 5 + Math.random() * 3;

      return {
        group,
        n: 10,
        mean,
        std,
        min: mean - std * 2 - Math.random() * 5,
        max: mean + std * 2 + Math.random() * 5,
      };
    });

    // 結論
    anovaResults.value.isSignificant = isSignificant;
    anovaResults.value.mainPValue = mainPValue;
    anovaResults.value.interpretation = isSignificant
      ? `事後檢定顯示，A組和D組之間存在最顯著差異 (p < 0.01)，其次是A組和B組 (p < 0.05)。`
      : "";
  } else {
    // 雙因子 ANOVA
    const factorA = formData.value.factors[0];
    const factorB = formData.value.factors[1];

    // 模擬交互作用是否顯著
    const interactionSignificant = Math.random() > 0.5;
    const interactionPValue = interactionSignificant
      ? Math.random() * 0.04
      : 0.05 + Math.random() * 0.3;

    // 摘要表
    anovaResults.value.summary = [
      {
        source: factorA,
        df: 2,
        sumSq: 200 + Math.random() * 100,
        meanSq: 100 + Math.random() * 50,
        fValue: isSignificant ? 10 + Math.random() * 8 : 1 + Math.random() * 2,
        pValue: mainPValue,
      },
      {
        source: factorB,
        df: 1,
        sumSq: 150 + Math.random() * 80,
        meanSq: 150 + Math.random() * 80,
        fValue:
          Math.random() > 0.5 ? 15 + Math.random() * 10 : 1 + Math.random() * 2,
        pValue:
          Math.random() > 0.5
            ? Math.random() * 0.04
            : 0.05 + Math.random() * 0.3,
      },
      {
        source: `${factorA} × ${factorB}`,
        df: 2,
        sumSq: 120 + Math.random() * 60,
        meanSq: 60 + Math.random() * 30,
        fValue: interactionSignificant
          ? 6 + Math.random() * 6
          : 1 + Math.random() * 2,
        pValue: interactionPValue,
      },
      {
        source: "殘差",
        df: 24,
        sumSq: 240 + Math.random() * 60,
        meanSq: 10 + Math.random() * 3,
        fValue: null,
        pValue: null,
      },
      {
        source: "總和",
        df: 29,
        sumSq: 710 + Math.random() * 100,
        meanSq: null,
        fValue: null,
        pValue: null,
      },
    ];

    // 略過雙因子的事後檢定（太複雜）
    anovaResults.value.postHoc = [];

    // 組別統計
    const groupA1B1 = {
      group: "A1B1",
      n: 5,
      mean: 45 + Math.random() * 10,
      std: 4 + Math.random() * 2,
    };
    const groupA1B2 = {
      group: "A1B2",
      n: 5,
      mean: 55 + Math.random() * 10,
      std: 4 + Math.random() * 2,
    };
    const groupA2B1 = {
      group: "A2B1",
      n: 5,
      mean: 65 + Math.random() * 10,
      std: 4 + Math.random() * 2,
    };
    const groupA2B2 = {
      group: "A2B2",
      n: 5,
      mean: 75 + Math.random() * 10,
      std: 4 + Math.random() * 2,
    };
    const groupA3B1 = {
      group: "A3B1",
      n: 5,
      mean: 85 + Math.random() * 10,
      std: 4 + Math.random() * 2,
    };
    const groupA3B2 = {
      group: "A3B2",
      n: 5,
      mean: 95 + Math.random() * 10,
      std: 4 + Math.random() * 2,
    };

    // 計算最小值和最大值
    [groupA1B1, groupA1B2, groupA2B1, groupA2B2, groupA3B1, groupA3B2].forEach(
      (group) => {
        group.min = group.mean - group.std * 2 - Math.random() * 5;
        group.max = group.mean + group.std * 2 + Math.random() * 5;
      }
    );

    anovaResults.value.groupStats = [
      groupA1B1,
      groupA1B2,
      groupA2B1,
      groupA2B2,
      groupA3B1,
      groupA3B2,
    ];

    // 結論
    anovaResults.value.isSignificant = isSignificant || interactionSignificant;
    anovaResults.value.mainPValue = Math.min(mainPValue, interactionPValue);

    let interpretation = "";
    if (isSignificant && interactionSignificant) {
      interpretation = `分析顯示${factorA}的主效應顯著 (p = ${mainPValue.toFixed(
        4
      )})，且${factorA}與${factorB}之間存在顯著的交互作用 (p = ${interactionPValue.toFixed(
        4
      )})。`;
    } else if (isSignificant) {
      interpretation = `分析顯示${factorA}的主效應顯著 (p = ${mainPValue.toFixed(
        4
      )})，但未發現${factorA}與${factorB}之間存在顯著的交互作用。`;
    } else if (interactionSignificant) {
      interpretation = `分析顯示${factorA}與${factorB}之間存在顯著的交互作用 (p = ${interactionPValue.toFixed(
        4
      )})，但${factorA}的主效應不顯著。`;
    }

    anovaResults.value.interpretation = interpretation;
  }
};

// 當節點連接到數據源時，自動獲取可用欄位
watch(
  () => getNodeContext().input,
  (newInput) => {
    if (newInput && newInput.dataset) {
      if (newInput.dataset.categorical) {
        availableFactors.value = newInput.dataset.categorical;
      }
      if (newInput.dataset.numerical) {
        availableResponses.value = newInput.dataset.numerical;
      }
    }
  },
  { deep: true }
);

// 監聽分析類型變化
watch(
  () => formData.value.anovaType,
  (newType) => {
    if (newType === "one-way") {
      if (formData.value.factors.length > 1) {
        formData.value.factors = [formData.value.factors[0]];
      }
    }
  }
);

// 統一的狀態更新方法
const updateNodeStatus = (newStatus, result = null, error = null) => {
  logger.debug("ANOVAnalysisNode", `更新節點 ${props.id} 狀態為 ${newStatus}`);

  // 如果有節點引用，使用 BaseNode 中的方法更新狀態
  if (nodeRef.value) {
    logger.debug("ANOVAnalysisNode", `使用 nodeRef 更新狀態`);
    nodeRef.value.updateNodeStatus(newStatus, result, error);
  } else {
    // 如果節點引用不可用，直接更新 flowStore
    logger.debug("ANOVAnalysisNode", `nodeRef 不可用，直接更新 flowStore`);
    flowStore.updateNodeState(flowStore.currentInstance?.id, props.id, {
      status: newStatus,
      data: result,
      error: error ? error.message || "未知錯誤" : null,
      _isDataUpdate: true, // 標記為數據更新
    });
  }
};

// 組件掛載時初始化
onMounted(async () => {
  // 嘗試從共享數據中獲取之前的分析結果
  const previousData = getSharedData(props.id);
  if (previousData && previousData.detail) {
    logger.info("ANOVAnalysisNode", "找到之前的分析結果");
    logger.debug("ANOVAnalysisNode", "之前的分析結果:", previousData);

    // 恢復之前的分析結果
    nodeContext.value = {
      ...nodeContext.value,
      output: previousData.detail,
    };

    // 恢復表單狀態
    const input = previousData.detail;
    if (input.anovaType) formData.value.anovaType = input.anovaType;
    if (input.alpha) formData.value.alpha = input.alpha;
    if (input.postHocTest) formData.value.postHocTest = input.postHocTest;
    if (input.factors) formData.value.factors = input.factors;
    if (input.response) formData.value.response = input.response;

    // 如果有結果，顯示結果
    if (input.results) {
      anovaResults.value = input.results;
      showResults.value = true;
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
.result-container {
  max-height: 450px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 10px;
}

.boxplot-container {
  height: 200px;
  width: 100%;
  position: relative;
}

.boxplot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
}

.boxplot-bar {
  width: 20px;
  background-color: #4299e1;
  border-radius: 2px;
  position: relative;
  margin-top: auto;
}

.boxplot-bar::before {
  content: "";
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  height: 2px;
  background-color: #2c5282;
}

.boxplot-bar::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: -5px;
  right: -5px;
  height: 2px;
  background-color: #2c5282;
}
</style>
