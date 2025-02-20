<template>
  <Teleport to="#header-actions">
    <div class="flex items-center space-x-4">
      <el-input
        v-model="searchQuery"
        placeholder="搜尋節點定義"
        class="!w-[300px]"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-button
          plain
          @click="loadNodeDefinitions"
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
    </div>
  </Teleport>

  <div class="h-full flex flex-col bg-white">
   
    <!-- 表格區域 -->
    <div class="flex-1 p-4 overflow-auto">
      <el-table
        v-loading="loading"
        :data="filteredNodes"
        style="width: 100%"
        v-if="!loading"
      >
        <el-table-column prop="definitionKey" label="定義鍵值" width="240">
          <template #default="{ row }">
            <div class="flex items-center">
              <component
                :is="getNodeIcon(row.category, row.definitionKey)"
                :size="16"
                class="mr-2 flex-shrink-0"
              />
              <span>{{ row.definitionKey }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名稱" width="220" />
        <el-table-column prop="category" label="分類" width="150">
          <template #default="{ row }">
            <el-tag
              :type="getCategoryTagType(row.category)"
              size="small"
              effect="light"
            >
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nodeType" label="類型" width="150">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.nodeType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="componentPath" label="組件完整路徑名稱" width="400">
          <template #default="{ row }">
            <div class="flex items-center justify-between">
              <span v-if="row.componentPath" class="text-gray-600">
                @/components/flow-nodes/{{ row.componentPath }}/{{ row.componentName }}
                <el-button
                  type="primary"
                  link
                  size="small"
                  class="ml-2"
                  @click="handlePreviewComponent(row)"
                >
                  預覽節點
                </el-button>
              </span>
              <span v-else class="text-gray-400 text-sm">-</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="API設定" width="300">
          <template #default="{ row }">
            <div v-if="row.componentName?.startsWith('Base') && row.apiEndpoint" class="space-y-1">
              <div class="flex items-center space-x-2">
                <el-tag size="small" type="info">{{ row.apiMethod }}</el-tag>
                <span class="text-gray-600">{{ row.apiEndpoint }}</span>
              </div>
            </div>
            <span v-else class="text-gray-400 text-sm">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="apiMethod" label="" width="80" v-if="false">
        </el-table-column>

        <el-table-column label="配置" width="100">
          <template #default="{ row }">
            <el-button
              v-if="row.componentName?.startsWith('Base') && Object.keys(row.config || {}).length > 0"
              type="primary"
              link
              size="small"
              @click="handleShowConfig(row)"
            >
              查看配置
            </el-button>
            <span v-else class="text-gray-400 text-sm">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-tooltip content="編輯">
                <el-button
                  type="primary"
                  link
                  :icon="Edit"
                  @click="handleEdit(row)"
                />
              </el-tooltip>
              <el-tooltip content="刪除">
                <el-button
                  type="danger"
                  link
                  :icon="Trash2"
                  @click="handleDelete(row)"
                />
              </el-tooltip>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- Skeleton Loading -->
      <div v-else class="space-y-4">
        <el-skeleton :rows="8" animated>
          <template #template>
            <el-skeleton-item variant="rect" style="width: 100%; height: 40px; margin-bottom: 8px"/>
            <div v-for="i in 8" :key="i" class="flex space-x-4 items-center">
              <el-skeleton-item variant="text" style="width: 180px; height: 32px"/>
              <el-skeleton-item variant="text" style="width: 180px; height: 32px"/>
              <el-skeleton-item variant="text" style="width: 150px; height: 32px"/>
              <el-skeleton-item variant="text" style="width: 150px; height: 32px"/>
              <el-skeleton-item variant="text" style="width: 180px; height: 32px"/>
              <el-skeleton-item variant="text" style="width: 300px; height: 32px"/>
              <el-skeleton-item variant="text" style="width: 100px; height: 32px"/>
              <el-skeleton-item variant="text" style="flex: 1; height: 32px"/>
              <el-skeleton-item variant="text" style="width: 150px; height: 32px"/>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <!-- 編輯對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯節點定義' : '新增節點定義'"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
        @submit.prevent
      >
      <div class="flex items-start space-x-4">
          <el-form-item label="分類" prop="category" class="flex-1">
            <el-select
              v-model="form.category"
              class="w-full"
              placeholder="請選擇節點分類"
            >
              <el-option
                v-for="category in nodeCategories"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="flex-1">
            <template #label>
              <div class="flex items-center">
                <span>類型</span>
                <el-tooltip
                  content="主要提供給 VueFlow 識別用"
                  placement="top"
                  effect="light"
                >
                  <Info class="ml-1" :size="14" />
                </el-tooltip>
              </div>
            </template>
            <el-select
              v-model="form.nodeType"
              class="w-full"
              placeholder="請選擇節點類型"
            >
              <el-option
                v-for="type in nodeTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
        </div>       

        <el-form-item label="名稱" prop="name">
          <el-input
            v-model="form.name"
            placeholder="請輸入節點名稱（2-50字元）"
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="請輸入節點描述（2-200字元）"
          />
        </el-form-item>

        <el-form-item label="節點定義鍵值" prop="definitionKey">
          <div class="flex w-full">
            <el-input
              v-model="form.definitionKey"
              placeholder="請輸入節點定義鍵值（5-100字元）"
              :disabled="isEdit"
              @input="handleDefinitionKeyInput"
              @keydown="handleDefinitionKeyKeydown"
              class="flex-1"
            >
              <template #append>
                <el-button @click="handleGenerateKey" :disabled="isEdit">
                  <Sparkles class="mr-1" :size="14" />
                  生成
                </el-button>
              </template>
            </el-input>
          </div>
          <div class="form-item-tip">
            系統會根據分類和名稱自動生成鍵值，您也可以自行輸入或編輯
          </div>
        </el-form-item>

        <el-form-item label="組件路徑" prop="componentPath">
          <div class="flex items-center space-x-1">
            <div class="px-1 bg-gray-100 rounded-sm text-gray-500 whitespace-nowrap">@/components/flow-nodes/</div>
            <el-select
              v-model="form.componentPath"
              class="!w-[260px]"
              placeholder="請選擇組件路徑"
              clearable
              allow-create
              filterable
            >
              <el-option label="base" value="base" />
              <el-option label="business" value="business" />
            </el-select>

            <el-input
              v-model="form.componentName"
              placeholder="組件名稱，例如：BaseBusinessProcess.vue"
            />
          </div>
          <div class="form-item-tip w-full">
            <el-alert type="warning" show-icon :closable="false" class="mt-0">
              組件的相對路徑，系統會自動添加 @/components/flow-nodes/ 前綴 <br/>※※系統裡要有對應的 Vue 組件※※</el-alert>
          </div>
        </el-form-item>
        <el-divider><ArrowBigDownDash /></el-divider>
        <div v-if="fullComponentPath" class="text-white bg-blue-700 p-2 rounded-md flex items-center justify-between">
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

        <el-form-item
          v-if="form.componentName?.startsWith('Base')"
          label="API設定"
          prop="apiEndpoint"
        >
          <el-input
            v-model="form.apiEndpoint"
            placeholder="請輸入API端點，以 / 開頭"
          >
            <template #append>
              <el-select v-model="form.apiMethod" style="width: 100px">
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
                <el-option label="PUT" value="PUT" />
                <el-option label="DELETE" value="DELETE" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="form.componentName?.startsWith('Base')" label="節點配置">
          <div class="bg-gray-50 p-4 rounded-lg">
            <json-viewer
              v-if="Object.keys(form.config || {}).length > 0"
              :value="form.config"
              :expand-depth="3"
              copyable
              sort
            />
            <div v-else class="text-gray-400 text-sm">尚未設定配置</div>
          </div>
          <div class="mt-2 flex justify-end">
            <el-button type="primary" link @click="handleEditConfig">
              編輯配置
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <el-button @click="handleTest" type="info" plain>
            <Wand2 class="mr-1" :size="14" />
            測試
          </el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            確定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 配置預覽對話框 -->
    <el-dialog
      v-model="configDialogVisible"
      title="節點配置"
      width="500px"
      destroy-on-close
    >
      <json-viewer
        v-if="selectedConfig"
        :value="selectedConfig"
        :expand-depth="5"
        copyable
        sort
      />
    </el-dialog>

    <!-- 配置編輯對話框 -->
    <el-dialog
      v-model="configEditDialogVisible"
      title="編輯節點配置"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <div class="mb-4">
        <el-input
          v-model="configEditValue"
          type="textarea"
          :rows="10"
          placeholder="請輸入 JSON 格式的配置"
        />
      </div>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <el-button @click="configEditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveConfig">
            確定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 節點預覽對話框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="節點預覽"
      width="1200px"
      :fullscreen="false"
      :draggable="true"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="w-full h-[800px] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
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
            custom: currentPreviewComponent
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
import { ref, computed, onMounted, watch, shallowRef } from "vue";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import JsonViewer from "vue-json-viewer";
// import BaseNode from "@/components/flow-nodes/base/BaseNode.vue";
import {
  Component,
  Search,
  Plus,
  Edit,
  Trash2,
  FileInput,
  Filter,
  BarChart,
  RotateCw,
  Wand2,
  Sparkles,
  Info,
  ArrowBigDownDash
} from "lucide-vue-next";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";
import "vue-json-viewer/style.css";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getNodeDefinitions,
  createNodeDefinition,
  updateNodeDefinition,
  deleteNodeDefinition,
} from "@/api";
import {
  nodeDefinitionValidators,
  formatDefinitionKey,
  isValidDefinitionKeyInput,
} from "@/utils/validators";
import { getNodeIcon, getCategoryIcon } from "@/utils/nodeIcons";
import {
  DEFAULT_UI_CONFIG,
  DEFAULT_VALIDATION,
  DEFAULT_HANDLES,
  parseJsonField,
  createDefaultNode,
  processNodeData,
  prepareNodeDataForSave,
} from "@/utils/nodeUtils";

