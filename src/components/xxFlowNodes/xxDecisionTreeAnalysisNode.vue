<template>
  <BaseNode
    :node="props.node"
    :selected="props.selected"
    :status="nodeStatus"
    :handleIds="['bottom', 'right']"
    @node-double-click="onNodeDoubleClick">
    <template #header>
      <div class="flex items-center space-x-2 px-3 py-2">
        <GitBranch class="h-5 w-5 text-lime-500" />
        <div class="text-sm font-medium">
          {{ node.data.label || "決策樹分析" }}
        </div>
      </div>
    </template>

    <template #content>
      <div class="p-3 space-y-3">
        <div
          v-if="
            nodeStatus === NODE_STATUS.COMPLETED &&
            node.data.config.resultImageUrl
          "
          class="mx-auto text-center">
          <img
            :src="node.data.config.resultImageUrl"
            alt="決策樹分析結果"
            class="max-w-full h-auto border rounded shadow-sm"
            style="max-height: 250px" />
          <div class="mt-2 text-xs text-gray-500">決策樹分析結果</div>
        </div>
        <div
          v-else-if="nodeStatus === NODE_STATUS.RUNNING"
          class="py-4 text-center">
          <el-progress
            type="circle"
            :percentage="simulationProgress" />
          <div class="mt-2 text-xs text-gray-500">分析進行中...</div>
        </div>
        <el-form
          v-else
          label-position="top"
          size="small"
          class="w-full">
          <el-form-item label="目標變量">
            <el-select
              v-model="node.data.config.targetVariable"
              placeholder="選擇目標變量"
              class="w-full">
              <el-option
                label="銷售結果"
                value="sales_result" />
              <el-option
                label="客戶反饋"
                value="customer_feedback" />
              <el-option
                label="產品評分"
                value="product_rating" />
            </el-select>
          </el-form-item>

          <el-form-item label="特徵變量">
            <el-select
              v-model="node.data.config.featureVariables"
              multiple
              placeholder="選擇特徵變量"
              class="w-full">
              <el-option
                label="產品類別"
                value="product_category" />
              <el-option
                label="價格範圍"
                value="price_range" />
              <el-option
                label="客戶年齡段"
                value="customer_age_group" />
              <el-option
                label="銷售季節"
                value="sales_season" />
            </el-select>
          </el-form-item>

          <el-form-item label="最大深度">
            <el-slider
              v-model="node.data.config.maxDepth"
              :min="1"
              :max="10"
              :step="1"
              show-stops />
          </el-form-item>

          <el-form-item label="最小樣本分割">
            <el-input-number
              v-model="node.data.config.minSamplesSplit"
              :min="2"
              :max="20"
              :step="1"
              class="w-full" />
          </el-form-item>

          <el-button
            type="primary"
            @click="runAnalysis"
            class="w-full mt-2"
            :loading="nodeStatus === NODE_STATUS.RUNNING">
            執行分析
          </el-button>
        </el-form>
      </div>
    </template>
  </BaseNode>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Handle, Position, useVueFlow } from "@vue-flow/core";
import { storeToRefs } from "pinia";
import { useFlowStore } from "@/stores/flow";
import BaseNode from "./BaseNode.vue";
import { GitBranch } from "lucide-vue-next";
import { NODE_STATUS } from "@/views/flow/components/config/nodeTypes";
import { ElMessage } from "element-plus";

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const { updateNode } = useVueFlow();
const flowStore = useFlowStore();
const simulationProgress = ref(0);
const progressInterval = ref(null);

// 確保節點配置已初始化
onMounted(() => {
  if (!props.node.data.config) {
    props.node.data.config = {
      maxDepth: 5,
      minSamplesSplit: 5,
      targetVariable: "",
      featureVariables: [],
      resultImageUrl: null,
    };
    updateNode(props.node.id, { data: props.node.data });
  }
});

// 計算節點狀態
const nodeStatus = computed(() => {
  return props.node.data.status || NODE_STATUS.IDLE;
});

// 雙擊節點處理函數
const onNodeDoubleClick = () => {
  ElMessage.info("雙擊決策樹分析節點");
};

// 模擬運行分析
const runAnalysis = async () => {
  try {
    // 驗證必填欄位
    if (
      !props.node.data.config.targetVariable ||
      props.node.data.config.featureVariables.length === 0
    ) {
      ElMessage.warning("請選擇目標變量和至少一個特徵變量");
      return;
    }

    // 更新節點狀態為運行中
    props.node.data.status = NODE_STATUS.RUNNING;
    updateNode(props.node.id, { data: props.node.data });

    // 模擬進度條
    simulationProgress.value = 0;
    progressInterval.value = setInterval(() => {
      simulationProgress.value += 10;
      if (simulationProgress.value >= 100) {
        clearInterval(progressInterval.value);
        completeAnalysis();
      }
    }, 300);
  } catch (error) {
    clearInterval(progressInterval.value);
    props.node.data.status = NODE_STATUS.ERROR;
    updateNode(props.node.id, { data: props.node.data });
    ElMessage.error("分析過程中發生錯誤");
  }
};

// 完成分析並更新結果
const completeAnalysis = () => {
  // 這裡我們模擬返回一個靜態的決策樹圖片URL
  props.node.data.config.resultImageUrl = "/uploads/iym/tree.png";
  props.node.data.status = NODE_STATUS.COMPLETED;
  updateNode(props.node.id, { data: props.node.data });

  // 觸發節點的輸出數據
  if (props.node.data.onOutputData) {
    props.node.data.onOutputData({
      type: "image",
      url: props.node.data.config.resultImageUrl,
      metadata: {
        analysis: "decision-tree",
        params: {
          maxDepth: props.node.data.config.maxDepth,
          minSamplesSplit: props.node.data.config.minSamplesSplit,
          targetVariable: props.node.data.config.targetVariable,
          featureVariables: props.node.data.config.featureVariables,
        },
      },
    });
  }

  ElMessage.success("決策樹分析完成");
};
</script>
