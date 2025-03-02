<template>
  <div
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
    <!-- 新增專案卡片 -->
    <div
      class="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer p-6 flex flex-col items-center justify-center min-h-[200px] transition-colors duration-200 border-t-[3px] border-t-gray-300"
      @click="handleCreateProject">
      <Plus
        :size="32"
        class="text-gray-400" />
      <span class="mt-4 text-gray-600">新增專案</span>
    </div>

    <!-- 專案卡片列表 -->
    <div
      v-for="project in filteredProjects"
      :key="project.id"
      class="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform cursor-pointer">
      <div class="p-6">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">
              {{ project.name }}
            </h3>
            <p class="mt-2 text-sm text-gray-600 line-clamp-2">
              {{ project.description }}
            </p>
          </div>
          <el-dropdown trigger="click">
            <MoreVertical
              :size="20"
              class="text-gray-400 cursor-pointer hover:text-gray-600" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleEditProject(project)"
                  >編輯</el-dropdown-item
                >
                <el-dropdown-item
                  divided
                  @click="handleDeleteProject(project)"
                  class="text-red-500">
                  刪除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="mt-4">
          <div class="flex items-center text-sm text-gray-500">
            <Calendar
              :size="16"
              class="mr-2" />
            <span
              >更新於
              {{ formatDate(project.updatedAt || project.createdAt) }}</span
            >
          </div>
          <div class="mt-2 flex items-center text-sm text-gray-500">
            <User
              :size="16"
              class="mr-2" />
            <span>{{
              project.creator?.username || project.createdBy?.name || "未知"
            }}</span>
          </div>
          <!-- 添加專案號碼 -->
          <div class="flex items-center gap-2 mt-2">
            <div
              v-if="isAdmin && project.systemCode"
              class="text-xs text-blue-500 rounded-sm bg-slate-100 p-1">
              {{ project.systemCode }}
            </div>
            <span
              v-if="project.projectNumber || project.id"
              class="text-xs font-semibold text-gray-500">
              {{ project.projectNumber }} - {{ project.id }}</span
            >
          </div>
        </div>

        <el-divider />
        <div class="mt-2 flex items-center justify-between">
          <el-tag
            :type="getStatusType(project.status)"
            size="small">
            {{ getStatusText(project.status) }}
          </el-tag>
          <el-button
            type="primary"
            link
            @click="handleViewProject(project)">
            開啟專案
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 定義 props
const props = defineProps({
  projects: {
    type: Array,
    required: true,
    default: () => [],
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
const emit = defineEmits([
  "create-project",
  "view-project",
  "edit-project",
  "delete-project",
]);

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

// 處理創建專案
const handleCreateProject = () => {
  emit("create-project");
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

/* 專案卡片狀態邊框 */
.bg-white {
  border-top: 3px solid var(--el-color-info);
  transform-origin: center;
  backface-visibility: hidden;
  will-change: transform;
}

/* 新增專案卡片 */
.bg-white.border-dashed {
  border-top-style: dashed;
  border-top-color: var(--el-border-color);
  transition: all 0.3s ease;
}
.bg-white.border-dashed:hover {
  border-top: 2px dashed var(--el-color-primary);
}

/* 草稿狀態 */
.bg-white:has(.el-tag--info) {
  border-top-color: var(--el-color-info);
}

/* 進行中狀態 */
.bg-white:has(.el-tag--warning) {
  border-top-color: var(--el-color-warning);
}

/* 已完成狀態 */
.bg-white:has(.el-tag--success) {
  border-top-color: var(--el-color-success);
}

/* 已取消狀態 */
.bg-white:has(.el-tag--danger) {
  border-top-color: var(--el-color-danger);
}

/* 專案卡片動畫效果 */
.transform {
  transform-origin: center;
  backface-visibility: hidden;
  will-change: transform;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 移除原有的旋轉效果，改用放大效果 */
.hover\:scale-105:hover {
  transform: scale(1.05);
  z-index: 10;
}
</style>
