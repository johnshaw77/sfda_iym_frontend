<template>
  <div class="p-6">
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <!-- 新增專案卡片 -->
      <div
        class="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer p-6 flex flex-col items-center justify-center min-h-[200px] transition-colors duration-200"
        @click="handleCreateProject"
      >
        <Plus :size="32" class="text-gray-400" />
        <span class="mt-4 text-gray-600">新增專案</span>
      </div>

      <!-- 專案卡片列表 -->
      <div
        v-for="project in projects"
        :key="project.id"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
      >
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
                class="text-gray-400 cursor-pointer hover:text-gray-600"
              />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEditProject(project)"
                    >編輯</el-dropdown-item
                  >
                  <el-dropdown-item @click="handleDuplicateProject(project)"
                    >複製</el-dropdown-item
                  >
                  <el-dropdown-item
                    divided
                    @click="handleDeleteProject(project)"
                    class="text-red-500"
                  >
                    刪除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div class="mt-4">
            <div class="flex items-center text-sm text-gray-500">
              <Calendar :size="16" class="mr-2" />
              <span>更新於 {{ formatDate(project.updatedAt) }}</span>
            </div>
            <div class="mt-2 flex items-center text-sm text-gray-500">
              <Users :size="16" class="mr-2" />
              <span>{{ project.members }} 位成員</span>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <el-tag :type="getStatusType(project.status)" size="small">
              {{ getStatusText(project.status) }}
            </el-tag>
            <el-button type="primary" link @click="handleOpenProject(project)">
              開啟專案
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/編輯專案對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯專案' : '新增專案'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="projectForm" label-width="80px">
        <el-form-item label="專案名稱" required>
          <el-input v-model="projectForm.name" placeholder="請輸入專案名稱" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="projectForm.description"
            type="textarea"
            :rows="3"
            placeholder="請輸入專案描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveProject">確定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Plus, MoreVertical, Calendar, Users } from "lucide-vue-next";
import { ElMessage, ElMessageBox } from "element-plus";

// 模擬數據
const projects = ref([
  {
    id: 1,
    name: "2024年Q1良率分析",
    description: "分析2024年第一季度的產品良率數據，找出影響良率的關鍵因素。",
    status: "in_progress",
    members: 5,
    updatedAt: "2024-03-15T10:30:00",
  },
  {
    id: 2,
    name: "產品A良率優化",
    description: "針對產品A的良率問題進行深入分析和優化。",
    status: "completed",
    members: 3,
    updatedAt: "2024-03-14T15:20:00",
  },
]);

const dialogVisible = ref(false);
const isEdit = ref(false);
const projectForm = ref({
  name: "",
  description: "",
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
    not_started: "info",
    in_progress: "warning",
    completed: "success",
    archived: "info",
  };
  return types[status] || "info";
};

// 獲取狀態文字
const getStatusText = (status) => {
  const texts = {
    not_started: "未開始",
    in_progress: "進行中",
    completed: "已完成",
    archived: "已歸檔",
  };
  return texts[status] || status;
};

// 處理新增專案
const handleCreateProject = () => {
  isEdit.value = false;
  projectForm.value = {
    name: "",
    description: "",
  };
  dialogVisible.value = true;
};

// 處理編輯專案
const handleEditProject = (project) => {
  isEdit.value = true;
  projectForm.value = {
    ...project,
  };
  dialogVisible.value = true;
};

// 處理保存專案
const handleSaveProject = () => {
  if (!projectForm.value.name) {
    ElMessage.warning("請輸入專案名稱");
    return;
  }
  // TODO: 實現保存邏輯
  dialogVisible.value = false;
  ElMessage.success(isEdit.value ? "專案已更新" : "專案已創建");
};

// 處理刪除專案
const handleDeleteProject = (project) => {
  ElMessageBox.confirm("確定要刪除此專案嗎？此操作不可恢復。", "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // TODO: 實現刪除邏輯
    ElMessage.success("專案已刪除");
  });
};

// 處理複製專案
const handleDuplicateProject = (project) => {
  // TODO: 實現複製邏輯
  ElMessage.success("專案已複製");
};

// 處理開啟專案
const handleOpenProject = (project) => {
  // TODO: 實現開啟專案邏輯
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
