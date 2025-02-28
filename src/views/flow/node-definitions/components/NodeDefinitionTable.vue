<template>
  <el-table
    v-loading="loading"
    :data="nodeDefinitions"
    style="width: 100%">
    <el-table-column
      type="index"
      label="序號"
      width="80"
      align="center"
      sortable />
    <el-table-column
      prop="icon"
      label="圖示"
      width="60">
      <template #default="{ row }">
        <component
          :is="icons[row.icon]"
          class="w-4 h-4" />
      </template>
    </el-table-column>
    <el-table-column
      prop="category"
      label="分類"
      width="120"
      sortable>
      <template #default="{ row }">
        <el-tag :type="getCategoryType(row.category)">
          {{ getCategoryLabel(row.category) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      label="名稱"
      width="200"
      sortable>
      <template #default="{ row }">
        <div class="flex items-center gap-2">
          <span>{{ row.name }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="description"
      label="描述" />

    <el-table-column
      prop="componentPath"
      label="組件路徑"
      width="120"
      sortable />

    <el-table-column
      prop="componentName"
      label="組件名稱"
      width="200"
      sortable>
      <template #default="{ row }">
        <el-tooltip
          v-if="row.componentPath && row.componentName"
          :content="`@/components/flow-nodes/${row.componentPath}/${row.componentName}`"
          effect="light"
          placement="top">
          <div class="cursor-help">
            {{ row.componentName }}
          </div>
        </el-tooltip>
      </template>
    </el-table-column>
    <el-table-column
      prop="createdAt"
      label="創建時間"
      width="150"
      sortable>
      <template #default="{ row }">
        {{ formatTimestamp(row.createdAt) }}
      </template>
    </el-table-column>
    <el-table-column
      prop="updatedAt"
      label="更新時間"
      width="150"
      sortable>
      <template #default="{ row }">
        {{ formatTimestamp(row.updatedAt) }}
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
      width="200"
      fixed="right">
      <template #default="{ row }">
        <el-button-group>
          <el-button
            type="primary"
            link
            @click="$emit('edit', row)">
            編輯
          </el-button>
          <el-button
            type="danger"
            link
            @click="$emit('delete', row)">
            刪除
          </el-button>
          <el-button
            v-if="row.componentPath && row.componentName"
            type="warning"
            link
            @click="$emit('preview', row)">
            預覽
          </el-button>
        </el-button-group>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { formatTimestamp } from "@/utils/dateUtils";
import * as LucideIcons from "lucide-vue-next";

const icons = LucideIcons;

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  nodeDefinitions: {
    type: Array,
    required: true,
  },
});

defineEmits(["edit", "delete", "preview"]);

// 方法
const getCategoryType = (category) => {
  const types = {
    "data-input": "success",
    "data-process": "warning",
    "data-output": "danger",
  };
  return types[category] || "info";
};

const getCategoryLabel = (category) => {
  const labels = {
    "data-input": "資料輸入",
    "data-process": "資料處理",
    "data-output": "資料輸出",
  };
  return labels[category] || category;
};
</script>

<style scoped>
.cursor-help {
  cursor: help;
}
</style>
