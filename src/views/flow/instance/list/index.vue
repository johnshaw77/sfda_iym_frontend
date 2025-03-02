<template>
  <div class="p-0">
    <!-- 頂部搜索和操作區域 -->
    <FlowInstanceHeader
      :query-params="queryParams"
      :projects="projects"
      :status-options="statusOptions"
      :loading="loading"
      :show-header-content="showHeaderContent"
      :selected-instances="selectedInstances"
      :is-admin="userStore.isAdmin"
      @search="handleSearch"
      @refresh="handleRefresh"
      @create="handleCreate"
      @batch-delete="handleBatchDelete" />

    <!-- 實例表格 -->
    <FlowInstanceTable
      :instances="instances"
      :status-options="statusOptions"
      :loading="loading"
      :is-admin="userStore.isAdmin"
      @selection-change="handleSelectionChange"
      @start="handleStart"
      @stop="handleStop"
      @view="handleView"
      @delete="handleDelete" />

    <!-- 創建流程實例對話框 -->
    <FlowInstanceCreateDialog
      v-model:visible="dialogVisible"
      :projects="projects"
      :templates="templates"
      :submitting="submitting"
      @submit="handleSubmit"
      @cancel="dialogVisible = false" />
  </div>
</template>

<script setup>
import {
  getFlowInstances,
  createFlowInstance,
  startFlowInstance,
  stopFlowInstance,
  deleteFlowInstance,
  getFlowTemplates,
} from "@/api/modules/flow";
import { getAllProjects } from "@/api/modules/project";
import { useUserStore } from "@/stores/user";
import FlowInstanceHeader from "./components/FlowInstanceHeader.vue";
import FlowInstanceTable from "./components/FlowInstanceTable.vue";
import FlowInstanceCreateDialog from "./components/FlowInstanceCreateDialog.vue";
import { useTeleportVisibility } from "@/composables/useTeleportVisibility";

const { showHeaderContent } = useTeleportVisibility();
const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const instances = ref([]);
const projects = ref([]);
const templates = ref([]);
const dialogVisible = ref(false);
const submitting = ref(false);
const selectedInstances = ref([]);

// 查詢參數
const queryParams = ref({
  projectId: "",
  status: "",
});

// 表單數據
const formRef = ref(null);
const form = ref({
  projectId: "",
  templateId: "",
});

// 表單驗證規則
const rules = {
  projectId: [{ required: true, message: "請選擇專案", trigger: "change" }],
  templateId: [
    { required: true, message: "請選擇流程模板", trigger: "change" },
  ],
};

// 狀態選項
const statusOptions = [
  { value: "draft", label: "草稿", tagType: "info" },
  { value: "running", label: "執行中", tagType: "warning" },
  { value: "completed", label: "已完成", tagType: "success" },
  { value: "failed", label: "失敗", tagType: "danger" },
];

// 處理選擇變更
const handleSelectionChange = (selection) => {
  selectedInstances.value = selection;
};

// 處理批次刪除
const handleBatchDelete = async () => {
  if (selectedInstances.value.length === 0) return;

  // 如果是管理員，可以強制刪除任何狀態的實例
  const canForceDelete = userStore.isAdmin;

  // 過濾出可刪除的實例（草稿或失敗狀態，或管理員強制刪除）
  const deletableInstances = canForceDelete
    ? selectedInstances.value
    : selectedInstances.value.filter(
        (instance) =>
          instance.status === "draft" || instance.status === "failed"
      );

  // 檢查是否有不可刪除的實例
  if (deletableInstances.length < selectedInstances.value.length) {
    const nonDeletableCount =
      selectedInstances.value.length - deletableInstances.length;
    ElMessage.warning(
      `已選中 ${nonDeletableCount} 個非草稿或失敗狀態的實例，這些實例無法刪除`
    );

    if (deletableInstances.length === 0) {
      return;
    }
  }

  try {
    const confirmMessage =
      canForceDelete &&
      deletableInstances.some(
        (instance) => !["draft", "failed"].includes(instance.status)
      )
        ? `您正在以管理員身份強制刪除 ${deletableInstances.length} 個流程實例，其中包含非草稿或失敗狀態的實例。此操作不可逆且可能影響系統運行。`
        : `確定要刪除選中的 ${deletableInstances.length} 個流程實例嗎？此操作不可逆。`;

    await ElMessageBox.confirm(confirmMessage, "批次刪除確認", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      type: "warning",
    });

    loading.value = true;

    console.log("批次刪除流程實例:", {
      總數: selectedInstances.value.length,
      可刪除數: deletableInstances.length,
      isAdmin: userStore.isAdmin,
      canForceDelete,
    });

    const deletePromises = deletableInstances.map((instance) => {
      // 確定是否需要強制刪除
      const needForceDelete =
        canForceDelete && !["draft", "failed"].includes(instance.status);
      console.log(`刪除實例 ${instance.id}:`, {
        status: instance.status,
        needForceDelete,
      });
      return deleteFlowInstance(instance.id, needForceDelete);
    });

    const results = await Promise.all(deletePromises);
    console.log("批次刪除結果:", results);
    ElMessage.success(`成功刪除 ${deletableInstances.length} 個流程實例`);
    selectedInstances.value = [];
    loadData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("批次刪除流程實例失敗", error);
      ElMessage.error(`批次刪除流程實例失敗: ${error.message || error}`);
    }
  } finally {
    loading.value = false;
  }
};

