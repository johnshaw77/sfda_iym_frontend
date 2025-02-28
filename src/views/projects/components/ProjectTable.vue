<template>
  <div class="project-table">
    <el-table
      :data="filteredProjects"
      style="width: 100%"
      v-loading="loading"
      border>
      <el-table-column
        prop="name"
        label="專案名稱"
        min-width="180">
        <template #default="{ row }">
          <div class="flex items-center">
            <el-tag
              :type="getStatusType(row.status)"
              class="mr-2"
              size="small"
              effect="plain">
              {{ getStatusText(row.status) }}
            </el-tag>
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="description"
        label="描述"
        min-width="250">
        <template #default="{ row }">
          <div class="line-clamp-2">{{ row.description }}</div>
        </template>
      </el-table-column>

      <el-table-column
        label="創建時間"
        min-width="150">
        <template #default="{ row }">
          <div class="flex items-center">
            <Calendar class="w-4 h-4 mr-1 text-gray-400" />
            <span>{{ formatDate(row.createdAt) }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="創建者"
        min-width="120">
        <template #default="{ row }">
          <div class="flex items-center">
            <User class="w-4 h-4 mr-1 text-gray-400" />
            <span>{{ row.createdBy?.name || "未知" }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="180"
        fixed="right">
        <template #default="{ row }">
          <div class="flex space-x-2">
            <el-button
              type="primary"
              size="small"
              @click="handleViewProject(row)">
              查看
            </el-button>

            <el-button
              v-if="isAdmin"
              type="warning"
              size="small"
              @click="handleEditProject(row)">
              編輯
            </el-button>

            <el-button
              v-if="isAdmin"
              type="danger"
              size="small"
              @click="handleDeleteProject(row)">
              刪除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { Calendar, User } from "lucide-vue-next";
import { computed } from "vue";

// 定義 props
const props = defineProps({
  projects: {
    type: Array,
    required: true,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  filterStatus: {
    type: String,
    default: "",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// 定義 emits
const emit = defineEmits(["view-project", "edit-project", "delete-project"]);

// 根據狀態篩選專案
const filteredProjects = computed(() => {
  if (!props.filterStatus) return props.projects;
  return props.projects.filter(
    (project) => project.status === props.filterStatus
  );
});

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
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

// 處理查看專案
const handleViewProject = (project) => {
  emit("view-project", project);
};

// 處理編輯專案
const handleEditProject = (project) => {
  emit("edit-project", project);
};

// 處理刪除專案
const handleDeleteProject = (project) => {
  emit("delete-project", project);
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
