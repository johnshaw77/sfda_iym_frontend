<template>
  <div class="p-2">
    <Teleport
      to="#header-actions"
      v-if="showHeaderContent">
      <div
        v-if="showHeaderContent"
        class="flex items-center space-x-4">
        <el-radio-group v-model="viewMode">
          <el-radio-button
            label="卡片"
            value="card" />
          <el-radio-button
            label="列表"
            value="list" />
        </el-radio-group>
        <el-select
          v-model="filters.status"
          placeholder="選擇狀態"
          clearable
          class="!w-32">
          <el-option
            v-for="status in statusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value">
            <el-tag
              :type="getStatusType(status.value)"
              size="small">
              {{ status.label }}
            </el-tag>
          </el-option>
        </el-select>

        <el-input
          v-model="filters.search"
          placeholder="搜尋流程模板"
          class="!w-60"
          clearable>
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-button
          plain
          @click="handleRefresh"
          :loading="loading"
          title="重新整理">
          <RotateCw
            class="mr-1"
            :size="16" />
          重整
        </el-button>

        <el-button
          type="primary"
          @click="handleAddTemplate">
          <Plus
            class="mr-1"
            :size="16" />
          新增流程模板
        </el-button>
      </div>
    </Teleport>

    <!-- 範本列表容器 -->
    <template v-if="loading">
      <TemplateListSkeleton :count="8" />
    </template>
    <template v-else>
      <TemplateCardView
        v-show="viewMode === 'card'"
        :templates="filteredTemplates"
        @edit="handleEditTemplate"
        @publish="handlePublishTemplate"
        @deprecate="handleDeprecateTemplate"
        @delete="handleDeleteTemplate"
        @design="handleDesignTemplate" />

      <TemplateTableView
        v-show="viewMode === 'list'"
        :templates="filteredTemplates"
        @edit="handleEditTemplate"
        @toggle-status="handleToggleStatus"
        @delete="handleDelete" />
    </template>

    <!-- 編輯對話框 -->
    <TemplateEditDialog
      :visible="dialogVisible"
      @update:visible="dialogVisible = $event"
      :is-edit="isEdit"
      :form="form"
      :rules="rules"
      @submit="handleSubmit"
      @cancel="dialogVisible = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, RotateCw, Plus } from "lucide-vue-next";
import {
  getFlowTemplates,
  createFlowTemplate,
  updateFlowTemplate,
  deleteFlowTemplate,
} from "@/api/modules/flow";
import { useUserStore } from "@/stores/user";
import { useTeleportVisibility } from "@/composables/useTeleportVisibility";

// 導入子組件
import TemplateCardView from "./components/TemplateCardView.vue";
import TemplateTableView from "./components/TemplateTableView.vue";
import TemplateEditDialog from "./components/TemplateEditDialog.vue";
import TemplateListSkeleton from "./components/TemplateListSkeleton.vue";

// 數據
const loading = ref(false);
const templates = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const userStore = useUserStore();
const router = useRouter();

const { showHeaderContent } = useTeleportVisibility();

const viewMode = ref("card");

// 篩選器狀態
const filters = ref({
  category: "",
  status: "",
  search: "",
});

// 狀態選項
const statusOptions = [
  { label: "草稿", value: "draft" },
  { label: "啟用", value: "active" },
  { label: "停用", value: "inactive" },
];

// 表單數據
const form = ref({
  name: "",
  type: "business",
  description: "",
  version: "1.0.0",
  status: "draft",
  nodes: "[]",
  edges: "[]",
  metadata: "{}",
});

// 表單驗證規則
const rules = {
  name: [
    { required: true, message: "請輸入名稱", trigger: "blur" },
    { min: 2, max: 50, message: "長度在 2 到 50 個字符之間", trigger: "blur" },
  ],
  type: [{ required: true, message: "請選擇類型", trigger: "change" }],
  description: [
    { required: true, message: "請輸入描述", trigger: "blur" },
    { max: 200, message: "長度不能超過 200 個字符", trigger: "blur" },
  ],
  version: [
    { required: true, message: "請輸入版本號", trigger: "blur" },
    {
      pattern: /^\d+\.\d+\.\d+$/,
      message: "版本號格式為：x.y.z",
      trigger: "blur",
    },
  ],
  status: [{ required: true, message: "請選擇狀態", trigger: "change" }],
  nodes: [
    {
      validator: (rule, value, callback) => {
        try {
          JSON.parse(value);
          callback();
        } catch (error) {
          callback(new Error("請輸入有效的 JSON 格式"));
        }
      },
      trigger: "blur",
    },
  ],
  edges: [
    {
      validator: (rule, value, callback) => {
        try {
          JSON.parse(value);
          callback();
        } catch (error) {
          callback(new Error("請輸入有效的 JSON 格式"));
        }
      },
      trigger: "blur",
    },
  ],
  metadata: [
    {
      validator: (rule, value, callback) => {
        try {
          if (value) {
            JSON.parse(value);
          }
          callback();
        } catch (error) {
          callback(new Error("請輸入有效的 JSON 格式"));
        }
      },
      trigger: "blur",
    },
  ],
};

