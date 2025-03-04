<template>
  <div class="bg-white p-2 mb-0 border-b border-gray-200">
    <!-- Skeleton -->
    <div
      v-if="loading"
      class="py-8">
      <el-skeleton animated>
        <template #template>
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <el-skeleton-item
                variant="h3"
                style="width: 50%" />
              <div class="mt-2">
                <el-skeleton-item
                  variant="text"
                  style="width: 80%" />
                <el-skeleton-item
                  variant="text"
                  style="width: 60%" />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 內容 -->
    <div v-else>
      <div class="flex flex-col">
        <div class="flex justify-between">
          <div class="text-xl font-bold text-gray-800mb-2">
            <el-tag
              class="mr-1"
              :type="getStatusType(project.status)">
              {{ getStatusText(project.status) }} </el-tag
            >{{ project.name }}
          </div>
          <div>
            <el-dropdown trigger="click">
              <MoreVertical
                :size="20"
                class="text-gray-400 cursor-pointer hover:text-gray-600" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEdit"
                    >編輯專案</el-dropdown-item
                  >
                  <el-dropdown-item
                    divided
                    @click="handleDelete"
                    class="text-red-500">
                    刪除專案
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <div>
          <p class="text-gray-600 mb-4">{{ project.description }}</p>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center">
              <Calendar
                :size="16"
                class="mr-1" />
              <span class="text-xs text-gray-500">
                建立於 {{ formatDate(project.createdAt) }}
              </span>
            </div>

            <span
              v-if="isAdmin"
              class="text-xs text-blue-500 bg-slate-100 p-1 rounded-sm">
              {{ project.systemCode }}
            </span>
            <span class="text-xs text-gray-500">
              {{ project.projectNumber }}
              <!-- - {{ project.id }} -->
            </span>
            <UserAvatar
              v-if="project.creator"
              :user="project.creator"
              :size="24"
              :show-name="true"
              shape="square"
              class="mr-1" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, User, MoreVertical } from "lucide-vue-next";

const props = defineProps({
  project: {
    type: Object,
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

const emit = defineEmits(["edit", "delete"]);

// 格式化日期
const formatDate = (date) => {
  if (!date) return "未知";
  return new Date(date).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 獲取狀態標籤類型
const getStatusType = (status) => {
  const types = {
    draft: "info",
    active: "warning",
    completed: "success",
    cancelled: "danger",
  };
  return types[status] || "info";
};

// 獲取狀態文字
const getStatusText = (status) => {
  const texts = {
    draft: "草稿",
    active: "進行中",
    completed: "已完成",
    cancelled: "已取消",
  };
  return texts[status] || status;
};

const handleEdit = () => {
  emit("edit");
};

const handleDelete = () => {
  emit("delete");
};
</script>
