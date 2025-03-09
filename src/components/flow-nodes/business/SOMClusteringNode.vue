<template>
  <BaseNode
    :id="id"
    ref="nodeRef"
    nodeType="som-clustering"
    :title="title"
    :description="description"
    icon="Grid"
    :status="status"
    :selected="selected"
    header-bg-color="#d1c4e9"
    :handles="handles"
    :node-width="600"
    :node-height="720"
    @click="handleNodeClick"
    @handle-connect="handleConnect"
    @handle-disconnect="handleDisconnect"
    @run="handleRun">
    <!-- 主要內容區域 -->
    <div class="p-4 space-y-4">
      <!-- 參數設置區域 -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-3">SOM 分群參數設置</h3>
        <div class="space-y-3">
          <el-form
            label-position="top"
            size="small">
            <el-form-item label="網格大小">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-input-number
                    v-model="gridSize.x"
                    :min="2"
                    :max="20"
                    placeholder="寬度"
                    size="small"
                    style="width: 100%" />
                </el-col>
                <el-col :span="12">
                  <el-input-number
                    v-model="gridSize.y"
                    :min="2"
                    :max="20"
                    placeholder="高度"
                    size="small"
                    style="width: 100%" />
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="迭代次數">
              <el-input-number
                v-model="iterations"
                :min="100"
                :max="10000"
                :step="100"
                size="small"
                style="width: 100%" />
            </el-form-item>
            <el-form-item label="學習率">
              <el-slider
                v-model="learningRate"
                :min="0.01"
                :max="1"
                :step="0.01"
                show-input />
            </el-form-item>
            <el-form-item label="鄰域半徑">
              <el-slider
                v-model="radius"
                :min="1"
                :max="10"
                :step="0.5"
                show-input />
            </el-form-item>
            <el-form-item label="特徵選擇">
              <el-select
                v-model="selectedFeatures"
                multiple
                collapse-tags
                placeholder="請選擇特徵"
                style="width: 100%">
                <el-option
                  v-for="feature in availableFeatures"
                  :key="feature.value"
                  :label="feature.label"
                  :value="feature.value" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 分群結果顯示區域 -->
      <div
        v-if="clusteringCompleted"
        class="bg-purple-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-3">分群結果</h3>

        <!-- SOM 網格可視化 -->
        <div class="som-grid-container mb-4">
          <div
            class="som-grid"
            :style="{
              gridTemplateColumns: `repeat(${gridSize.x}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize.y}, 1fr)`,
            }">
            <div
              v-for="(cell, index) in somGrid"
              :key="index"
              class="som-cell"
              :style="{
                backgroundColor: getCellColor(cell),
                border: cell.isWinningNode
                  ? '2px solid #000'
                  : '1px solid #ddd',
              }"
              :title="`節點 (${cell.x},${cell.y}): ${cell.count} 個樣本`">
              {{ cell.count > 0 ? cell.count : "" }}
            </div>
          </div>
        </div>

        <!-- 分群統計信息 -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="p-3 bg-white rounded-lg shadow-sm">
            <div class="text-xs text-gray-500">總分群數</div>
            <div class="text-lg font-medium text-purple-700">
              {{ clusterCount }}
            </div>
          </div>
          <div class="p-3 bg-white rounded-lg shadow-sm">
            <div class="text-xs text-gray-500">平均樣本數</div>
            <div class="text-lg font-medium text-purple-700">
              {{ averageSamplesPerCluster }}
            </div>
          </div>
        </div>

        <!-- 分群詳情 -->
        <div class="overflow-auto max-h-60">
          <el-table
            :data="clusterDetails"
            size="small"
            border
            stripe>
            <el-table-column
              prop="id"
              label="分群 ID"
              width="80" />
            <el-table-column
              prop="size"
              label="樣本數"
              width="80" />
            <el-table-column
              prop="percentage"
              label="佔比">
              <template #default="scope">
                <div class="flex items-center">
                  <div class="w-full bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      class="h-2 rounded-full"
                      :style="{
                        width: `${scope.row.percentage}%`,
                        backgroundColor: getClusterColor(scope.row.id),
                      }"></div>
                  </div>
                  <span>{{ scope.row.percentage.toFixed(1) }}%</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 執行按鈕 -->
      <div class="flex justify-end">
        <el-button
          type="primary"
          @click="handleRun"
          :loading="status === 'running'"
          :disabled="selectedFeatures.length === 0">
          執行 SOM 分群
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
import { Grid } from "lucide-vue-next";
import { ref, computed, onMounted } from "vue";