// 根據篩選條件過濾範本
const filteredTemplates = computed(() => {
  return templates.value.filter((template) => {
    const categoryMatch =
      !filters.value.category ||
      template.templateCategory === filters.value.category;
    const statusMatch =
      !filters.value.status || template.status === filters.value.status;
    const searchMatch =
      !filters.value.search ||
      template.name
        .toLowerCase()
        .includes(filters.value.search.toLowerCase()) ||
      template.description
        .toLowerCase()
        .includes(filters.value.search.toLowerCase());

    return categoryMatch && statusMatch && searchMatch;
  });
});

// 獲取狀態標籤類型
const getStatusType = (status) => {
  const types = {
    draft: "info",
    active: "success",
    inactive: "warning",
  };
  return types[status] || "info";
};

// 處理刷新(取得所有範本)
const handleRefresh = async () => {
  loading.value = true;
  try {
    const response = await getFlowTemplates();
    templates.value = response.data;
  } catch (error) {
    ElMessage.error("獲取數據失敗");
  } finally {
    loading.value = false;
  }
};

// 處理重置表單
const handleResetForm = () => {
  form.value = {
    name: "",
    type: "business",
    description: "",
    version: "1.0.0",
    status: "draft",
    nodes: "[]",
    edges: "[]",
    metadata: "{}",
  };
};

// 處理新增範本
const handleAddTemplate = () => {
  isEdit.value = false;
  handleResetForm();
  dialogVisible.value = true;
};

// 處理編輯範本
const handleEditTemplate = (template) => {
  isEdit.value = true;
  form.value = {
    ...template,
    nodes:
      typeof template.nodes === "object"
        ? JSON.stringify(template.nodes, null, 2)
        : template.nodes,
    edges:
      typeof template.edges === "object"
        ? JSON.stringify(template.edges, null, 2)
        : template.edges,
    metadata:
      typeof template.metadata === "object"
        ? JSON.stringify(template.metadata, null, 2)
        : template.metadata || "{}",
  };
  dialogVisible.value = true;
};

// 處理設計範本
const handleDesignTemplate = (template) => {
  router.push(`/flow-templates/${template.id}/design`);
};

// 處理發布範本
const handlePublishTemplate = async (template) => {
  try {
    await ElMessageBox.confirm(
      "確定要發布此範本嗎？發布後將不能修改。",
      "發布確認",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "info",
      }
    );
    // 實際發布邏輯
    ElMessage.success("範本發布成功");
    handleRefresh();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("發布範本失敗");
    }
  }
};

// 處理棄用範本
const handleDeprecateTemplate = async (template) => {
  try {
    await ElMessageBox.confirm("確定要棄用此範本嗎？", "棄用確認", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      type: "warning",
    });
    // 實際棄用邏輯
    ElMessage.success("範本已棄用");
    handleRefresh();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("棄用範本失敗");
    }
  }
};

// 處理刪除範本
const handleDeleteTemplate = async (template) => {
  try {
    await ElMessageBox.confirm("確定要刪除這個流程模板嗎？", "提示", {
      type: "warning",
    });
    await deleteFlowTemplate(template.id);
    ElMessage.success("刪除成功");
    handleRefresh();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("刪除失敗");
    }
  }
};

// 處理狀態切換(for table)
const handleToggleStatus = async (template) => {
  try {
    const newStatus = template.status === "active" ? "inactive" : "active";
    await updateFlowTemplate(template.id, { ...template, status: newStatus });
    ElMessage.success("狀態更新成功");
    handleRefresh();
  } catch (error) {
    ElMessage.error("狀態更新失敗");
  }
};

// 處理刪除(for table)
const handleDelete = async (template) => {
  try {
    await ElMessageBox.confirm("確定要刪除這個流程模板嗎？", "提示", {
      type: "warning",
    });
    await deleteFlowTemplate(template.id);
    ElMessage.success("刪除成功");
    handleRefresh();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("刪除失敗");
    }
  }
};

// 處理提交(for dialog)
const handleSubmit = async (formData) => {
  try {
    const submitData = {
      ...formData,
      nodes: JSON.parse(formData.nodes),
      edges: JSON.parse(formData.edges),
      metadata: formData.metadata ? JSON.parse(formData.metadata) : null,
      createdBy: userStore.user.id,
      updatedBy: userStore.user.id,
    };

    if (isEdit.value) {
      await updateFlowTemplate(formData.id, submitData);
      ElMessage.success("更新成功");
    } else {
      await createFlowTemplate(submitData);
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
});
</script>