// 狀態
const loading = ref(false);
const searchQuery = ref("");
const dialogVisible = ref(false);
const submitting = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const form = ref(createDefaultNode());
const nodeList = ref([]);
const configDialogVisible = ref(false);
const selectedConfig = ref(null);
const configEditDialogVisible = ref(false);
const configEditValue = ref("");
const previewDialogVisible = ref(false);
const currentPreviewComponent = shallowRef(null);
const previewNodeData = ref(null);
const vueFlowInstance = useVueFlow();
const nodes = ref([]);

// 節點分類
const nodeCategories = [
  { value: "business-input", label: "業務輸入節點" },
  { value: "business-process", label: "業務處理節點" },
  { value: "statistical-analysis", label: "統計分析節點" },
];

// 節點類型
const nodeTypes = [
  { value: "custom-input", label: "自定義輸入節點" },
  { value: "custom-process", label: "自定義處理節點" },
  { value: "statistic-process", label: "統計分析節點" },
];

// 過濾後的節點列表
const filteredNodes = computed(() => {
  if (!searchQuery.value) return nodeList.value;

  const query = searchQuery.value.toLowerCase();
  return nodeList.value.filter(
    (node) =>
      node.definitionKey.toLowerCase().includes(query) ||
      node.name.toLowerCase().includes(query) ||
      node.description.toLowerCase().includes(query) ||
      (node.componentName && node.componentName.toLowerCase().includes(query)) ||
      (node.apiEndpoint && node.apiEndpoint.toLowerCase().includes(query))
  );
});

