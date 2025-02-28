<template>
  <div class="template-table-view">
    <el-table
      :data="templates"
      style="width: 100%"
      stripe
      highlight-current-row>
      <el-table-column
        type="index"
        width="50"
        align="right" />

      <el-table-column
        prop="name"
        label="名稱"
        min-width="180">
        <template #default="{ row }">
          <div class="flex items-center">
            <Workflow
              :size="16"
              class="mr-2 text-blue-500" />
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="description"
        label="描述"
        min-width="250"
        show-overflow-tooltip />

      <el-table-column
        prop="type"
        label="類型"
        width="120">
        <template #default="{ row }">
          <el-tag
            size="small"
            effect="plain">
            {{ row.type === "business" ? "業務流程" : "系統流程" }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- <el-table-column
        prop="version"
        label="版本"
        width="100">
        <template #default="{ row }">
          <el-tag
            size="small"
            effect="plain"
            >v{{ row.version }}</el-tag
          >
        </template>
      </el-table-column> -->

      <el-table-column
        prop="status"
        label="狀態"
        width="100">
        <template #default="{ row }">
          <el-tag
            :type="getStatusType(row.status)"
            size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="createdAt"
        label="建立時間"
        width="180">
        <template #default="{ row }">
          <div class="text-xs">
            <div>{{ formatDate(row.createdAt) }}</div>
            <div class="text-gray-500">建立者: {{ row.creator.username }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="updatedAt"
        label="更新時間"
        width="180">
        <template #default="{ row }">
          <div class="text-xs">
            <div>{{ formatDate(row.updatedAt, "YYYY-MM-DD HH:mm:ss") }}</div>
            <div class="text-gray-500">更新者: {{ row.updater.username }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="300"
        fixed="right">
        <template #default="{ row }">
          <div class="flex space-x-1">
            <el-button
              type="primary"
              size="small"
              plain
              @click="$emit('edit', row)">
              <Edit
                :size="14"
                class="mr-1" />
              編輯
            </el-button>

            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              size="small"
              plain
              @click="$emit('toggle-status', row)">
              <component
                :is="row.status === 'active' ? 'PauseCircle' : 'PlayCircle'"
                :size="14"
                class="mr-1" />
              {{ row.status === "active" ? "停用" : "啟用" }}
            </el-button>

            <el-dropdown trigger="click">
              <el-button
                type="default"
                size="small"
                plain>
                <MoreHorizontal :size="14" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    @click="$emit('delete', row)"
                    class="text-red-500">
                    <Trash2
                      :size="14"
                      class="mr-1" />
                    刪除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import {
  Edit,
  MoreHorizontal,
  Trash2,
  Workflow,
  PauseCircle,
  PlayCircle,
} from "lucide-vue-next";
import { formatTimestamp } from "@/utils/dateUtils";

defineProps({
  templates: {
    type: Array,
    required: true,
    default: () => [],
  },
});

defineEmits(["edit", "toggle-status", "delete"]);

// 格式化日期
const formatDate = (timestamp, format = "YYYY-MM-DD") => {
  return formatTimestamp(timestamp, format);
};

// 獲取狀態標籤類型
const getStatusType = (status) => {
  const types = {
    draft: "info",
    active: "success",
    inactive: "warning",
  };
  return types[status] || "info";
};

// 獲取狀態標籤文字
const getStatusLabel = (status) => {
  const labels = {
    draft: "草稿",
    active: "啟用",
    inactive: "停用",
  };
  return labels[status] || "未知";
};
</script>
