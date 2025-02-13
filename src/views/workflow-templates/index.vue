<template>
  <div class="p-6">
    <!-- 頂部過濾器 -->
    <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <!-- 左側篩選器 -->
        <div class="flex items-center space-x-4">
          <el-select
            v-model="filters.category"
            placeholder="選擇分類"
            clearable
            class="!w-40"
          >
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>

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
            placeholder="搜尋範本名稱"
            class="!w-60"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 右側按鈕 -->
        <div class="flex items-center space-x-2">
          <el-button type="primary" @click="handleCreateTemplate">
            <Plus class="mr-1" :size="16" />
            新增範本
          </el-button>
        </div>
      </div>
    </div>

    <!-- 範本列表 -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
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
                {{ template.templateName }}
              </h3>
              <div class="flex items-center mt-2 space-x-2">
                <el-tag size="small" effect="plain">{{
                  template.templateCategory
                }}</el-tag>
                <el-tag
                  :type="getStatusType(template.status)"
                  size="small"
                  effect="light"
                >
                  {{ getStatusText(template.status) }}
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
            <div class="flex items-center text-sm text-gray-500">
              <Tag :size="16" class="mr-2" />
              <span>版本 {{ template.version }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-500">
              <User :size="16" class="mr-2" />
              <span>{{ template.creator?.username }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-500">
              <Calendar :size="16" class="mr-2" />
              <span>更新於 {{ formatDate(template.updatedAt) }}</span>
            </div>
          </div>

          <!-- 底部按鈕 -->
          <div class="mt-6 flex items-center justify-end space-x-2">
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
    </div>

    <!-- 新增/編輯範本對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯範本' : '新增範本'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="mt-4"
      >
        <el-form-item label="範本名稱" prop="templateName">
          <el-input v-model="form.templateName" placeholder="請輸入範本名稱" />
        </el-form-item>

        <el-form-item label="分類" prop="templateCategory">
          <el-select
            v-model="form.templateCategory"
            placeholder="請選擇分類"
            class="w-full"
          >
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="版本" prop="version">
          <el-input
            v-model="form.version"
            placeholder="請輸入版本號，如：1.0.0"
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="請輸入範本描述"
          />
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Plus,
  MoreVertical,
  Calendar,
  User,
  Tag,
  Search,
  Edit2,
  Send,
  Archive,
  Trash2,
  Pencil,
} from "lucide-vue-next";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  publishTemplate,
  deprecateTemplate,
} from "@/api";

const router = useRouter();
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const workflowTemplates = ref([]);
const formRef = ref(null);

// 篩選器狀態
const filters = ref({
  category: "",
  status: "",
  search: "",
});

// 表單數據
const form = ref({
  id: "",
  templateName: "",
  templateCategory: "",
  description: "",
  version: "",
});

// 表單驗證規則
const rules = {
  templateName: [
    { required: true, message: "請輸入範本名稱", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "長度應在 2 到 50 個字符之間",
      trigger: "blur",
    },
  ],
  templateCategory: [
    { required: true, message: "請選擇分類", trigger: "change" },
  ],
  version: [
    { required: true, message: "請輸入版本號", trigger: "blur" },
    {
      pattern: /^\d+\.\d+\.\d+$/,
      message: "版本號格式應為：x.x.x",
      trigger: "blur",
    },
  ],
  description: [
    { required: true, message: "請輸入範本描述", trigger: "blur" },
    {
      min: 10,
      max: 500,
      message: "長度應在 10 到 500 個字符之間",
      trigger: "blur",
    },
  ],
};

// 分類選項（從範本數據中提取）
const categories = computed(() => {
  const categorySet = new Set(
    workflowTemplates.value.map((t) => t.templateCategory)
  );
  return Array.from(categorySet);
});

// 狀態選項
const statusOptions = [
  { value: "draft", label: "草稿" },
  { value: "published", label: "已發布" },
  { value: "deprecated", label: "已棄用" },
];

