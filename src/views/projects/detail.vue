<template>
  <div class="p-2 bg-white">
    <!-- 使用 ProjectHeader 組件 -->
    <ProjectHeader
      :loading="loading"
      :show-header-content="showHeaderContent"
      @back="handleBack"
      @refresh="handleRefresh"
      @create-instance="handleCreateInstance" />

    <!-- 專案詳細資訊 -->
    <ProjectInfo
      :project="project"
      :loading="loading"
      :is-admin="isAdmin"
      @edit="handleEditProject"
      @delete="handleDeleteProject" />

    <!-- 專案統計資訊 -->
    <ProjectStatistics
      :statistics="statistics"
      :loading="loading" />

    <!-- 流程實例列表 -->
    <ProjectInstanceList
      :instances="instances"
      :loading="instancesLoading"
      @view="handleViewInstance"
      @delete="handleDeleteInstance"
      @create="handleCreateInstance" />

    <!-- 專案文件列表 -->
    <ProjectDocumentList
      :documents="documents"
      :loading="documentsLoading"
      @refresh="fetchDocuments" />

    <!-- 編輯專案對話框 -->
    <ProjectEditDialog
      v-model="dialogVisible"
      :project="project"
      :is-edit="isEdit"
      :loading="submitLoading"
      @submit="handleSubmit"
      @cancel="dialogVisible = false" />
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import { useTeleportVisibility } from "@/composables/useTeleportVisibility";
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
import { getDocumentsByProject } from "@/api/modules/flowDocument";

// 引入組件
import ProjectHeader from "./components/ProjectHeader.vue";
import ProjectInfo from "./components/ProjectInfo.vue";
import ProjectStatistics from "./components/ProjectStatistics.vue";
import ProjectInstanceList from "./components/ProjectInstanceList.vue";
import ProjectDocumentList from "./components/ProjectDocumentList.vue";
import ProjectEditDialog from "./components/ProjectEditDialog.vue";

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
const isEdit = ref(false);
const project = ref({});
const instances = ref([]);
const templates = ref([]);
const documents = ref([]);

// Teleport 可見性控制
const { showHeaderContent } = useTeleportVisibility();

// 用戶狀態
const userStore = useUserStore();

// 檢查是否為管理員
const isAdmin = computed(() => {
  const userRole = userStore.user?.role;
  return userRole === "ADMIN" || userRole === "SUPERADMIN";
});

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
  isEdit.value = true;
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
const handleSubmit = async (formData) => {
  try {
    submitLoading.value = true;

    await updateProject(formData.id, {
      name: formData.name,
      description: formData.description,
      status: formData.status,
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
  console.log("查看流程實例", instance);
  router.push({
    path: `/flow-instances/${instance.id}`,
    query: {
      from: "project",
      projectId: projectId.value,
      projectName: project.value.name,
      instanceName: instance.template?.name || "流程實例",
    },
  });
};

// 處理創建流程實例
const handleCreateInstance = async () => {
  try {
    console.log("templates", templates.value.length);
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
