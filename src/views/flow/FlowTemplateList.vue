<!-- 流程模板管理頁面 -->
<template>
  <div class="p-2">
    <Teleport to="#header-actions" v-if="showHeaderContent">
      <div v-if="showHeaderContent" class="flex items-center space-x-4">
        <el-radio-group v-model="viewMode">
          <el-radio-button label="卡片" value="card" />
          <el-radio-button label="列表" value="list" />
        </el-radio-group>
        <el-select
          v-model="filters.status"
          placeholder="選擇狀態"
          clearable
          class="!w-32"
        >
          <el-option
            v-for="status in statusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          >
            <el-tag :type="getStatusType(status.value)" size="small">
              {{ status.label }}
            </el-tag>
          </el-option>
        </el-select>

        <el-input
          v-model="filters.search"
          placeholder="搜尋流程模板"
          class="!w-60"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-button
          plain
          @click="handleRefresh"
          :loading="loading"
          title="重新整理"
        >
          <RotateCw class="mr-1" :size="16" />
          重整
        </el-button>

        <el-button type="primary" @click="handleAddTemplate">
          <Plus class="mr-1" :size="16" />
          新增流程模板
        </el-button>
      </div>
    </Teleport>

    <!-- 範本列表容器 -->
    <div
      v-show="viewMode === 'card'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2"
    >
      <!-- Skeleton 載入效果 -->
      <template v-if="loading">
        <div
          v-for="n in 8"
          :key="n"
          class="bg-white rounded-lg shadow-md p-6 animate-pulse"
        >
          <div class="flex items-start justify-between">
            <div class="space-y-3 w-full">
              <div class="h-6 bg-gray-200 rounded w-3/4"></div>
              <div class="flex items-center space-x-2">
                <div class="h-6 bg-gray-200 rounded w-20"></div>
                <div class="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div class="h-5 w-5 bg-gray-200 rounded"></div>
          </div>
          <div class="space-y-3 mt-4">
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div class="mt-4 space-y-2">
            <div class="flex items-center justify-between">
              <div class="h-4 bg-gray-200 rounded w-20"></div>
              <div class="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div class="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div class="mt-4 flex justify-end">
            <div class="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </template>

      <!-- 實際範本列表 -->
      <template v-else>
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <div class="p-6">
            <!-- 範本標題和操作按鈕 -->
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-800">
                  {{ template.name }}
                </h3>
                <div class="flex items-center mt-2 space-x-2">
                  <el-tag size="small" effect="plain">{{
                    template.type
                  }}</el-tag>
                  <el-tag
                    :type="getStatusTagType(template.status)"
                    size="small"
                    effect="light"
                  >
                    {{ getStatusLabel(template.status) }}
                  </el-tag>
                </div>
              </div>
              <el-dropdown trigger="click">
                <MoreVertical
                  :size="20"
                  class="text-gray-400 cursor-pointer hover:text-gray-600"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleEditTemplate(template)">
                      <Edit2 class="mr-2" :size="14" />
                      編輯
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="template.status === 'draft'"
                      @click="handlePublishTemplate(template)"
                    >
                      <Send class="mr-2" :size="14" />
                      發布
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="template.status === 'published'"
                      @click="handleDeprecateTemplate(template)"
                    >
                      <Archive class="mr-2" :size="14" />
                      棄用
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="template.status === 'draft'"
                      divided
                      @click="handleDeleteTemplate(template)"
                      class="text-red-500"
                    >
                      <Trash2 class="mr-2" :size="14" />
                      刪除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <!-- 範本描述 -->
            <p class="mt-3 text-sm text-gray-600 line-clamp-2">
              {{ template.description }}
            </p>

            <!-- 範本資訊 -->
            <div class="mt-4 space-y-2">
              <div
                class="flex items-center justify-between text-sm text-gray-500"
              >
                <div class="flex items-center">
                  <Tag :size="16" class="mr-2" />
                  <span class="text-xs">版本 {{ template.version }}</span>
                </div>
                <div class="flex items-center">
                  <User :size="16" class="mr-2" />
                  <span class="text-xs">{{ template.creator?.username }}</span>
                </div>
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <Calendar :size="16" class="mr-2" />
                <span class="text-xs"
                  >更新於 {{ formatTimestamp(template.updatedAt) }}</span
                >
              </div>
            </div>

            <!-- 底部按鈕 -->
            <div class="mt-1 flex items-center justify-end space-x-2">
              <el-button
                type="primary"
                link
                @click="handleDesignTemplate(template)"
              >
                <Pencil class="mr-1" :size="14" />
                設計流程
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <el-table
      v-show="viewMode === 'list'"
      v-loading="loading"
      :data="filteredTemplates"
      style="width: 100%"
    >
      <el-table-column
        type="index"
        label="序號"
        width="80"
        align="center"
        sortable
      />
      <el-table-column prop="type" label="類型" width="120" sortable>
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)">
            {{ getTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名稱" width="180" sortable />

      <el-table-column prop="description" label="描述" sortable />
      <el-table-column prop="version" label="版本" width="60" />
      <el-table-column prop="status" label="狀態" width="100" sortable>
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="創建時間" width="180" sortable>
        <template #default="{ row }">
          {{ formatTimestamp(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新時間" width="180" sortable>
        <template #default="{ row }">
          {{ formatTimestamp(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" link @click="handleEditTemplate(row)">
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
      draggable
      top="5vh"
      width="1000px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="mt-4"
      >
        <div class="flex items-center justify-between space-x-2">
          <el-form-item label="類型" prop="type">
            <el-select
              v-model="form.type"
              placeholder="請選擇類型"
              style="width: 150px"
            >
              <el-option label="業務流程" value="business" />
              <el-option label="系統流程" value="system" />
              <el-option label="分析流程" value="analysis" />
            </el-select>
          </el-form-item>
          <div class="flex items-center">
            <el-form-item label="版本" prop="version">
              <el-input
                v-model="form.version"
                placeholder="請輸入版本號，例如：1.0.0"
                class="!w-14 !text-right"
              />
            </el-form-item>
            <el-form-item label="狀態" prop="status">
              <el-select
                v-model="form.status"
                placeholder="請選擇狀態"
                style="width: 100px"
              >
                <el-option label="草稿" value="draft" />
                <el-option label="啟用" value="active" />
                <el-option label="停用" value="inactive" /> </el-select
            ></el-form-item>
          </div>
        </div>
        <el-form-item label="名稱" prop="name">
          <el-input v-model="form.name" placeholder="請輸入名稱" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="請輸入描述"
          />
        </el-form-item>
        <!-- <el-form-item label="版本" prop="version">
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
        </el-form-item> -->
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
import { ref, onMounted, onActivated, onDeactivated, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getFlowTemplates,
  createFlowTemplate,
  updateFlowTemplate,
  deleteFlowTemplate,
} from "@/api/modules/flow";
import { useUserStore } from "@/stores/user";
import { formatTimestamp } from "@/utils/dateUtils";

// 數據
const loading = ref(false);
const templates = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const userStore = useUserStore();

// 控制 Teleport 內容顯示
const showHeaderContent = ref(true);
const viewMode = ref("card");
// 篩選器狀態
const filters = ref({
  category: "",
  status: "",
  search: "",
});

// KeepAlive 生命週期鉤子
onActivated(() => {
  showHeaderContent.value = true;
});

onDeactivated(() => {
  showHeaderContent.value = false;
});

//TODO: remove this (這是給dialog用的)
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
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 處理新增範本
const handleAddTemplate = () => {
  isEdit.value = false;
  handleResetForm();
  dialogVisible.value = true;
};

// 處理編輯範本
const handleEditTemplate = (row) => {
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

import { useRouter } from "vue-router";
const router = useRouter();

// 處理設計範本
const handleDesignTemplate = (template) => {
  router.push(`/flow-templates/${template.id}/design`);
};

// 處理狀態切換(for table)
const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === "active" ? "inactive" : "active";
    await updateFlowTemplate(row.id, { ...row, status: newStatus });
    ElMessage.success("狀態更新成功");
    handleRefresh();
  } catch (error) {
    ElMessage.error("狀態更新失敗");
  }
};

// 處理刪除(for table)
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("確定要刪除這個流程模板嗎？", "提示", {
      type: "warning",
    });
    await deleteFlowTemplate(row.id);
    ElMessage.success("刪除成功");
    handleRefresh();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("刪除失敗");
    }
  }
};

// 處理提交(for dialog)
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
        handleRefresh();
      } catch (error) {
        ElMessage.error(isEdit.value ? "更新失敗" : "創建失敗");
      }
    }
  });
};

// 生命週期
onMounted(() => {
  handleRefresh();
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