// 獲取分類標籤類型
const getCategoryTagType = (category) => {
  const types = {
    "business-input": "success",
    "business-process": "warning",
    "statistical-analysis": "info",
  };
  return types[category] || "info";
};

// 獲取分類標籤文字
const getCategoryLabel = (category) => {
  const found = nodeCategories.find((item) => item.value === category);
  return found ? found.label : category;
};

// 載入節點定義列表
const loadNodeDefinitions = async () => {
  loading.value = true;
  try {
    const response = await getNodeDefinitions();
    nodeList.value = response.data.map((node) => ({
      ...node,
      ...processNodeData(node),
    }));
  } catch (error) {
    console.error("載入節點定義失敗:", error);
    ElMessage.error("載入節點定義失敗");
  } finally {
    loading.value = false;
  }
};

// 處理新增
const handleCreate = () => {
  isEdit.value = false;
  form.value = {
    ...createDefaultNode(),
    componentPath: '',
    componentName: ''
  };
  dialogVisible.value = true;
};

// 處理編輯
const handleEdit = (row) => {
  isEdit.value = true;
  form.value = {
    ...row,
    componentPath: row.componentPath || '',
    componentName: row.componentName || ''
  };
  dialogVisible.value = true;
};

// 處理刪除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      "確定要刪除此節點定義嗎？此操作不可恢復。",
      "刪除確認",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "error",
      }
    );

    await deleteNodeDefinition(row.definitionKey);
    ElMessage.success("節點定義刪除成功");
    loadNodeDefinitions();
  } catch (error) {
    if (error !== "cancel") {
      console.error("刪除失敗:", error);
      ElMessage.error("刪除失敗");
    }
  }
};

