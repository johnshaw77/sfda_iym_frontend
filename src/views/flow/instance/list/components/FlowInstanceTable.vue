<template>
  <el-table
    :data="loading ? [] : instances"
    v-loading="false"
    @selection-change="handleSelectionChange"
    row-key="id">
    <el-table-column
      type="selection"
      width="55"
      :selectable="
        (row) => isAdmin || row.status === 'draft' || row.status === 'failed'
      " />
    <el-table-column
      type="index"
      label="序號"
      width="80" />
    <el-table-column
      prop="project.name"
      label="專案名稱"
      min-width="100">
      <template #default="{ row }">
        <template v-if="loading">
          <el-skeleton-item
            variant="text"
            style="width: 100%" />
        </template>
        <template v-else>
          {{ row.project.name }}
        </template>
      </template>
    </el-table-column>
    <el-table-column
      prop="template.name"
      label="模板名稱"
      min-width="100">
      <template #default="{ row }">
        <template v-if="loading">
          <el-skeleton-item
            variant="text"
            style="width: 100%" />
        </template>
        <template v-else>
          {{ row.template.name }}
        </template>
      </template>
    </el-table-column>
    <el-table-column
      label="狀態"
      width="150"
      align="center">
      <template #default="{ row }">
        <template v-if="loading">
          <el-skeleton-item
            variant="text"
            style="width: 100%" />
        </template>
        <template v-else>
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </template>
    </el-table-column>
    <el-table-column
      label="建立者"
      width="200"
      align="center">
      <template #default="{ row }">
        <template v-if="loading">
          <div class="flex items-center justify-center">
            <el-skeleton-item
              variant="circle"
              style="width: 24px; height: 24px" />
            <el-skeleton-item
              variant="text"
              style="width: 60px; margin-left: 8px" />
          </div>
        </template>
        <template v-else>
          <div class="flex items-center justify-center">
            <el-avatar
              :size="24"
              :src="`http://localhost:3001/uploads/avatars/${row.creator.avatar}`">
              {{ row.creator.username.charAt(0) }}
            </el-avatar>
            <span class="ml-2">{{ row.creator.username }}</span>
          </div>
        </template>
      </template>
    </el-table-column>
    <el-table-column
      prop="createdAt"
      label="建立時間"
      width="180">
      <template #default="{ row }">
        <template v-if="loading">
          <el-skeleton-item
            variant="text"
            style="width: 100%" />
        </template>
        <template v-else>
          {{ formatTimestamp(row.createdAt) }}
        </template>
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
      width="300"
      fixed="right">
      <template #default="{ row }">
        <template v-if="loading">
          <div class="flex space-x-2">
            <el-skeleton-item
              variant="button"
              style="width: 60px; height: 32px" />
            <el-skeleton-item
              variant="button"
              style="width: 60px; height: 32px" />
            <el-skeleton-item
              variant="button"
              style="width: 60px; height: 32px" />
          </div>
        </template>
        <template v-else>
          <el-button-group>
            <el-button
              v-if="row.status === 'draft'"
              type="primary"
              @click="handleStart(row)"
              :loading="row.loading">
              <Play
                class="mr-1"
                :size="14" />
              啟動
            </el-button>
            <el-button
              v-if="row.status === 'running'"
              type="danger"
              @click="handleStop(row)"
              :loading="row.loading">
              <StopCircle
                class="mr-1"
                :size="14" />
              停止
            </el-button>
            <el-button
              type="primary"
              plain
              @click="handleView(row)">
              <Eye
                class="mr-1"
                :size="14" />
              查看
            </el-button>
            <el-button
              v-if="row.status === 'draft'"
              type="danger"
              @click="handleDelete(row)"
              :loading="row.loading">
              <Trash2
                class="mr-1"
                :size="14" />
              刪除
            </el-button>
          </el-button-group>
        </template>
      </template>
    </el-table-column>

    <!-- Skeleton 行 -->
    <template #empty>
      <div v-if="loading">
        <div
          v-for="i in 5"
          :key="i"
          class="skeleton-row">
          <div class="flex items-center w-full py-4 px-2">
            <el-skeleton-item
              variant="circle"
              style="width: 20px; height: 20px; margin-right: 12px" />
            <el-skeleton-item
              variant="text"
              style="width: 80px; margin-right: 12px" />
            <el-skeleton-item
              variant="text"
              style="width: 100px; margin-right: 12px" />
            <el-skeleton-item
              variant="text"
              style="width: 100px; margin-right: 12px" />
            <el-skeleton-item
              variant="text"
              style="width: 80px; margin-right: 12px" />
            <el-skeleton-item
              variant="p"
              style="width: 120px; margin-right: 12px" />
            <el-skeleton-item
              variant="text"
              style="width: 120px; margin-right: 12px" />
            <div class="flex space-x-2 ml-auto">
              <el-skeleton-item
                variant="button"
                style="width: 60px; height: 32px" />
              <el-skeleton-item
                variant="button"
                style="width: 60px; height: 32px" />
            </div>
          </div>
        </div>
      </div>
      <el-empty
        v-else
        description="暫無數據" />
    </template>
  </el-table>
</template>

<script setup>
import { formatTimestamp } from "@/utils/dateUtils";
import { Play, StopCircle, Eye, Trash2 } from "lucide-vue-next";

const props = defineProps({
  instances: {
    type: Array,
    required: true,
  },
  statusOptions: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "selection-change",
  "start",
  "stop",
  "view",
  "delete",
]);

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

// 處理選擇變更
const handleSelectionChange = (selection) => {
  emit("selection-change", selection);
};

// 啟動流程實例
const handleStart = (row) => {
  emit("start", row);
};

// 停止流程實例
const handleStop = (row) => {
  emit("stop", row);
};

// 查看流程實例
const handleView = (row) => {
  emit("view", row);
};

// 刪除流程實例
const handleDelete = (row) => {
  emit("delete", row);
};
</script>

<style scoped>
.el-tag {
  width: 100%;
  text-align: center;
}

.skeleton-row {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.skeleton-row:last-child {
  border-bottom: none;
}
</style>
