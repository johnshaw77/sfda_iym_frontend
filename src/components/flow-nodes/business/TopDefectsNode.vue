<template>
  <BaseNode
    :id="id"
    nodeType="custom-process"
    :title="title"
    :description="description"
    :icon="icon"
    :status="status"
    :selected="selected"
    :header-bg-color="headerBgColor"
    :header-border-color="headerBorderColor"
    :handles="handles"
    @click="handleNodeClick"
    @handle-connect="handleConnect"
    @handle-disconnect="handleDisconnect"
  >
    <!-- 主要內容區域 -->
    <div class="p-4 space-y-4">
      <!-- 不良率數據顯示 -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-3">
          前五大不良原因分析
        </h3>
        <div class="space-y-3">
          <div
            v-for="(defect, index) in topDefects"
            :key="index"
            class="relative"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-600">{{ defect.name }}</span>
              <span class="text-sm font-medium text-gray-700"
                >{{ defect.percentage }}%</span
              >
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :style="{
                  width: `${defect.percentage}%`,
                  backgroundColor: getBarColor(index),
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 總計資訊 -->
      <div
        class="flex items-center justify-between text-sm p-2 bg-blue-50 rounded-lg"
      >
        <span class="text-gray-600">總不良數</span>
        <span class="font-medium text-gray-700">{{ totalDefects }}</span>
      </div>
    </div>
  </BaseNode>
</template>

<script setup>
import { ref, computed } from "vue";
import { BarChart3 } from "lucide-vue-next";
import BaseNode from "../base/BaseNode.vue";

// 節點基本屬性
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "前五大不良分析",
  },
  description: {
    type: String,
    default: "針對不良率數據列出top五的主要不良原因",
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

// 視覺相關設定
const headerBgColor = ref("#ebebeb"); // 淺綠色背景
const headerBorderColor = ref("#cfcfcf"); // 淺綠色邊框
const icon = BarChart3;

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
const topDefects = ref([
  { name: "表面刮傷", percentage: 35 },
  { name: "尺寸不符", percentage: 25 },
  { name: "色差異常", percentage: 20 },
  { name: "材質瑕疵", percentage: 15 },
  { name: "組裝偏移", percentage: 5 },
]);

const totalDefects = ref(150);

// 獲取顏色函數
const getBarColor = (index) => {
  const colors = [
    "#3b82f6", // 藍色
    "#10b981", // 綠色
    "#6366f1", // 靛藍色
    "#8b5cf6", // 紫色
    "#ec4899", // 粉色
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
  // 這裡可以添加實際的數據處理邏輯
  status.value = "running";

  // 模擬數據處理
  setTimeout(() => {
    status.value = "completed";
    emit("update:data", {
      id: props.id,
      data: {
        topDefects: topDefects.value,
        totalDefects: totalDefects.value,
        timestamp: new Date().toISOString(),
      },
    });
  }, 1000);
};
</script>

<style scoped>
.defect-bar {
  @apply transition-all duration-300 ease-in-out;
}
</style>
