<template>
  <el-card class="mb-4">
    <div class="flex justify-between items-center">
      <div class="flex-1">
        <h2 class="text-xl font-bold mb-2">
          {{ flowInstance?.template?.name }}
          <el-tag
            :type="getStatusTagType(flowInstance?.status)"
            class="ml-2">
            {{ getStatusLabel(flowInstance?.status) }}
          </el-tag>
        </h2>
        <div class="text-gray-500">
          <p>專案名稱：{{ flowInstance?.project?.name }}</p>
          <p>建立者：{{ flowInstance?.creator?.username }}</p>
          <p>建立時間：{{ formatTimestamp(flowInstance?.createdAt) }}</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <el-button
          type="primary"
          @click="handleViewFlow">
          <Workflow class="mr-1" />
          流程
        </el-button>
        <el-button
          v-if="flowInstance?.status === 'draft'"
          type="primary"
          @click="handleStart"
          :loading="loading">
          <Play class="mr-1" />
          啟動
        </el-button>
        <el-button
          v-if="flowInstance?.status === 'running'"
          type="danger"
          @click="handleStop"
          :loading="loading">
          <StopCircle class="mr-1" />
          停止
        </el-button>
        <el-button
          v-if="flowInstance?.status === 'draft'"
          type="danger"
          @click="handleDelete"
          :loading="loading">
          <Trash2 class="mr-1" />
          刪除
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { formatTimestamp } from "@/utils/dateUtils";
import { Workflow, Play, StopCircle, Trash2 } from "lucide-vue-next";

const props = defineProps({
  flowInstance: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  statusOptions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["view-flow", "start", "stop", "delete"]);

// 獲取狀態標籤類型
const getStatusTagType = (status) => {
  const option = props.statusOptions.find((opt) => opt.value === status);
  return option ? option.tagType : "info";
};

// 獲取狀態標籤文字
const getStatusLabel = (status) => {
  const option = props.statusOptions.find((opt) => opt.value === status);
  return option ? option.label : status;
};

// 處理查看流程
const handleViewFlow = () => {
  emit("view-flow");
};

// 處理啟動流程
const handleStart = () => {
  emit("start");
};

// 處理停止流程
const handleStop = () => {
  emit("stop");
};

// 處理刪除流程
const handleDelete = () => {
  emit("delete");
};
</script>