// 處理提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning("請檢查並修正表單中的錯誤");
      return;
    }

    submitting.value = true;
    try {
      const data = prepareNodeDataForSave(form.value);

      if (isEdit.value) {
        await updateNodeDefinition(form.value.definitionKey, data);
        ElMessage.success("節點定義更新成功");
      } else {
        await createNodeDefinition(data);
        ElMessage.success("節點定義創建成功");
      }

      dialogVisible.value = false;
      loadNodeDefinitions();
    } catch (error) {
      console.error("儲存失敗:", error);
      ElMessage.error(error.response?.data?.message || "儲存失敗");
    } finally {
      submitting.value = false;
    }
  });
};

// 處理節點定義鍵值輸入
const handleDefinitionKeyInput = (value) => {
  if (!value) return;
  form.value.definitionKey = formatDefinitionKey(value);
};

// 處理節點定義鍵值按鍵
const handleDefinitionKeyKeydown = (event) => {
  if (!isValidDefinitionKeyInput(event)) {
    event.preventDefault();
  }
};

// 處理顯示配置
const handleShowConfig = (row) => {
  selectedConfig.value = row.config;
  configDialogVisible.value = true;
};

// 處理編輯配置
const handleEditConfig = () => {
  configEditValue.value = JSON.stringify(form.value.config, null, 2);
  configEditDialogVisible.value = true;
};

// 處理保存配置
const handleSaveConfig = () => {
  try {
    const config = JSON.parse(configEditValue.value);
    form.value.config = config;
    ElMessage.success("節點配置更新成功");
    configEditDialogVisible.value = false;
  } catch (error) {
    console.error("保存配置失敗:", error);
    ElMessage.error("保存配置失敗");
  }
};

// 處理測試數據
const handleTest = () => {
  const mockData = {
    business: {
      definitionKey: "business_process_test",
      name: "業務處理測試節點",
      category: "business-process",
      nodeType: "custom-process",
      description: "這是一個用於測試的業務處理節點",
      componentName: "BaseBusinessProcess",
      componentPath: "base/BaseBusinessProcess.vue",
      apiEndpoint: "/api/business/process",
      apiMethod: "POST",
      config: {
        inputFields: [
          { name: "customerName", label: "客戶名稱", type: "string", required: true },
          { name: "orderAmount", label: "訂單金額", type: "number", required: true },
          { name: "orderDate", label: "訂單日期", type: "date" }
        ],
        outputFields: [
          { name: "orderId", label: "訂單編號", type: "string" },
          { name: "status", label: "處理狀態", type: "string" }
        ],
        validation: {
          rules: {
            orderAmount: { min: 0, max: 1000000 }
          }
        }
      }
    },
    statistical: {
      definitionKey: "statistical_analysis_test",
      name: "統計分析測試節點",
      category: "statistical-analysis",
      nodeType: "statistic-process",
      description: "這是一個用於測試的統計分析節點",
      componentName: "BaseStatisticalAnalysis",
      componentPath: "base/BaseStatisticalAnalysis.vue",
      apiEndpoint: "/api/statistics/analyze",
      apiMethod: "POST",
      config: {
        analysisType: "timeSeriesAnalysis",
        parameters: {
          timeRange: "1d",
          interval: "1h",
          metrics: ["sum", "average", "max", "min"]
        },
        visualization: {
          type: "lineChart",
          options: {
            showLegend: true,
            enableZoom: true
          }
        }
      }
    },
    input: {
      definitionKey: "custom_input_test",
      name: "自定義輸入測試節點",
      category: "business-input",
      nodeType: "custom-input",
      description: "這是一個用於測試的自定義輸入節點",
      componentName: "CustomFormInput",
      componentPath: "custom/CustomFormInput.vue",
      config: {
        formFields: [
          { type: "text", label: "姓名", required: true },
          { type: "number", label: "年齡", min: 0, max: 150 },
          { type: "select", label: "性別", options: ["男", "女", "其他"] }
        ]
      }
    }
  };

  // 根據當前選擇的節點類型載入對應的測試數據
  const categoryMap = {
    "business-process": mockData.business,
    "statistical-analysis": mockData.statistical,
    "business-input": mockData.input
  };

  const testData = categoryMap[form.value.category] || mockData.business;
  
  // 合併現有數據和測試數據，並處理組件路徑
  const { prefix, suffix } = initComponentPath(testData.componentPath);
  form.value = {
    ...form.value,
    ...testData,
    componentPathPrefix: prefix,
    componentPathSuffix: suffix,
    definitionKey: form.value.definitionKey || testData.definitionKey
  };

  ElMessage.success("測試數據已載入");
};

