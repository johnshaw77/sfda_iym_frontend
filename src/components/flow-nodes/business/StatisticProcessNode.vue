<template>
  <BaseNode
    :id="id"
    type="statistic-process"
    :title="title"
    :description="description"
    :icon="icon"
    :status="status"
    :selected="selected"
    :header-bg-color="headerBgColor"
    :header-border-color="headerBorderColor"
    :handles="handles"
    :minHeight="640"
    :minWidth="660"
    @click="handleNodeClick"
    @handle-connect="handleConnect"
    @handle-disconnect="handleDisconnect"
  >
    <!-- 主要內容區域? -->
    <div class="p-4 space-y-4">
      <!-- 4M1E 分析結果 -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-3">4M1E 分析結果</h3>
        <div class="space-y-3">
          <div v-for="(factor, index) in factors" :key="index" class="relative">
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
                }"
              ></div>
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
import { ref, computed } from "vue";
import { BarChart2 } from "lucide-vue-next";
import BaseNode from "../base/BaseNode.vue";

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
const headerBgColor = ref("#ebebeb"); // 淺綠色背景
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
  status.value = "running";

  // 模擬數據處理
  setTimeout(() => {
    status.value = "completed";
    emit("update:data", {
      id: props.id,
      data: {
        factors: factors.value,
        chiSquareValue: chiSquareValue.value,
        pValue: pValue.value,
        timestamp: new Date().toISOString(),
      },
    });
  }, 1000);
};
</script>

<style scoped>
.factor-bar {
  @apply transition-all duration-300 ease-in-out;
}
</style>