// 根據篩選條件過濾範本
const filteredTemplates = computed(() => {
  return workflowTemplates.value.filter((template) => {
    const categoryMatch =
      !filters.value.category ||
      template.templateCategory === filters.value.category;
    const statusMatch =
      !filters.value.status || template.status === filters.value.status;
    const searchMatch =
      !filters.value.search ||
      template.templateName
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
    published: "success",
    deprecated: "danger",
  };
  return types[status] || "info";
};

// 獲取狀態文字
const getStatusText = (status) => {
  const texts = {
    draft: "草稿",
    published: "已發布",
    deprecated: "已棄用",
  };
  return texts[status] || status;
};

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 獲取範本列表
const fetchTemplates = async () => {
  try {
    loading.value = true;
    const response = await getTemplates();
    // 確保 response.data 存在且是陣列
    workflowTemplates.value = Array.isArray(response.data) ? response.data : [];

    if (!Array.isArray(response.data)) {
      console.warn("API 回傳的資料結構不符合預期：", response);
    }
  } catch (error) {
    console.error("獲取範本列表失敗:", error);
    ElMessage.error("獲取範本列表失敗");
    workflowTemplates.value = []; // 錯誤時設置為空陣列
  } finally {
    loading.value = false;
  }
};

// 處理新增範本
const handleCreateTemplate = () => {
  isEdit.value = false;
  form.value = {
    templateName: "",
    templateCategory: "",
    description: "",
    version: "",
  };
  dialogVisible.value = true;
};

// 處理編輯範本
const handleEditTemplate = (template) => {
  isEdit.value = true;
  form.value = {
    id: template.id,
    templateName: template.templateName,
    templateCategory: template.templateCategory,
    description: template.description,
    version: template.version,
  };
  dialogVisible.value = true;
};

// 處理設計範本
const handleDesignTemplate = (template) => {
  router.push(`/workflow-templates/${template.id}/design`);
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

    await publishTemplate(template.id);
    ElMessage.success("範本發布成功");
    fetchTemplates();
  } catch (error) {
    if (error !== "cancel") {
      console.error("發布範本失敗:", error);
      ElMessage.error("發布範本失敗");
    }
  }
};

// 處理棄用範本
const handleDeprecateTemplate = async (template) => {
  try {
    await ElMessageBox.confirm(
      "確定要棄用此範本嗎？棄用後將不能恢復。",
      "棄用確認",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deprecateTemplate(template.id);
    ElMessage.success("範本棄用成功");
    fetchTemplates();
  } catch (error) {
    if (error !== "cancel") {
      console.error("棄用範本失敗:", error);
      ElMessage.error("棄用範本失敗");
    }
  }
};

// 處理刪除範本
const handleDeleteTemplate = async (template) => {
  try {
    await ElMessageBox.confirm(
      "確定要刪除此範本嗎？此操作不可恢復。",
      "刪除確認",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "error",
      }
    );

    await deleteTemplate(template.id);
    ElMessage.success("範本刪除成功");
    fetchTemplates();
  } catch (error) {
    if (error !== "cancel") {
      console.error("刪除範本失敗:", error);
      ElMessage.error("刪除範本失敗");
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
      await updateTemplate(form.value.id, {
        templateName: form.value.templateName,
        templateCategory: form.value.templateCategory,
        description: form.value.description,
        version: form.value.version,
      });
      ElMessage.success("範本更新成功");
    } else {
      await createTemplate({
        templateName: form.value.templateName,
        templateCategory: form.value.templateCategory,
        description: form.value.description,
        version: form.value.version,
      });
      ElMessage.success("範本創建成功");
    }

    dialogVisible.value = false;
    fetchTemplates();
  } catch (error) {
    console.error("提交失敗:", error);
    ElMessage.error(error.response?.data?.message || "操作失敗");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTemplates();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 範本卡片狀態邊框 */
.bg-white {
  border-top: 3px solid transparent;
}

/* 草稿狀態 */
.bg-white:has(.el-tag--info) {
  border-top-color: var(--el-color-info);
}

/* 已發布狀態 */
.bg-white:has(.el-tag--success) {
  border-top-color: var(--el-color-success);
}

/* 已棄用狀態 */
.bg-white:has(.el-tag--danger) {
  border-top-color: var(--el-color-danger);
}
</style>