// 監聽表單變化，自動更新鍵值建議
watch(
  () => [form.value.category, form.value.name],
  ([newCategory, newName]) => {
    if (!isEdit.value && newCategory && newName) {
      form.value.definitionKey = generateDefinitionKey(newCategory, newName);
    }
  }
);

// 生成定義鍵值
const generateDefinitionKey = (category, name) => {
  if (!category || !name) return '';
  
  // 使用 timestamp 作為唯一識別碼
  const timestamp = Date.now().toString().slice(-4);
  
  // 組合鍵值
  const key = `${category}_node_${timestamp}`;
  
  return formatDefinitionKey(key);
};

// 處理生成鍵值按鈕點擊
const handleGenerateKey = () => {
  if (!form.value.category) {
    ElMessage.warning('請先選擇節點分類');
    return;
  }
  
  form.value.definitionKey = generateDefinitionKey(
    form.value.category,
    form.value.name
  );
  
  ElMessage.success('已生成新的節點定義鍵值');
};

// 修改表單驗證規則
const formRules = {
  definitionKey: [
    { required: true, message: '請輸入節點定義鍵值' },
    { 
      validator: (rule, value, callback) => {
        if (value && (value.length < 5 || value.length > 100)) {
          callback(new Error('鍵值長度需在 5-100 個字元之間'));
        } else {
          callback();
        }
      }
    }
  ],
  name: [
    { required: true, message: '請輸入節點名稱' },
    { min: 2, max: 50, message: '名稱長度需在 2-50 個字元之間' }
  ],
  description: [
    { required: true, message: '請輸入節點描述' },
    { min: 2, max: 200, message: '描述長度需在 2-200 個字元之間' }
  ],
  category: [
    { required: true, message: '請選擇節點分類' }
  ],
  nodeType: [
    { required: true, message: '請選擇節點類型' }
  ]
};

// 在表單初始化時分解組件路徑
const initComponentPath = (path) => {
  if (!path) return { prefix: '', name: '' };
  const parts = path.split('/');
  return {
    prefix: parts[0] || '',
    name: parts.slice(1).join('/')
  };
};

// 在組件掛載時載入數據
onMounted(() => {
  loadNodeDefinitions();
});

// 計算屬性
const fullComponentPath = computed(() => {
  if (!form.value.componentPath || !form.value.componentName) return '';
  return `@/components/flow-nodes/${form.value.componentPath}/${form.value.componentName}`;
});

