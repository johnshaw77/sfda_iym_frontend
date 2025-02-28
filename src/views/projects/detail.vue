<template>
  <div class="p-4">
    <!-- 使用 Teleport 將內容傳送到主佈局 -->
    <Teleport
      to="#header-actions"
      v-if="showHeaderContent">
      <div class="flex items-center space-x-4">
        <!-- 返回按鈕 -->
        <el-button
          plain
          class="flex items-center"
          @click="handleBack">
          <ArrowLeft
            class="mr-1"
            :size="16" />
          返回專案列表
        </el-button>

        <!-- 重整按鈕 -->
        <el-button
          type="default"
          class="flex items-center"
          :loading="loading"
          @click="handleRefresh">
          <RefreshCw
            class="mr-1"
            :size="16" />
          重整
        </el-button>

        <!-- 新增流程實例按鈕 -->
        <el-button
          type="primary"
          class="flex items-center"
          @click="handleCreateInstance">
          <Plus
            class="mr-1"
            :size="16" />
          新增流程實例
        </el-button>
      </div>
    </Teleport>

    <!-- 專案詳細資訊 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
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

      <div v-else>
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
              {{ project.name }}
            </h2>
            <p class="text-gray-600 mb-4">{{ project.description }}</p>

            <div class="flex items-center space-x-4 text-sm text-gray-500 mb-2">
              <div class="flex items-center">
                <Calendar
                  :size="16"
                  class="mr-1" />
                <span>創建於 {{ formatDate(project.createdAt) }}</span>
              </div>
              <div class="flex items-center">
                <User
                  :size="16"
                  class="mr-1" />
                <span>{{ project.creator?.username || "未知用戶" }}</span>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <el-tag :type="getStatusType(project.status)">
                {{ getStatusText(project.status) }}
              </el-tag>
              <span
                v-if="isAdmin"
                class="text-xs text-blue-500 bg-slate-100 p-1 rounded-sm">
                {{ project.systemCode }}
              </span>
              <span class="text-xs text-gray-500">
                {{ project.projectNumber }} - {{ project.id }}
              </span>
            </div>
          </div>

          <div>
            <el-dropdown trigger="click">
              <MoreVertical
                :size="20"
                class="text-gray-400 cursor-pointer hover:text-gray-600" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEditProject"
                    >編輯專案</el-dropdown-item
                  >
                  <el-dropdown-item
                    divided
                    @click="handleDeleteProject"
                    class="text-red-500">
                    刪除專案
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 流程實例列表 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">專案統計資訊</h3>
      </div>

      <div
        v-if="loading"
        class="py-4">
        <el-skeleton
          animated
          :rows="3" />
      </div>
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">流程實例總數</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ statistics.totalInstances }}
              </p>
            </div>
            <div class="bg-blue-100 p-2 rounded-full">
              <GitBranch
                :size="24"
                class="text-blue-500" />
            </div>
          </div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">已完成實例</p>
              <p class="text-2xl font-bold text-green-600">
                {{ statistics.completedInstances }}
              </p>
            </div>
            <div class="bg-green-100 p-2 rounded-full">
              <CheckCircle
                :size="24"
                class="text-green-500" />
            </div>
          </div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">進行中實例</p>
              <p class="text-2xl font-bold text-yellow-600">
                {{ statistics.activeInstances }}
              </p>
            </div>
            <div class="bg-yellow-100 p-2 rounded-full">
              <Clock
                :size="24"
                class="text-yellow-500" />
            </div>
          </div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">文檔總數</p>
              <p class="text-2xl font-bold text-purple-600">
                {{ statistics.totalDocuments }}
              </p>
            </div>
            <div class="bg-purple-100 p-2 rounded-full">
              <FileText
                :size="24"
                class="text-purple-500" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 流程實例列表 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">流程實例列表</h3>
        <div class="flex items-center space-x-2">
          <el-select
            v-model="filterStatus"
            placeholder="篩選狀態"
            clearable
            size="small"
            class="!w-24">
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value">
              <el-tag
                :type="status.tagType"
                size="small">
                {{ status.label }}
              </el-tag>
            </el-option>
          </el-select>
        </div>
      </div>

      <el-table
        :data="filteredInstances"
        v-loading="instancesLoading"
        style="width: 100%">
        <el-table-column
          type="index"
          label="序號"
          width="80" />
        <el-table-column
          prop="template.name"
          label="模板名稱"
          min-width="120" />
        <el-table-column
          label="狀態"
          width="120"
          align="center">
          <template #default="{ row }">
            <el-tag :type="getInstanceStatusType(row.status)">
              {{ getInstanceStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="建立者"
          width="150"
          align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center">
              <el-avatar
                :size="24"
                :src="`http://localhost:3001/uploads/avatars/${
                  row.creator?.avatar || 'default.png'
                }`">
                {{ row.creator?.username?.charAt(0) || "U" }}
              </el-avatar>
              <span class="ml-2">{{
                row.creator?.username || "未知用戶"
              }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="建立時間"
          width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="updatedAt"
          label="更新時間"
          width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200"
          fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleViewInstance(row)">
              查看
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDeleteInstance(row)">
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div
        v-if="!instancesLoading && instances.length === 0"
        class="text-center py-8 text-gray-500">
        <FileX
          :size="48"
          class="mx-auto mb-4 text-gray-300" />
        <p>此專案尚未建立流程實例</p>
        <el-button
          type="primary"
          class="mt-4"
          @click="handleCreateInstance">
          新增流程實例
        </el-button>
      </div>
    </div>

    <!-- 專案文件列表 -->
    <div class="bg-white rounded-lg shadow-md p-6 mt-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">專案文件</h3>
        <div class="flex items-center space-x-2">
          <el-select
            v-model="docTypeFilter"
            placeholder="篩選類型"
            clearable
            size="small"
            class="!w-24">
            <el-option
              label="報告"
              value="report" />
            <el-option
              label="圖片"
              value="image" />
            <el-option
              label="附件"
              value="attachment" />
          </el-select>
        </div>
      </div>

      <DocumentList
        :documents="filteredDocuments"
        :loading="documentsLoading"
        :show-project-column="false"
        @refresh="fetchDocuments" />
    </div>

    <!-- 編輯專案對話框 -->
    <el-dialog
      v-model="dialogVisible"
      title="編輯專案"
      width="500px"
      destroy-on-close>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px">
        <el-form-item
          label="專案名稱"
          prop="name">
          <el-input
            v-model="form.name"
            placeholder="請輸入專案名稱" />
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="請輸入專案描述" />
        </el-form-item>
        <el-form-item
          label="狀態"
          prop="status">
          <el-select
            v-model="form.status"
            class="w-full">
            <el-option
              label="草稿"
              value="draft" />
            <el-option
              label="進行中"
              value="active" />
            <el-option
              label="已完成"
              value="completed" />
            <el-option
              label="已取消"
              value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit">
            確定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated, computed } from "vue";

import { ElMessage, ElMessageBox } from "element-plus";
import {
  getProjectById,
  updateProject,
  deleteProject,
  getProjectInstances,
} from "@/api/modules/project";
import {
  createFlowInstance,
  deleteFlowInstance,
  getFlowTemplates,
} from "@/api/modules/flow";
import { useUserStore } from "@/stores/user";
import { useRouter, useRoute } from "vue-router";
import { getDocumentsByProject } from "@/api/modules/flowDocument";
import DocumentList from "@/views/documents/components/DocumentList.vue";

// 路由
const router = useRouter();
const route = useRoute();
const projectId = computed(() => route.params.id);

// 狀態
const loading = ref(false);
const instancesLoading = ref(false);
const documentsLoading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const project = ref({});
const instances = ref([]);
const templates = ref([]);
const filterStatus = ref("");
const docTypeFilter = ref("");
const documents = ref([]);

// 控制 Teleport 內容顯示
const showHeaderContent = ref(true);

// 用戶狀態
const userStore = useUserStore();

// 檢查是否為管理員
const isAdmin = computed(() => {
  const userRole = userStore.user?.role;
  return userRole === "ADMIN" || userRole === "SUPERADMIN";
});

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

// 狀態選項
const statusOptions = [
  { label: "草稿", value: "draft", tagType: "info" },
  { label: "進行中", value: "active", tagType: "warning" },
  { label: "已完成", value: "completed", tagType: "success" },
  { label: "已取消", value: "cancelled", tagType: "danger" },
];

// 統計資訊
const statistics = computed(() => {
  return {
    totalInstances: instances.value.length,
    completedInstances: instances.value.filter((i) => i.status === "completed")
      .length,
    activeInstances: instances.value.filter((i) => i.status === "active")
      .length,
    totalDocuments: documents.value.length,
  };
});

// 過濾後的實例列表
const filteredInstances = computed(() => {
  if (!filterStatus.value) return instances.value;
  return instances.value.filter(
    (instance) => instance.status === filterStatus.value
  );
});

// 過濾後的文件列表
const filteredDocuments = computed(() => {
  if (!docTypeFilter.value) return documents.value;
  return documents.value.filter((doc) => doc.docType === docTypeFilter.value);
});

// KeepAlive 生命週期鉤子
onActivated(() => {
  showHeaderContent.value = true;
});

onDeactivated(() => {
  showHeaderContent.value = false;
});

// 獲取專案詳情
const fetchProject = async () => {
  try {
    loading.value = true;
    const response = await getProjectById(projectId.value);
    project.value = response.data;
  } catch (error) {
    console.error("獲取專案詳情失敗:", error);
    ElMessage.error("獲取專案詳情失敗");
  } finally {
    loading.value = false;
  }
};

// 獲取專案的流程實例
const fetchInstances = async () => {
  try {
    instancesLoading.value = true;
    const response = await getProjectInstances(projectId.value);
    instances.value = response.data;
  } catch (error) {
    console.error("獲取流程實例失敗:", error);
    ElMessage.error("獲取流程實例失敗");
  } finally {
    instancesLoading.value = false;
  }
};

// 獲取所有流程模板
const fetchTemplates = async () => {
  try {
    const response = await getFlowTemplates();
    templates.value = response.data;
  } catch (error) {
    console.error("獲取流程模板失敗:", error);
    ElMessage.error("獲取流程模板失敗");
  }
};

// 獲取專案的文件
const fetchDocuments = async () => {
  try {
    documentsLoading.value = true;
    const response = await getDocumentsByProject(projectId.value);
    documents.value = response.data || [];
  } catch (error) {
    console.error("獲取專案文件失敗:", error);
    ElMessage.error("獲取專案文件失敗");
  } finally {
    documentsLoading.value = false;
  }
};

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

// 獲取實例狀態標籤類型
const getInstanceStatusType = (status) => {
  const types = {
    draft: "info",
    active: "warning",
    completed: "success",
    cancelled: "danger",
  };
  return types[status] || "info";
};

// 獲取實例狀態文字
const getInstanceStatusText = (status) => {
  const texts = {
    draft: "草稿",
    active: "進行中",
    completed: "已完成",
    cancelled: "已取消",
  };
  return texts[status] || status;
};

// 處理返回
const handleBack = () => {
  router.push("/projects");
};

// 處理刷新
const handleRefresh = () => {
  fetchProject();
  fetchInstances();
  fetchDocuments();
};

// 處理編輯專案
const handleEditProject = () => {
  form.value = {
    id: project.value.id,
    name: project.value.name,
    description: project.value.description,
    status: project.value.status,
  };
  dialogVisible.value = true;
};

// 處理刪除專案
const handleDeleteProject = async () => {
  try {
    await ElMessageBox.confirm(
      "確定要刪除此專案嗎？此操作將同時刪除所有關聯的流程實例，且不可恢復。",
      "刪除確認",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deleteProject(project.value.id);
    ElMessage.success("專案刪除成功");
    router.push("/projects");
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
    submitLoading.value = true;

    await updateProject(form.value.id, {
      name: form.value.name,
      description: form.value.description,
      status: form.value.status,
    });

    ElMessage.success("專案更新成功");
    dialogVisible.value = false;
    fetchProject();
  } catch (error) {
    console.error("提交失敗:", error);
    ElMessage.error(error.response?.data?.message || "操作失敗");
  } finally {
    submitLoading.value = false;
  }
};

// 處理查看流程實例
const handleViewInstance = (instance) => {
  router.push(`/flow-instances/${instance.id}`);
};

// 處理創建流程實例
const handleCreateInstance = async () => {
  try {
    // 檢查是否有可用的模板
    if (templates.value.length === 0) {
      await fetchTemplates();

      if (templates.value.length === 0) {
        ElMessage.warning("沒有可用的流程模板，請先創建模板");
        return;
      }
    }

    // 顯示模板選擇對話框
    const templateOptions = templates.value
      .filter((template) => template.status === "published")
      .map((template) => ({
        label: template.name,
        value: template.id,
      }));

    if (templateOptions.length === 0) {
      ElMessage.warning("沒有已發布的流程模板，請先發布模板");
      return;
    }

    ElMessageBox.prompt("請選擇流程模板", "創建流程實例", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      inputType: "select",
      inputValue: templateOptions[0].value,
      inputPlaceholder: "請選擇流程模板",
      inputValidator: (value) => !!value,
      inputErrorMessage: "請選擇流程模板",
      inputOptions: templateOptions,
    })
      .then(async ({ value }) => {
        const templateId = value;

        // 創建流程實例
        await createFlowInstance({
          projectId: projectId.value,
          templateId: templateId,
        });

        ElMessage.success("流程實例創建成功");
        fetchInstances();
      })
      .catch(() => {
        // 用戶取消操作
      });
  } catch (error) {
    console.error("創建流程實例失敗:", error);
    ElMessage.error("創建流程實例失敗");
  }
};

// 處理刪除流程實例
const handleDeleteInstance = async (instance) => {
  try {
    await ElMessageBox.confirm(
      "確定要刪除此流程實例嗎？此操作不可恢復。",
      "刪除確認",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deleteFlowInstance(instance.id);
    ElMessage.success("流程實例刪除成功");
    fetchInstances();
  } catch (error) {
    if (error !== "cancel") {
      console.error("刪除流程實例失敗:", error);
      ElMessage.error("刪除流程實例失敗");
    }
  }
};

onMounted(() => {
  fetchProject();
  fetchInstances();
  fetchTemplates();
  fetchDocuments();
});
</script>

<style scoped>
.el-tag {
  margin-right: 0.5rem;
}
</style>
