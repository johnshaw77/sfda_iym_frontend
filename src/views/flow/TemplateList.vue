<!-- 流程模板管理頁面 -->
<template>
  <div class="p-6">
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800">流程模板管理</h2>
      <el-button type="primary" @click="handleAdd">新增流程模板</el-button>
    </div>

    <el-table v-loading="loading" :data="templates" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="180" />
      <el-table-column prop="name" label="名稱" width="180" />
      <el-table-column prop="type" label="類型" width="120">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)">
            {{ getTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="version" label="版本" width="100" />
      <el-table-column prop="status" label="狀態" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="創建時間" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" link @click="handleEdit(row)">
              編輯
            </el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === "active" ? "停用" : "啟用" }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              刪除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 編輯對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯流程模板' : '新增流程模板'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="mt-4"
      >
        <el-form-item label="名稱" prop="name">
          <el-input v-model="form.name" placeholder="請輸入名稱" />
        </el-form-item>
        <el-form-item label="類型" prop="type">
          <el-select
            v-model="form.type"
            placeholder="請選擇類型"
            style="width: 100%"
          >
            <el-option label="業務流程" value="business" />
            <el-option label="系統流程" value="system" />
            <el-option label="分析流程" value="analysis" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="請輸入描述"
          />
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input
            v-model="form.version"
            placeholder="請輸入版本號，例如：1.0.0"
          />
        </el-form-item>
        <el-form-item label="狀態" prop="status">
          <el-select
            v-model="form.status"
            placeholder="請選擇狀態"
            style="width: 100%"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="啟用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="節點配置" prop="nodes">
          <el-input
            v-model="form.nodes"
            type="textarea"
            :rows="4"
            placeholder="請輸入 JSON 格式的節點配置"
          />
        </el-form-item>
        <el-form-item label="連線配置" prop="edges">
          <el-input
            v-model="form.edges"
            type="textarea"
            :rows="4"
            placeholder="請輸入 JSON 格式的連線配置"
          />
        </el-form-item>
        <el-form-item label="元數據" prop="metadata">
          <el-input
            v-model="form.metadata"
            type="textarea"
            :rows="4"
            placeholder="請輸入 JSON 格式的元數據配置（選填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">確定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getFlowTemplates,
  createFlowTemplate,
  updateFlowTemplate,
  deleteFlowTemplate,
} from "@/api/modules/flow";
import { useUserStore } from "@/stores/user";

// 數據
const loading = ref(false);
const templates = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const userStore = useUserStore();

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

// 方法
const getTypeTagType = (type) => {
  const types = {
    business: "success",
    system: "warning",
    analysis: "info",
  };
  return types[type] || "info";
};

const getTypeLabel = (type) => {
  const labels = {
    business: "業務流程",
    system: "系統流程",
    analysis: "分析流程",
  };
  return labels[type] || type;
};

const getStatusTagType = (status) => {
  const types = {
    draft: "info",
    active: "success",
    inactive: "warning",
  };
  return types[status] || "info";
};

const getStatusLabel = (status) => {
  const labels = {
    draft: "草稿",
    active: "啟用",
    inactive: "停用",
  };
  return labels[status] || status;
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("zh-TW");
};

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await getFlowTemplates();
    templates.value = response;
  } catch (error) {
    ElMessage.error("獲取數據失敗");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
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
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  isEdit.value = true;
  form.value = {
    ...row,
    nodes:
      typeof row.nodes === "object"
        ? JSON.stringify(row.nodes, null, 2)
        : row.nodes,
    edges:
      typeof row.edges === "object"
        ? JSON.stringify(row.edges, null, 2)
        : row.edges,
    metadata:
      typeof row.metadata === "object"
        ? JSON.stringify(row.metadata, null, 2)
        : row.metadata || "{}",
  };
  dialogVisible.value = true;
};

const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === "active" ? "inactive" : "active";
    await updateFlowTemplate(row.id, { ...row, status: newStatus });
    ElMessage.success("狀態更新成功");
    fetchData();
  } catch (error) {
    ElMessage.error("狀態更新失敗");
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("確定要刪除這個流程模板嗎？", "提示", {
      type: "warning",
    });
    await deleteFlowTemplate(row.id);
    ElMessage.success("刪除成功");
    fetchData();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("刪除失敗");
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = {
          ...form.value,
          nodes: JSON.parse(form.value.nodes),
          edges: JSON.parse(form.value.edges),
          metadata: form.value.metadata
            ? JSON.parse(form.value.metadata)
            : null,
          createdBy: userStore.user.id,
          updatedBy: userStore.user.id,
        };

        if (isEdit.value) {
          await updateFlowTemplate(form.value.id, submitData);
          ElMessage.success("更新成功");
        } else {
          await createFlowTemplate(submitData);
          ElMessage.success("創建成功");
        }
        dialogVisible.value = false;
        fetchData();
      } catch (error) {
        ElMessage.error(isEdit.value ? "更新失敗" : "創建失敗");
      }
    }
  });
};

// 生命週期
onMounted(() => {
  fetchData();
});
</script>
