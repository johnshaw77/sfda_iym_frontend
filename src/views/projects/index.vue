<template>
  <div class="px-2 py-2">
    <!-- 專案列表內容 -->
    <!-- 使用 Teleport 將內容傳送到主佈局 -->
    <Teleport to="#header-actions" v-if="showHeaderContent">
      <div class="flex items-center space-x-4">
        <!-- 狀態文字 -->
        <span class="text-gray-600 text-sm">
          共 {{ projects.length }} 個專案
        </span>

        <!-- 篩選下拉選單 -->
        <el-select
          v-model="filterStatus"
          placeholder="篩選狀態"
          clearable
          size="small"
          class="!w-24"
        >
          <el-option label="草稿" value="draft" />
          <el-option label="進行中" value="active" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>

        <!-- 重整按鈕 -->
        <el-button
          type="default"
          class="flex items-center"
          :loading="loading"
          @click="handleRefresh"
        >
          <RefreshCw class="mr-1" :size="16" />
          重整
        </el-button>

        <!-- 新增按鈕 -->
        <el-button
          type="primary"
          class="flex items-center"
          @click="handleCreateProject"
        >
          <Plus class="mr-1" :size="16" />
          新增專案
        </el-button>
      </div>
    </Teleport>
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2"
    >
      <!-- Skeleton 載入效果 -->
      <template v-if="loading">
        <div v-for="n in 8" :key="n" class="bg-white rounded-lg shadow-md p-6">
          <el-skeleton animated>
            <template #template>
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <el-skeleton-item variant="h3" style="width: 50%" />
                  <div class="mt-2">
                    <el-skeleton-item variant="text" style="width: 80%" />
                    <el-skeleton-item variant="text" style="width: 60%" />
                  </div>
                </div>
                <el-skeleton-item
                  variant="circle"
                  style="width: 20px; height: 20px"
                />
              </div>
              <div class="mt-4">
                <div class="flex items-center mb-2">
                  <el-skeleton-item
                    variant="circle"
                    style="width: 16px; height: 16px; margin-right: 8px"
                  />
                  <el-skeleton-item variant="text" style="width: 30%" />
                </div>
                <div class="flex items-center">
                  <el-skeleton-item
                    variant="circle"
                    style="width: 16px; height: 16px; margin-right: 8px"
                  />
                  <el-skeleton-item variant="text" style="width: 20%" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </template>

      <!-- 實際內容 -->
      <template v-else>
        <!-- 新增專案卡片 -->
        <div
          class="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer p-6 flex flex-col items-center justify-center min-h-[200px] transition-colors duration-200 border-t-[3px] border-t-gray-300"
          @click="handleCreateProject"
        >
          <Plus :size="32" class="text-gray-400" />
          <span class="mt-4 text-gray-600">新增專案</span>
        </div>

        <!-- 專案卡片列表 -->
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform cursor-pointer"
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
                <User :size="16" class="mr-2" />
                <span>{{ project.creator.username }}</span>
              </div>
              <!-- 添加專案號碼 -->
              <div class="flex items-center gap-2 mt-2">
                <div
                  v-if="isAdmin"
                  class="text-xs text-blue-500 rounded-sm bg-slate-100 p-1"
                >
                  {{ project.systemCode }}
                </div>
                <span class="text-xs font-semibold text-gray-500">{{
                  project.projectNumber
                }}</span>
              </div>
            </div>

            <el-divider />
            <div class="mt-2 flex items-center justify-between">
              <el-tag :type="getStatusType(project.status)" size="small">
                {{ getStatusText(project.status) }}
              </el-tag>
              <el-button
                type="primary"
                link
                @click="handleViewProject(project)"
              >
                開啟專案
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </div>
    <!-- 新增/編輯專案對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯專案' : '新增專案'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="專案名稱" prop="name">
          <el-input v-model="form.name" placeholder="請輸入專案名稱" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="請輸入專案描述"
          />
        </el-form-item>
        <el-form-item label="狀態" prop="status">
          <el-select v-model="form.status" class="w-full">
            <el-option label="草稿" value="draft" />
            <el-option label="進行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            確定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated, computed } from "vue";
import { Plus, MoreVertical, Calendar, User, RefreshCw } from "lucide-vue-next";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/api/modules/project";
import { Teleport } from "vue";
import { useUserStore } from "@/stores/user";

// 狀態
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const projects = ref([]);

// 表單相關
const formRef = ref(null);
const form = ref({
  id: "",
  name: "",
  description: "",
  status: "draft",
});

// 表單驗證規則
const rules = {
  name: [{ required: true, message: "請輸入專案名稱", trigger: "blur" }],
  description: [{ required: true, message: "請輸入專案描述", trigger: "blur" }],
  status: [{ required: true, message: "請選擇專案狀態", trigger: "change" }],
};

// 控制 Teleport 內容顯示
const showHeaderContent = ref(true);
const filterStatus = ref("");

// 用戶狀態
const userStore = useUserStore();

// 檢查是否為管理員
const isAdmin = computed(() => {
  const userRole = userStore.user?.role;
  return userRole === "ADMIN" || userRole === "SUPERADMIN";
});

// KeepAlive 生命週期鉤子
onActivated(() => {
  showHeaderContent.value = true;
});

onDeactivated(() => {
  showHeaderContent.value = false;
});

// 獲取專案列表
const fetchProjects = async () => {
  try {
    loading.value = true;
    const response = await getProjects();
    projects.value = response.data;
  } catch (error) {
    console.error("獲取專案列表失敗:", error);
    ElMessage.error("獲取專案列表失敗");
  } finally {
    loading.value = false;
  }
};

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

// 處理新增專案
const handleCreateProject = () => {
  isEdit.value = false;
  form.value = {
    name: "",
    description: "",
    status: "draft",
  };
  dialogVisible.value = true;
};

// 處理編輯專案
const handleEditProject = (project) => {
  isEdit.value = true;
  form.value = {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
  };
  dialogVisible.value = true;
};

// 處理查看專案
const handleViewProject = (project) => {
  // TODO: 實現查看專案詳情
  ElMessage.info("查看專案功能開發中");
};

// 處理刪除專案
const handleDeleteProject = async (project) => {
  try {
    await ElMessageBox.confirm(
      "確定要刪除此專案嗎？此操作不可恢復。",
      "刪除確認",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deleteProject(project.id);
    ElMessage.success("專案刪除成功");
    fetchProjects();
  } catch (error) {
    if (error !== "cancel") {
      console.error("刪除專案失敗:", error);
      ElMessage.error("刪除專案失敗");
    }
  }
};

// 處理提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    if (isEdit.value) {
      await updateProject(form.value.id, {
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
      });
      ElMessage.success("專案更新成功");
    } else {
      await createProject({
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
      });
      ElMessage.success("專案創建成功");
    }

    dialogVisible.value = false;
    fetchProjects();
  } catch (error) {
    console.error("提交失敗:", error);
    ElMessage.error(error.response?.data?.message || "操作失敗");
  } finally {
    loading.value = false;
  }
};

// 根據狀態篩選專案
const filteredProjects = computed(() => {
  if (!filterStatus.value) return projects.value;
  return projects.value.filter(
    (project) => project.status === filterStatus.value
  );
});

// 處理重整
const handleRefresh = () => {
  fetchProjects();
};

onMounted(() => {
  fetchProjects();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  /* -webkit-line-clamp: 2; */
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

/* 確保卡片懸停時顯示在其他卡片上方 */
.bg-white {
  position: relative;
  border-top: 3px solid var(--el-color-info);
}
</style>