// 載入數據
const loadData = async () => {
  try {
    loading.value = true;
    const [instancesRes, projectsRes, templatesRes] = await Promise.all([
      getFlowInstances(queryParams.value),
      getAllProjects(),
      getFlowTemplates(),
    ]);
    console.log(instancesRes);
    instances.value = instancesRes.data;
    projects.value = projectsRes.data;
    templates.value = templatesRes.data;
  } catch (error) {
    console.error("載入數據失敗:", error);
    ElMessage.error("載入數據失敗");
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  loadData();
};

// 刷新
const handleRefresh = () => {
  loadData();
};

// 創建流程實例
const handleCreate = () => {
  form.value = {
    projectId: "",
    templateId: "",
  };
  dialogVisible.value = true;
};

// 提交表單
const handleSubmit = async (formData) => {
  try {
    submitting.value = true;
    await createFlowInstance(formData);
    ElMessage.success("創建成功");
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    console.error("創建失敗:", error);
    ElMessage.error("創建失敗");
  } finally {
    submitting.value = false;
  }
};

// 啟動流程實例
const handleStart = async (row) => {
  try {
    row.loading = true;
    await startFlowInstance(row.id);
    ElMessage.success("啟動成功");
    loadData();
  } catch (error) {
    console.error("啟動失敗:", error);
    ElMessage.error("啟動失敗");
  } finally {
    row.loading = false;
  }
};

// 停止流程實例
const handleStop = async (row) => {
  try {
    await ElMessageBox.confirm("確定要停止該流程實例嗎？", "提示", {
      type: "warning",
    });

    row.loading = true;
    await stopFlowInstance(row.id);
    ElMessage.success("停止成功");
    loadData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("停止失敗:", error);
      ElMessage.error("停止失敗");
    }
  } finally {
    row.loading = false;
  }
};

// 查看流程實例
const handleView = (row) => {
  router.push(`/flow-instances/${row.id}`);
};

// 刪除流程實例
const handleDelete = async (row) => {
  try {
    // 檢查是否為管理員以及實例狀態
    const canForceDelete = userStore.isAdmin;
    const isDeletableStatus = row.status === "draft" || row.status === "failed";

    // 如果不是可刪除狀態且不是管理員，則顯示錯誤訊息
    if (!isDeletableStatus && !canForceDelete) {
      ElMessage.warning("只有草稿和失敗狀態的流程實例可以刪除");
      return;
    }

    // 根據情況顯示不同的確認訊息
    const confirmMessage =
      !isDeletableStatus && canForceDelete
        ? "您正在以管理員身份強制刪除非草稿或失敗狀態的流程實例。此操作不可逆且可能影響系統運行，確定要繼續嗎？"
        : "確定要刪除該流程實例嗎？";

    await ElMessageBox.confirm(confirmMessage, "提示", {
      type: "warning",
    });

    row.loading = true;

    // 確定是否需要強制刪除
    const needForceDelete = canForceDelete && !isDeletableStatus;
    console.log("刪除流程實例:", {
      id: row.id,
      status: row.status,
      isAdmin: userStore.isAdmin,
      canForceDelete,
      isDeletableStatus,
      needForceDelete,
    });

    const result = await deleteFlowInstance(row.id, needForceDelete);
    console.log("刪除結果:", result);
    ElMessage.success("刪除成功");
    loadData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("刪除失敗:", error);
      console.error("刪除失敗詳情:", error.response?.data || error);
      ElMessage.error(
        `刪除失敗: ${error.response?.data?.message || error.message || error}`
      );
    }
  } finally {
    row.loading = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.flow-instance-list {
  padding: 20px;
}

.el-tag {
  width: 100%;
  text-align: center;
}
</style>
