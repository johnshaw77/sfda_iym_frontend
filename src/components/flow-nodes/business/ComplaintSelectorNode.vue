<template>
  <BaseNode
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
    <div class="p-10 space-y-4">
      <!-- 單號選擇 -->
      <el-form-item label="客訴單號">
        <el-select
          v-model="selectedComplaint"
          placeholder="請選擇客訴單號"
          clearable
          filterable
          class="w-full"
          @change="handleComplaintChange"
        >
          <el-option
            v-for="item in complaintOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 已選擇的單號資訊 -->
      <div v-if="selectedComplaint" class="bg-gray-50 p-2 rounded text-sm">
        <div class="flex items-center justify-between text-gray-500 mb-1">
          <span>單號資訊</span>
          <el-tag size="small" type="info">{{ selectedComplaint }}</el-tag>
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-gray-500">建立日期</span>
            <span>2024-03-22</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500">狀態</span>
            <el-tag size="small" type="success">處理中</el-tag>
          </div>
        </div>
      </div>
    </div>
  </BaseNode>
</template>

<script setup>
import { ref, computed } from "vue";
import { TextCursorInput, Box } from "lucide-vue-next";
import BaseNode from "../base/BaseNode.vue";

// 節點基本屬性
const headerBgColor = ref("#a6daff"); // 淺藍色背景
const headerBorderColor = ref("#BFDBFE"); // 淺藍色邊框

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "客訴單號選擇器",
  },
  description: {
    type: String,
    default: "用於選擇客訴單號進行分析",
  },
  selected: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: Object,
    default: () => Box,
  },
});

// 連接點配置
const handles = {
  inputs: [],
  outputs: [
    {
      id: "data",
      description: "選擇的客訴單號資料",
    },
  ],
};

// 節點狀態
const status = ref("default");
const selectedComplaint = ref(null);

// 模擬的客訴單號選項
const complaintOptions = [
  { value: "CP20240322001", label: "CP20240322001 - 產品A異常" },
  { value: "CP20240322002", label: "CP20240322002 - 產品B瑕疵" },
  { value: "CP20240322003", label: "CP20240322003 - 產品C故障" },
  { value: "CP20240322004", label: "CP20240322004 - 產品D問題" },
  { value: "CP20240322005", label: "CP20240322005 - 產品E異常" },
];

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

const handleComplaintChange = (value) => {
  // 更新節點狀態
  status.value = value ? "success" : "default";

  // 發送數據更新事件
  emit("update:data", {
    id: props.id,
    data: value
      ? {
          complaintId: value,
          timestamp: new Date().toISOString(),
        }
      : null,
  });
};
</script>

<style scoped>
.complaint-selector {
  @apply w-full;
}

.complaint-selector__info {
  @apply mt-2 p-2 bg-gray-50 rounded-md text-sm;
}
</style>
