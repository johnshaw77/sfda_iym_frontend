<!-- 節點定義管理頁面 -->

<template>
  <div class="p-0">
    <Teleport
      to="#header-actions"
      v-if="showHeaderContent">
      <el-button
        plain
        @click="handleRefresh"
        :loading="loading"
        title="重新整理">
        <RotateCw
          class="mr-1"
          :size="14" />
        重整
      </el-button>

      <el-button
        type="primary"
        @click="handleCreate">
        <Plus
          class="mr-1"
          :size="14" />
        新增節點定義
      </el-button>
    </Teleport>

    <!-- 節點定義表格 -->
    <NodeDefinitionTable
      v-loading="loading"
      :data="nodeDefinitions"
      @edit="handleEdit"
      @delete="handleDelete"
      @preview="handlePreviewComponent" />

    <!-- 編輯對話框 -->
    <NodeDefinitionEditDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :form-data="form"
      :component-options="componentOptions"
      @submit="handleSubmit"
      @preview="handlePreviewFormComponent"
      @query-components="queryComponentSearch" />

    <!-- 節點預覽對話框 -->
    <NodeDefinitionPreviewDialog
      v-model="previewDialogVisible"
      :nodes="nodes"
      :current-component="currentComponent" />
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onActivated,
  onDeactivated,
  computed,
  watch,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { formatTimestamp } from "@/utils/dateUtils";
import {
  getFlowNodeDefinitions,
  createFlowNodeDefinition,
  updateFlowNodeDefinition,
  deleteFlowNodeDefinition,
} from "@/api/modules/flow";
import { useFlowNodeComponents } from "@/composables/useFlowNodeComponents";
import NodeDefinitionTable from "./components/NodeDefinitionTable.vue";
import NodeDefinitionEditDialog from "./components/NodeDefinitionEditDialog.vue";
import NodeDefinitionPreviewDialog from "./components/NodeDefinitionPreviewDialog.vue";
import * as LucideIcons from "lucide-vue-next";

const icons = LucideIcons;

// 數據
const loading = ref(false);
const nodeDefinitions = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const previewDialogVisible = ref(false);
// 控制 Teleport 內容顯示
const showHeaderContent = ref(true);

// KeepAlive 生命週期鉤子
onActivated(() => {
  showHeaderContent.value = true;
});

onDeactivated(() => {
  showHeaderContent.value = false;
});

// 使用 Flow Components composable
const {
  flowNodeComponents,
  getComponentName,
  loadFlowNodeComponents,
  previewComponent,
  currentComponent,
  nodes,
  closePreview,
} = useFlowNodeComponents();

const form = ref({
  name: "",
  category: "",
  description: "",
  icon: "",
  componentName: "",
  componentPath: "",
  config: "{}",
  uiConfig: "{}",
  handles: "{}",
});

// 將 components 轉換為下拉選單選項
const componentOptions = computed(() => {
  if (
    !flowNodeComponents.value ||
    Object.keys(flowNodeComponents.value).length === 0
  ) {
    return [];
  }

  const options = Object.entries(flowNodeComponents.value).map(
    ([path, component]) => {
      // 移除前面的 '@' 符號
      const cleanPath = path.startsWith(".") ? path.slice(2) : path;

      return {
        value: path,
        label: getComponentName(path),
        path: cleanPath,
      };
    }
  );

  return options;
});

// 新增 queryComponentSearch 函數
const queryComponentSearch = (queryString, cb) => {
  const results = componentOptions.value
    .filter((option) => {
      // 如果有選擇 componentPath，則只顯示對應路徑下的組件
      if (form.value.componentPath) {
        return (
          option.path.includes(`/${form.value.componentPath}/`) &&
          option.label.toLowerCase().includes(queryString.toLowerCase())
        );
      }
      // 否則顯示所有符合搜尋條件的組件
      return option.label.toLowerCase().includes(queryString.toLowerCase());
    })
    .map((option) => ({
      value: option.label.replace(".vue", ""),
      path: option.path,
      fullPath: option.value,
    }));

  cb(results);
};

// 處理預覽組件
const handlePreviewComponent = async (row) => {
  try {
    if (!row.componentPath || !row.componentName) {
      ElMessage.warning("請先填寫完整的組件路徑和名稱");
      return;
    }

    await previewComponent({
      componentPath: row.componentPath,
      componentName: row.componentName,
      nodeData: row,
    });

    previewDialogVisible.value = true;
  } catch (error) {
    console.error("預覽組件失敗：", error);
  }
};

// 處理表單中的預覽
const handlePreviewFormComponent = async () => {
  if (!form.value.componentPath || !form.value.componentName) {
    ElMessage.warning("請先填寫完整的組件路徑和名稱");
    return;
  }

  try {
    await previewComponent({
      componentPath: form.value.componentPath,
      componentName: form.value.componentName,
      nodeData: form.value,
    });

    previewDialogVisible.value = true;
  } catch (error) {
    console.error("預覽組件失敗：", error);
  }
};

// 監聽預覽對話框的開關
watch(previewDialogVisible, (visible) => {
  if (!visible) {
    closePreview();
  }
});

const handleRefresh = async () => {
  loading.value = true;
  try {
    const response = await getFlowNodeDefinitions();
    nodeDefinitions.value = response.data;
  } catch (error) {
    ElMessage.error("獲取數據失敗");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    name: "",
    category: "",
    description: "",
    icon: "",
    componentName: "",
    componentPath: "",
    config: "{}",
    uiConfig: "{}",
    handles: "{}",
  };
};

const handleCreate = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  isEdit.value = true;
  form.value = {
    ...row,
    config:
      typeof row.config === "object"
        ? JSON.stringify(row.config, null, 2)
        : row.config,
    uiConfig:
      typeof row.uiConfig === "object"
        ? JSON.stringify(row.uiConfig, null, 2)
        : row.uiConfig,
    handles:
      typeof row.handles === "object"
        ? JSON.stringify(row.handles, null, 2)
        : row.handles,
  };
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("確定要刪除這個節點定義嗎？", "提示", {
      type: "warning",
    });
    await deleteFlowNodeDefinition(row.id);
    ElMessage.success("刪除成功");
    handleRefresh();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("刪除失敗");
    }
  }
};

const handleSubmit = async (formData, valid) => {
  if (!valid) return;

  try {
    const submitData = {
      ...formData,
      config: JSON.parse(formData.config),
      uiConfig: JSON.parse(formData.uiConfig),
      handles: JSON.parse(formData.handles),
    };

    if (isEdit.value) {
      await updateFlowNodeDefinition(formData.id, submitData);
      ElMessage.success("更新成功");
    } else {
      await createFlowNodeDefinition(submitData);
      ElMessage.success("創建成功");
    }
    dialogVisible.value = false;
    handleRefresh();
  } catch (error) {
    ElMessage.error(isEdit.value ? "更新失敗" : "創建失敗");
  }
};

// 生命週期
onMounted(() => {
  handleRefresh();
  loadFlowNodeComponents();
});
</script>

<style></style>
