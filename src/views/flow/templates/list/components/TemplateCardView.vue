<template>
  <div
    class="p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <el-card
      v-for="template in templates"
      :key="template.id"
      class="template-card hover:shadow-lg transition-shadow duration-300"
      shadow="hover">
      <template #header>
        <div class="flex justify-between items-center">
          <h3
            class="text-lg font-medium truncate"
            :title="template.name">
            {{ template.name }}
          </h3>
          <el-tag
            :type="getStatusType(template.status)"
            size="small">
            {{ getStatusLabel(template.status) }}
          </el-tag>
        </div>
      </template>

      <div class="h-24 overflow-hidden text-sm text-gray-600 mb-4">
        <p class="line-clamp-4">{{ template.description }}</p>
      </div>

      <div class="flex flex-wrap gap-2 mb-4">
        <el-tag
          size="small"
          effect="plain"
          >v{{ template.version }}</el-tag
        >
        <el-tag
          size="small"
          effect="plain"
          type="info">
          {{ template.type === "business" ? "業務流程" : "系統流程" }}
        </el-tag>
      </div>

      <div class="text-xs text-gray-500 mb-4">
        <div class="flex justify-between">
          <span>建立者:</span>
          <UserAvatar
            :user="template.creator"
            :size="16"
            :show-name="true"
            shape="square"
            class="mr-1" />

          <span>{{ formatDate(template.createdAt) }}</span>
        </div>
        <div class="flex justify-between mt-1">
          <span>更新者:</span>
          <UserAvatar
            :user="template.updater"
            :size="16"
            :show-name="true"
            shape="square"
            class="mr-1" />

          <span>{{ formatTimestamp(template.updatedAt) }}</span>
        </div>
      </div>

      <div class="flex justify-between mt-2">
        <div>
          <el-button
            type="primary"
            size="small"
            plain
            @click="$emit('design', template)">
            <Pencil
              :size="14"
              class="mr-1" />
            設計
          </el-button>
          <el-button
            type="info"
            size="small"
            plain
            @click="$emit('edit', template)">
            <Edit
              :size="14"
              class="mr-1" />
            編輯
          </el-button>
        </div>
        <div>
          <el-dropdown trigger="click">
            <el-button
              type="default"
              size="small"
              plain>
              <MoreHorizontal :size="14" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$emit('publish', template)">
                  <Check
                    :size="14"
                    class="mr-1" />
                  發布
                </el-dropdown-item>
                <el-dropdown-item @click="$emit('deprecate', template)">
                  <Archive
                    :size="14"
                    class="mr-1" />
                  棄用
                </el-dropdown-item>
                <el-dropdown-item
                  divided
                  @click="$emit('delete', template)"
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
      </div>
    </el-card>
  </div>
</template>

<script setup>
// import {
//   Pencil,
//   Edit,
//   MoreHorizontal,
//   Check,
//   Archive,
//   Trash2,
// } from "lucide-vue-next";
import { formatTimestamp } from "@/utils/dateUtils";
import UserAvatar from "@/components/UserAvatar.vue";
defineProps({
  templates: {
    type: Array,
    required: true,
    default: () => [],
  },
});

defineEmits(["edit", "design", "publish", "deprecate", "delete"]);

// 格式化日期
const formatDate = (timestamp) => {
  return formatTimestamp(timestamp, "YYYY-MM-DD");
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

<style scoped>
.template-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.template-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
