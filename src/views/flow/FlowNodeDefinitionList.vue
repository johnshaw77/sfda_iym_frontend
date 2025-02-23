<!-- 節點定義管理頁面 -->

<template>
  <div class="p-0">
    <Teleport to="#header-actions" v-if="showHeaderContent">
      <el-button
        plain
        @click="handleRefresh"
        :loading="loading"
        title="重新整理"
      >
        <RotateCw class="mr-1" :size="14" />
        重整
      </el-button>

      <el-button type="primary" @click="handleCreate">
        <Plus class="mr-1" :size="14" />
        新增節點定義
      </el-button>
    </Teleport>

    <el-table v-loading="loading" :data="nodeDefinitions" style="width: 100%">
      <!-- <el-table-column prop="id" label="ID" width="180" /> -->
      <el-table-column
        type="index"
        label="序號"
        width="80"
        align="center"
        sortable
      />
      <el-table-column prop="icon" label="圖示" width="60">
        <template #default="{ row }">
          <component :is="icons[row.icon]" class="w-4 h-4" />
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分類" width="120" sortable>
        <template #default="{ row }">
          <el-tag :type="getCategoryType(row.category)">
            {{ getCategoryLabel(row.category) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="名稱" width="200" sortable>
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <!-- 圖示 -->
            <!-- <component :is="icons[row.icon]" class="w-4 h-4" /> -->
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" />

      <el-table-column
        prop="componentPath"
        label="組件路徑"
        width="120"
        sortable
      />

      <el-table-column
        prop="componentName"
        label="組件名稱"
        width="200"
        sortable
      >
        <template #default="{ row }">
          <el-tooltip
            v-if="row.componentPath && row.componentName"
            :content="`@/components/flow-nodes/${row.componentPath}/${row.componentName}`"
            effect="light"
            placement="top"
          >
            <div class="cursor-help">
              {{ row.componentName }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="創建時間" width="150" sortable>
        <template #default="{ row }">
          {{ formatTimestamp(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新時間" width="150" sortable>
        <template #default="{ row }">
          {{ formatTimestamp(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" link @click="handleEdit(row)">
              編輯
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              刪除
            </el-button>
            <el-button
              v-if="row.componentPath && row.componentName"
              type="warning"
              link
              @click="handlePreviewComponent(row)"
            >
              預覽
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 編輯對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯節點定義' : '新增節點定義'"
      top="5vh"
      draggable
      width="800px"
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
        <el-form-item label="分類" prop="category">
          <el-select
            v-model="form.category"
            placeholder="請選擇分類"
            style="width: 100%"
          >
            <el-option label="資料輸入" value="data-input" />
            <el-option label="資料處理" value="data-process" />
            <el-option label="資料輸出" value="data-output" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="請輸入描述"
          />
        </el-form-item>
        <el-form-item label="圖示" prop="icon">
          <IconPicker v-model="form.icon" />
        </el-form-item>
        <el-form-item label="組件名稱" prop="componentName">
          <el-input v-model="form.componentName" placeholder="請輸入組件名稱" />
        </el-form-item>
        <el-form-item label="組件路徑" prop="componentPath">
          <el-input
            v-model="form.componentPath"
            placeholder="請輸入組件路徑（選填）"
          />
        </el-form-item>

        <!-- <el-form-item label="預設配置" prop="config">
          <el-input
            v-model="form.config"
            type="textarea"
            :rows="4"
            placeholder="請輸入 JSON 格式的預設配置"
          />
        </el-form-item>
        <el-form-item label="UI 配置" prop="uiConfig">
          <el-input
            v-model="form.uiConfig"
            type="textarea"
            :rows="4"
            placeholder="請輸入 JSON 格式的 UI 配置"
          />
        </el-form-item>
        <el-form-item label="連接點配置" prop="handles">
          <el-input
            v-model="form.handles"
            type="textarea"
            :rows="4"
            placeholder="請輸入 JSON 格式的連接點配置"
          />
        </el-form-item> -->
        <el-form-item label="組件路徑" prop="componentPath">
          <div class="flex items-center space-x-1">
            <div
              class="px-1 bg-gray-100 rounded-sm text-gray-500 whitespace-nowrap"
            >
              @/components/flow-nodes/
            </div>
            <el-select
              v-model="form.componentPath"
              class="!w-[100px]"
              placeholder="請選擇組件路徑"
              filterable
            >
              <el-option label="base" value="base" />
              <el-option label="business" value="business" />
            </el-select>

            <el-autocomplete
              v-model="form.componentName"
              :fetch-suggestions="queryComponentSearch"
              placeholder="組件名稱，例如：TopDefectsNode"
              clearable
              style="width: 340px"
              @select="handleComponentNameSelect"
            >
              <template #default="{ item }">
                <div class="flex flex-col">
                  <span>{{ item.value }}</span>
                  <span class="text-xs text-gray-500">{{ item.path }}</span>
                </div>
              </template>
            </el-autocomplete>
          </div>
          <div class="form-item-tip w-full mt-2">
            <el-alert type="warning" show-icon :closable="false" class="mt-0">
              組件的相對路徑，系統會自動添加 @/components/flow-nodes/ 前綴
              <br />※※系統裡要有對應的 Vue 組件※※</el-alert
            >
          </div>
        </el-form-item>
        <el-divider><ArrowBigDownDash /></el-divider>
        <div
          v-if="fullComponentPath"
          class="text-white bg-blue-700 p-2 rounded-md flex items-center justify-between"
        >
          <div>
            完整組件路徑:
            {{ fullComponentPath }}
          </div>
          <el-button
            type="primary"
            plain
            size="small"
            @click="handlePreviewFormComponent"
          >
            預覽節點
          </el-button>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">確定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 節點預覽對話框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="節點預覽(出現的位置待修正)"
      width="1200px"
      top="5vh"
      :fullscreen="false"
      :draggable="true"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div
        class="w-full h-[800px] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center"
      >
        <VueFlow
          v-if="previewDialogVisible"
          v-model="nodes"
          :default-viewport="{ x: 0, y: 0, zoom: 1 }"
          :min-zoom="1"
          :max-zoom="1"
          :pannable="false"
          :zoomable="false"
          :selectable="false"
          :deletable="false"
          :draggable="false"
          :node-types="{
            custom: currentComponent,
          }"
          class="w-full h-full flex items-center justify-center"
          :fit-view="true"
          :center="true"
          :auto-connect="false"
          :snap-to-grid="true"
          :snap-grid="[20, 20]"
        >
          <Background pattern-color="#aaa" :gap="20" />
        </VueFlow>
      </div>
    </el-dialog>
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
import IconPicker from "@/components/IconPicker.vue";
import {
  getFlowNodeDefinitions,
  createFlowNodeDefinition,
  updateFlowNodeDefinition,
  deleteFlowNodeDefinition,
} from "@/api/modules/flow";
import {
  DEFAULT_UI_CONFIG,
  DEFAULT_VALIDATION,
  DEFAULT_HANDLES,
  parseJsonField,
  createDefaultNode,
  processNodeData,
  prepareNodeDataForSave,
} from "@/utils/nodeUtils";
import { useFlowNodeComponents } from "@/composables/useFlowNodeComponents";
import JsonViewer from "vue-json-viewer";
import { VueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
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

const formRef = ref(null);

const form = ref({
  name: "",
  category: "",
  description: "",
  componentName: "",
  componentPath: "",
  config: "{}",
  uiConfig: "{}",
  handles: "{}",
});

const rules = {
  name: [
    { required: true, message: "請輸入名稱", trigger: "blur" },
    { min: 2, max: 50, message: "長度在 2 到 50 個字符之間", trigger: "blur" },
  ],
  category: [{ required: true, message: "請選擇分類", trigger: "change" }],
  description: [
    { required: true, message: "請輸入描述", trigger: "blur" },
    { max: 200, message: "長度不能超過 200 個字符", trigger: "blur" },
  ],
  componentName: [
    { required: true, message: "請輸入組件名稱", trigger: "blur" },
  ],
  config: [
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
  uiConfig: [
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
  handles: [
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
};

// 計算屬性
const fullComponentPath = computed(() => {
  if (!form.value.componentPath || !form.value.componentName) return "";
  // 確保組件名稱包含 .vue 副檔名
  const componentName = form.value.componentName.endsWith(".vue")
    ? form.value.componentName
    : `${form.value.componentName}.vue`;
  return `@/components/flow-nodes/${form.value.componentPath}/${componentName}`;
});

// 方法
const getCategoryType = (category) => {
  const types = {
    "data-input": "success",
    "data-process": "warning",
    "data-output": "danger",
  };
  return types[category] || "info";
};

const getCategoryLabel = (category) => {
  const labels = {
    "data-input": "資料輸入",
    "data-process": "資料處理",
    "data-output": "資料輸出",
  };
  return labels[category] || category;
};

// 將 components 轉換為下拉選單選項
const componentOptions = computed(() => {
  console.log("flowNodeComponents value:", flowNodeComponents.value);

  // 檢查 components.value 是否為空
  if (
    !flowNodeComponents.value ||
    Object.keys(flowNodeComponents.value).length === 0
  ) {
    console.log("No components loaded");
    return [];
  }

  const options = Object.entries(flowNodeComponents.value).map(
    ([path, component]) => {
      // 移除前面的 '@' 符號
      const cleanPath = path.startsWith(".") ? path.slice(2) : path;
      console.log("Processing path:", path, "-> clean path:", cleanPath);

      return {
        value: path,
        label: getComponentName(path),
        path: cleanPath,
      };
    }
  );

  console.log("Processed options:", options);
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
    componentName: "",
    componentPath: "",
    config: "{}",
    uiConfig: "{}",
    handles: "{}",
  };
  if (formRef.value) {
    formRef.value.resetFields();
  }
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

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = {
          ...form.value,
          config: JSON.parse(form.value.config),
          uiConfig: JSON.parse(form.value.uiConfig),
          handles: JSON.parse(form.value.handles),
        };

        if (isEdit.value) {
          await updateFlowNodeDefinition(form.value.id, submitData);
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
    }
  });
};

// 生命週期
onMounted(() => {
  handleRefresh();
});
</script>

<style></style>