// 預覽組件
const handlePreviewComponent = async (row) => {
  try {
    if (!row.componentPath || !row.componentName) return;
    
    // 構建完整的組件路徑
    const componentPath = `/src/components/flow-nodes/${row.componentPath}/${row.componentName}`;
    
    // 動態載入組件
    const module = await import(/* @vite-ignore */ componentPath);
    currentPreviewComponent.value = module.default;
    
    // 設置預覽節點數據
    const newNode = {
      id: 'preview-node',
      type: 'custom',
      position: { x: 0, y: 0 },
      draggable: false,
      selectable: false,
      data: {
        ...row,
        title: row.name,
        description: row.description
      }
    };
    
    nodes.value = [newNode];
    previewNodeData.value = newNode;
    previewDialogVisible.value = true;
  } catch (error) {
    ElMessageBox.alert(
      `<div class="text-red-500 font-bold text-lg mb-2">❌ 載入組件失敗</div>
       <div class="text-gray-700">請檢查：</div>
       <ul class="list-disc pl-4 mt-2 space-y-1 text-gray-600">
         <li>組件路徑是否正確</li>
         <li>檔案名稱是否有錯字</li>
         <li>對應的 Vue 檔案是否存在</li>
       </ul>`,
      '錯誤提示',
      {
        confirmButtonText: '我知道了',
        dangerouslyUseHTMLString: true,
        customClass: {
          container: 'error-alert-container'
        },
        width: '360px'
      }
    );
    console.error('載入組件失敗：', error);
  }
};

// 處理表單中的預覽
const handlePreviewFormComponent = async () => {
  if (!form.value.componentPath || !form.value.componentName) {
    ElMessage.warning('請先填寫完整的組件路徑和名稱');
    return;
  }
  
  try {
    // 構建完整的組件路徑
    const componentPath = `/src/components/flow-nodes/${form.value.componentPath}/${form.value.componentName}`;
    
    // 動態載入組件
    const module = await import(/* @vite-ignore */ componentPath);
    currentPreviewComponent.value = module.default;
    
    // 設置預覽節點數據
    const newNode = {
      id: 'preview-node',
      type: 'custom',
      position: { x: 0, y: 0 },
      draggable: false,
      selectable: false,
      data: {
        ...form.value,
        title: form.value.name,
        description: form.value.description
      }
    };
    
    nodes.value = [newNode];
    previewNodeData.value = newNode;
    previewDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('載入組件失敗：' + error.message);
    console.error('載入組件失敗：', error);
  }
};

// 監聽預覽對話框的開關
watch(previewDialogVisible, (visible) => {
  if (!visible) {
    // 當對話框關閉時，清理狀態
    nodes.value = [];
    previewNodeData.value = null;
    currentPreviewComponent.value = null;
  }
});
</script>

<style>
.vue-flow {
  @apply flex items-center justify-center;
}

.vue-flow__viewport {
  @apply flex items-center justify-center;
}

.vue-flow__container {
  @apply flex items-center justify-center;
}

.vue-flow__node {
  @apply !transform-none;
}

.vue-flow__minimap {
  transform: scale(0.8);
  transform-origin: bottom right;
}

.vue-flow-node-preview {
  @apply rounded-lg border border-gray-200 bg-white shadow-sm;
}

:deep(.el-menu .el-menu--vertical) {
  width: 100% !important;
  background-color: red !important;
}

/* 左側選單樣式 */
:deep(.el-menu) {
  @apply !border-0 !w-full;
}

:deep(.el-sub-menu) {
  @apply !w-full;
}

:deep(.el-sub-menu .el-sub-menu__title) {
  @apply !px-4 !w-full;
}

:deep(.el-menu-item) {
  @apply !px-4 !w-full;
}

:deep(.el-menu--popup) {
  @apply !min-w-[16rem];
}

:deep(.el-sub-menu__title),
:deep(.el-menu-item) {
  @apply !h-10 !leading-10;
}

:deep(.el-menu-item.is-active) {
  @apply !bg-blue-50;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  @apply !bg-gray-50;
}

.form-item-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input-group__append) {
  padding: 0;
  overflow: hidden;
}

/* 表單樣式優化 */
:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-weight: 500;
  color: #1f2937;
}

:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.el-form-item__error) {
  padding-top: 4px;
  font-size: 12px;
}

/* 錯誤提示樣式 */
:deep(.error-alert-container) {
  .el-message-box__message {
    @apply !p-4;
  }
  
  .el-message-box__status {
    @apply !text-red-500;
  }
  
  .el-message-box__title {
    @apply !text-red-500 !font-bold !text-base;
  }

  .el-message-box__content {
    @apply !text-sm;
  }

  .el-message-box__container {
    @apply !w-full;
  }
}
</style>