// 節點基本屬性
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "SOM 分群分析",
  },
  description: {
    type: String,
    default:
      "使用自組織映射 (Self-Organizing Map) 進行數據分群，識別數據中的模式和結構",
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

// 節點狀態
const status = ref("idle");
const errorMessage = ref("");
const errorDetails = ref(null);
const outputData = ref(null);
const nodeRef = ref(null);

// SOM 參數
const gridSize = ref({ x: 5, y: 5 });
const iterations = ref(1000);
const learningRate = ref(0.5);
const radius = ref(3);
const selectedFeatures = ref([]);

// 可用特徵列表 (模擬數據)
const availableFeatures = ref([
  { label: "溫度", value: "temperature" },
  { label: "濕度", value: "humidity" },
  { label: "壓力", value: "pressure" },
  { label: "振動", value: "vibration" },
  { label: "噪音", value: "noise" },
  { label: "電壓", value: "voltage" },
  { label: "電流", value: "current" },
  { label: "功率", value: "power" },
]);

// 分群結果
const clusteringCompleted = ref(false);
const somGrid = ref([]);
const clusterDetails = ref([]);

// 計算屬性
const clusterCount = computed(() => {
  return clusterDetails.value.length;
});

const averageSamplesPerCluster = computed(() => {
  if (clusterDetails.value.length === 0) return 0;
  const totalSamples = clusterDetails.value.reduce(
    (sum, cluster) => sum + cluster.size,
    0
  );
  return (totalSamples / clusterDetails.value.length).toFixed(1);
});

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

// 獲取單元格顏色
const getCellColor = (cell) => {
  if (cell.count === 0) return "#f9fafb"; // 淺灰色背景

  // 根據樣本數量計算顏色深淺
  const intensity = Math.min(1, cell.count / 10); // 最多10個樣本為最深
  const r = Math.round(208 - intensity * 100);
  const g = Math.round(180 - intensity * 100);
  const b = Math.round(233);

  return `rgb(${r}, ${g}, ${b})`;
};

// 獲取分群顏色
const getClusterColor = (clusterId) => {
  const colors = [
    "#9c27b0", // 紫色
    "#673ab7", // 深紫色
    "#3f51b5", // 靛藍色
    "#2196f3", // 藍色
    "#03a9f4", // 淺藍色
    "#00bcd4", // 青色
    "#009688", // 藍綠色
    "#4caf50", // 綠色
  ];
  return colors[clusterId % colors.length];
};

// 初始化 SOM 網格
const initializeSomGrid = () => {
  const grid = [];
  for (let y = 0; y < gridSize.value.y; y++) {
    for (let x = 0; x < gridSize.value.x; x++) {
      grid.push({
        x,
        y,
        count: 0,
        isWinningNode: false,
        features: Array(selectedFeatures.value.length)
          .fill(0)
          .map(() => Math.random()),
      });
    }
  }
  return grid;
};

// 模擬 SOM 訓練過程
const trainSOM = (inputData) => {
  // 初始化網格
  const grid = initializeSomGrid();

  // 模擬訓練數據 (實際應該使用輸入數據)
  const sampleCount = 100;
  const samples = Array(sampleCount)
    .fill(0)
    .map(() => ({
      features: Array(selectedFeatures.value.length)
        .fill(0)
        .map(() => Math.random()),
    }));

  // 模擬訓練過程
  for (let i = 0; i < iterations.value; i++) {
    // 實際訓練邏輯應該在這裡
    // 這裡只是簡單模擬
  }

  // 模擬分配樣本到網格
  samples.forEach((sample) => {
    // 隨機選擇一個網格節點 (實際應該計算最佳匹配單元)
    const nodeIndex = Math.floor(Math.random() * grid.length);
    grid[nodeIndex].count++;
  });

  // 標記有樣本的節點為獲勝節點
  grid.forEach((node) => {
    node.isWinningNode = node.count > 0;
  });

  // 生成分群詳情
  const clusters = [];
  const nonEmptyNodes = grid.filter((node) => node.count > 0);
  const totalSamples = nonEmptyNodes.reduce((sum, node) => sum + node.count, 0);

  nonEmptyNodes.forEach((node, index) => {
    clusters.push({
      id: index + 1,
      size: node.count,
      percentage: (node.count / totalSamples) * 100,
      position: { x: node.x, y: node.y },
    });
  });

  // 按樣本數量排序
  clusters.sort((a, b) => b.size - a.size);

  return {
    grid,
    clusters,
    totalSamples,
  };
};

// 數據處理函數
const processData = (inputData) => {
  return new Promise((resolve) => {
    status.value = "running";

    // 確保更新 flowStore 中的狀態
    flowStore.updateNodeState(props.id, { status: "running" });

    // 模擬數據處理延遲
    setTimeout(() => {
      try {
        // 執行 SOM 分群
        const somResult = trainSOM(inputData);

        // 更新結果
        somGrid.value = somResult.grid;
        clusterDetails.value = somResult.clusters;
        clusteringCompleted.value = true;

        const result = {
          gridSize: gridSize.value,
          iterations: iterations.value,
          learningRate: learningRate.value,
          radius: radius.value,
          selectedFeatures: selectedFeatures.value,
          clusters: clusterDetails.value,
          totalSamples: somResult.totalSamples,
          timestamp: new Date().toISOString(),
        };

        status.value = "completed";
        // 確保更新 flowStore 中的狀態
        flowStore.updateNodeState(props.id, { status: "completed" });

        emit("update:data", {
          id: props.id,
          data: result,
        });

        resolve(result);
      } catch (error) {
        status.value = "error";
        // 確保更新 flowStore 中的狀態
        flowStore.updateNodeState(props.id, {
          status: "error",
          error: error.message || "SOM 分群處理過程中發生錯誤",
        });

        errorMessage.value = error.message || "SOM 分群處理過程中發生錯誤";
        throw error;
      }
    }, 2000);
  });
};

// 執行節點
const handleRun = async () => {
  try {
    if (selectedFeatures.value.length === 0) {
      ElMessage.warning("請至少選擇一個特徵進行分群");
      return;
    }

    status.value = "running";
    // 確保更新 flowStore 中的狀態
    flowStore.updateNodeState(props.id, { status: "running" });

    errorMessage.value = "";
    errorDetails.value = null;

    // 使用 composable 執行節點
    const result = await executeNode(
      props.id,
      {}, // 輸入數據
      processData // 處理函數
    );

    // 將分析結果保存到共享數據中
    await updateSharedData("somClusteringResults", {
      gridSize: gridSize.value,
      iterations: iterations.value,
      learningRate: learningRate.value,
      radius: radius.value,
      selectedFeatures: selectedFeatures.value,
      clusters: clusterDetails.value,
      timestamp: new Date().toISOString(),
      nodeId: props.id,
    });

    // 更新組件狀態
    outputData.value = result;
    ElMessage.success("SOM 分群分析執行成功");
  } catch (error) {
    console.error("執行節點時發生錯誤:", error);
    status.value = "error";
    // 確保更新 flowStore 中的狀態
    flowStore.updateNodeState(props.id, {
      status: "error",
      error: error.message || "執行節點時發生未知錯誤",
    });

    errorMessage.value = error.message || "執行節點時發生未知錯誤";
    errorDetails.value = {
      message: error.message,
      stack: error.stack,
    };

    ElMessage.error(`執行失敗: ${errorMessage.value}`);
  } finally {
    // 重置 loading 狀態
    nodeRef.value?.setRunningState(false);
  }
};

// 檢查是否有之前的分析結果
onMounted(async () => {
  // 嘗試從共享數據中獲取之前的分析結果
  const previousResults = getSharedData("somClusteringResults");
  if (previousResults && previousResults.nodeId === props.id) {
    console.log("找到之前的分析結果:", previousResults);
    // 恢復之前的參數設置
    gridSize.value = previousResults.gridSize || gridSize.value;
    iterations.value = previousResults.iterations || iterations.value;
    learningRate.value = previousResults.learningRate || learningRate.value;
    radius.value = previousResults.radius || radius.value;
    selectedFeatures.value =
      previousResults.selectedFeatures || selectedFeatures.value;

    // 如果有分群結果，也可以恢復
    if (previousResults.clusters && previousResults.clusters.length > 0) {
      clusterDetails.value = previousResults.clusters;
      clusteringCompleted.value = true;

      // 需要重新初始化網格
      const grid = initializeSomGrid();
      previousResults.clusters.forEach((cluster) => {
        const nodeIndex =
          cluster.position.y * gridSize.value.x + cluster.position.x;
        if (grid[nodeIndex]) {
          grid[nodeIndex].count = cluster.size;
          grid[nodeIndex].isWinningNode = true;
        }
      });
      somGrid.value = grid;
    }
  }
});

// 清除錯誤
const handleClearError = async () => {
  await clearNodeError(props.id);
  status.value = "idle";
  errorMessage.value = "";
  errorDetails.value = null;
};
</script>

<style scoped>
.som-grid-container {
  width: 100%;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.som-grid {
  display: grid;
  gap: 2px;
  width: 100%;
  aspect-ratio: 1;
}

.som-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.som-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
}
</style>
