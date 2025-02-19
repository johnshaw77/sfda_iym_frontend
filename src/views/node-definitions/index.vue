<template>
  <div class="h-full flex">
    <!-- 左側：節點定義列表 -->
    <div class="w-60 bg-white border-r border-gray-200 flex flex-col">
      <!-- 頂部操作區 -->
      <div class="p-2.5 bg-slate-50 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">節點定義</h2>
          <el-button type="primary" size="small" @click="handleCreateNode">
            <Plus class="mr-1" :size="14" />
            新增
          </el-button>
        </div>
        <el-input
          v-model="searchQuery"
          placeholder="搜尋節點定義"
          clearable
          class="!w-full"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- Teleport 警告提示 -->
      <Teleport to="#header-actions">
        <div class="flex items-center">
          <el-alert
            title="每個節點必須有預先寫好的相對應的 VUE 組件"
            type="warning"
            :closable="false"
            class="!mb-0 !mr-0"
            show-icon
          />
        </div>
      </Teleport>

      <!-- 節點定義列表 -->
      <div class="flex-1 overflow-y-auto">
        <el-menu
          :default-active="activeNode?.id"
          :default-openeds="[
            'business-input',
            'business-process',
            'statistical-analysis',
          ]"
          class="!h-full !border-0"
          style="width: 100% !important"
          :collapse="false"
        >
          <!-- 業務輸入節點 -->
          <el-sub-menu index="business-input">
            <template #title>
              <div class="w-full flex items-center">
                <FileInput :size="16" class="mr-2 flex-shrink-0" />
                <span class="text-sm">業務輸入節點</span>
              </div>
            </template>
            <el-menu-item
              v-for="node in businessInputNodes"
              :key="node.id"
              :index="node.id"
              @click="handleSelectNode(node)"
            >
              <div class="w-full flex items-center">
                <component
                  :is="node.icon"
                  :size="16"
                  class="mr-2 flex-shrink-0"
                />
                <span class="flex-1">{{ node.name }}</span>
              </div>
            </el-menu-item>
          </el-sub-menu>

          <!-- 業務處理節點 -->
          <el-sub-menu index="business-process">
            <template #title>
              <div class="w-full flex items-center">
                <Filter :size="16" class="mr-2 flex-shrink-0" />
                <span class="text-sm">業務處理節點</span>
              </div>
            </template>
            <el-menu-item
              v-for="node in businessProcessNodes"
              :key="node.id"
              :index="node.id"
              @click="handleSelectNode(node)"
            >
              <div class="w-full flex items-center">
                <component
                  :is="node.icon"
                  :size="16"
                  class="mr-2 flex-shrink-0"
                />
                <span class="flex-1">{{ node.name }}</span>
              </div>
            </el-menu-item>
          </el-sub-menu>

          <!-- 統計分析節點 -->
          <el-sub-menu index="statistical-analysis">
            <template #title>
              <div class="w-full flex items-center">
                <BarChart :size="16" class="mr-2 flex-shrink-0" />
                <span class="text-sm">統計分析節點</span>
              </div>
            </template>
            <el-menu-item
              v-for="node in statisticalAnalysisNodes"
              :key="node.id"
              :index="node.id"
              @click="handleSelectNode(node)"
            >
              <div class="w-full flex items-center">
                <component
                  :is="node.icon"
                  :size="16"
                  class="mr-2 flex-shrink-0"
                />
                <span class="flex-1">{{ node.name }}</span>
              </div>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
    </div>

    <!-- 中間：節點設計區 -->
    <div class="flex-1 bg-gray-50 flex flex-col">
      <!-- 工具列 -->
      <div
        class="h-12 p-2.5 bg-slate-50 border-b border-gray-200 flex items-center px-2.5"
      >
        <div class="flex-1">
          <span class="text-lg font-medium text-gray-900">
            {{ activeNode?.name || "請選擇節點" }}
          </span>
        </div>
        <div class="space-x-2">
          <el-button-group>
            <el-tooltip content="儲存">
              <el-button :icon="Save" :disabled="!activeNode" />
            </el-tooltip>
            <el-tooltip content="測試">
              <el-button :icon="Play" :disabled="!activeNode" />
            </el-tooltip>
            <el-tooltip content="顯示 JSON">
              <el-button
                :icon="Braces"
                :disabled="!activeNode"
                @click="handleShowJson"
              />
            </el-tooltip>
            <el-tooltip content="刪除">
              <el-button
                :icon="Trash2"
                type="danger"
                :disabled="!activeNode"
                @click="handleDeleteNode"
              />
            </el-tooltip>
          </el-button-group>
        </div>
      </div>

      <!-- 預覽區域 -->
      <div v-if="activeNode" class="flex-1 p-1">
        <VueFlow
          v-model="elements"
          class="h-full vue-flow-node-preview"
          :nodes-draggable="false"
          :nodes-deletable="false"
          :nodes-connectable="false"
          :edges-deletable="false"
          :edges-updatable="false"
          :edges-connectable="false"
          :pane-moveable="true"
          :zoom-on-scroll="true"
          :min-zoom="0.5"
          :max-zoom="2"
        >
          <Background />
          <Controls />
        </VueFlow>
      </div>
      <div v-else class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center flex flex-col items-center justify-center">
          <Component :size="48" class="mb-2" />
          <p class="text-sm">請選擇或新增節點定義</p>
        </div>
      </div>
    </div>

    <!-- 右側：屬性配置面板 -->
    <div
      v-if="activeNode"
      class="w-80 bg-white border-l border-gray-200 flex flex-col"
    >
      <div
        class="p-2.5 bg-slate-50 border-b border-gray-200 flex items-center justify-between"
      >
        <h3 class="text-lg font-medium text-gray-900">節點配置</h3>
        <div class="space-x-2">
          <el-button-group>
            <el-tooltip content="儲存">
              <el-button
                :icon="Save"
                :loading="submitting"
                @click="handleSave"
              />
            </el-tooltip>
          </el-button-group>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <el-form
          ref="formRef"
          :model="activeNode"
          :rules="formRules"
          label-position="top"
          @submit.prevent
        >
          <!-- 基本資訊 -->
          <el-form-item label="節點定義鍵值" prop="definitionKey">
            <el-input
              v-model="activeNode.definitionKey"
              placeholder="請輸入節點定義鍵值（5-15字元）"
              @input="handleDefinitionKeyInput"
              @keydown="handleDefinitionKeyKeydown"
            >
              <template #append>
                <el-tooltip
                  content="此鍵值必須是唯一的，長度為5-15字元，僅允許小寫英文字母、數字和連字符號"
                  placement="top"
                >
                  <span class="px-2">?</span>
                </el-tooltip>
              </template>
            </el-input>
            <!-- <div class="form-item-tip">
              僅允許小寫英文字母、數字和連字符號，長度為5-15字元，會自動轉換格式
            </div> -->
          </el-form-item>

          <!-- 分類和節點類型放在同一行 -->
          <div class="flex items-start space-x-4">
            <el-form-item label="分類" prop="category" class="flex-1">
              <el-select
                v-model="activeNode.category"
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
            <el-form-item label="類型" prop="nodeType" class="flex-1">
              <div class="flex items-center">
                <el-select
                  v-model="activeNode.nodeType"
                  class="w-[160px]"
                  placeholder="請選擇節點類型"
                >
                  <el-option
                    v-for="type in nodeTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
                <el-tooltip
                  content="custom-input：需要 Vue 組件<br />custom-process：可以是組件或 API<br />statistic-process：統計分析專用"
                  placement="top"
                  raw-content
                >
                  <el-icon class="ml-2 text-gray-400">
                    <CircleHelp :size="16" />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item>
          </div>

          <el-form-item label="節點名稱" prop="name">
            <el-input
              v-model="activeNode.name"
              placeholder="請輸入節點名稱（2-50字元）"
              @input="handleNameInput"
            />
          </el-form-item>

          <el-form-item label="描述" prop="description">
            <el-input
              v-model="activeNode.description"
              type="textarea"
              :rows="3"
              placeholder="請輸入節點描述（2-200字元）"
            />
          </el-form-item>

          <el-form-item
            label="Vue組件名稱"
            prop="componentName"
            v-if="activeNode.nodeType === 'custom-input'"
          >
            <el-input
              v-model="activeNode.componentName"
              placeholder="請輸入Vue組件名稱"
            />
            <div class="form-item-tip">custom-input 類型必須指定 Vue 組件</div>
          </el-form-item>

          <el-form-item
            label="API設定"
            prop="apiEndpoint"
            v-if="
              ['custom-process', 'statistic-process'].includes(
                activeNode.nodeType
              )
            "
          >
            <el-input
              v-model="activeNode.apiEndpoint"
              placeholder="請輸入API端點，以 / 開頭"
            >
              <template #append>
                <el-select
                  v-model="activeNode.apiMethod"
                  style="width: 100px"
                  placeholder="方法"
                >
                  <el-option label="GET" value="GET" />
                  <el-option label="POST" value="POST" />
                  <el-option label="PUT" value="PUT" />
                  <el-option label="DELETE" value="DELETE" />
                </el-select>
              </template>
            </el-input>
            <div class="form-item-tip">
              FastAPI 的路由名稱
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                class="text-blue-500 hover:text-blue-600 hover:underline"
                >查看</a
              >
              ，例如：/statistical/analysis
            </div>
          </el-form-item>

          <!-- 外觀設定 -->
          <el-divider>外觀設定</el-divider>
          <div class="flex items-center space-x-4">
            <el-form-item label="背景顏色" class="flex-1">
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="color in predefineColors"
                  :key="color"
                  class="w-4 h-4 rounded cursor-pointer border border-gray-200 transition-all hover:scale-110"
                  :class="{
                    'ring-2 ring-blue-500 ring-offset-2':
                      activeNode.uiConfig.style.backgroundColor === color,
                  }"
                  :style="{ backgroundColor: color }"
                  @click="activeNode.uiConfig.style.backgroundColor = color"
                />
              </div>
            </el-form-item>
            <el-form-item label="邊框顏色" class="flex-1">
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="color in predefineColors"
                  :key="color"
                  class="w-4 h-4 rounded cursor-pointer border border-gray-200 transition-all hover:scale-110"
                  :class="{
                    'ring-2 ring-blue-500 ring-offset-2':
                      activeNode.uiConfig.style.borderColor === color,
                  }"
                  :style="{ backgroundColor: color }"
                  @click="activeNode.uiConfig.style.borderColor = color"
                />
              </div>
            </el-form-item>
          </div>

          <!-- 驗證規則 -->
          <el-divider>驗證規則</el-divider>
          <el-form-item label="必填">
            <el-switch
              :model-value="activeNode.validation?.required ?? false"
              @update:model-value="handleValidationChange"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- JSON 預覽對話框 -->
    <el-dialog
      v-model="jsonDialogVisible"
      title="節點 JSON 預覽"
      width="50%"
      destroy-on-close
    >
      <div class="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[60vh]">
        <json-viewer :value="activeNode" :expand-depth="5" copyable sort />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import JsonViewer from "vue-json-viewer";
import {
  Component,
  Search,
  Plus,
  Save,
  Play,
  Trash2,
  FileInput,
  Database,
  Filter,
  Calculator,
  BarChart,
  FileOutput,
  Table,
  TextCursorInput,
  Braces,
  CircleHelp,
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

// 改為使用 ref 來儲存從後端載入的配置
const nodeDefinitionsConfig = ref({
  categories: [
    {
      id: "business-input",
      label: "業務輸入節點",
      icon: FileInput,
      nodes: [],
    },
    {
      id: "business-process",
      label: "業務處理節點",
      icon: Filter,
      nodes: [],
    },
    {
      id: "statistical-analysis",
      label: "統計分析節點",
      icon: BarChart,
      nodes: [],
    },
  ],
});

// 從配置中提取分類選項
const nodeCategories = computed(() =>
  nodeDefinitionsConfig.value.categories.map(({ id, label, icon }) => ({
    value: id,
    label,
    icon,
  }))
);

// 按分類過濾節點 (TODO: 未來會從後端 API 獲取)
const businessInputNodes = computed(
  () =>
    nodeDefinitionsConfig.value.categories
      .find((cat) => cat.id === "business-input")
      ?.nodes.map((node) => ({ ...node, category: "business-input" })) || []
);

const businessProcessNodes = computed(
  () =>
    nodeDefinitionsConfig.value.categories
      .find((cat) => cat.id === "business-process")
      ?.nodes.map((node) => ({ ...node, category: "business-process" })) || []
);

const statisticalAnalysisNodes = computed(
  () =>
    nodeDefinitionsConfig.value.categories
      .find((cat) => cat.id === "statistical-analysis")
      ?.nodes.map((node) => ({ ...node, category: "statistical-analysis" })) ||
    []
);

// 狀態
const searchQuery = ref("");
const activeNode = ref(null);
const submitting = ref(false);
const formRef = ref(null);
const dialogVisible = ref(false);
const isEdit = ref(false);
const elements = ref([]);

// 表單
const form = ref(createDefaultNode());

// 使用 useVueFlow hook
const { fitView } = useVueFlow();

// JSON 對話框控制
const jsonDialogVisible = ref(false);

// 節點類型選項
const nodeTypes = [
  {
    value: "custom-input",
    label: "自定義輸入節點",
  },
  {
    value: "custom-process",
    label: "自定義處理節點",
  },
  {
    value: "statistic-process",
    label: "統計分析節點",
  },
];

// 表單驗證規則
const formRules = nodeDefinitionValidators;

// 載入節點定義列表
const loadNodeDefinitions = async () => {
  try {
    const response = await getNodeDefinitions();
    const nodeDefinitions = response.data;

    // 更新 nodeDefinitionsConfig
    nodeDefinitionsConfig.value.categories =
      nodeDefinitionsConfig.value.categories.map((category) => ({
        ...category,
        nodes: nodeDefinitions
          .filter((node) => node.category === category.id)
          .map((node) => ({
            id: node.id.toString(),
            definitionKey: node.definitionKey,
            nodeType: node.nodeType,
            name: node.name,
            icon: getNodeIcon(node.category, node.definitionKey),
            description: node.description,
            componentName: node.componentName,
            apiEndpoint: node.apiEndpoint,
            apiMethod: node.apiMethod || "POST",
            ...processNodeData(node),
          })),
      }));
  } catch (error) {
    console.error("載入節點定義失敗:", error);
    ElMessage.error("載入節點定義失敗");
  }
};

// 處理節點選擇
const handleSelectNode = (node) => {
  activeNode.value = processNodeData(node);
  updatePreview();
};

// 更新預覽
const updatePreview = () => {
  if (!activeNode.value) {
    elements.value = [];
    return;
  }

  elements.value = [
    {
      id: "preview",
      type: activeNode.value.nodeType,
      position: { x: 100, y: 100 },
      data: {
        label: activeNode.value.name,
        ...activeNode.value.config,
      },
      style: activeNode.value.uiConfig?.style || DEFAULT_UI_CONFIG.style,
    },
  ];

  // 使用 setTimeout 確保節點已經渲染完成
  setTimeout(() => {
    fitView({ padding: 0.2 });
  }, 100);
};

// 處理新增節點
const handleCreateNode = () => {
  activeNode.value = createDefaultNode();
  updatePreview();
};

// 處理刪除節點
const handleDeleteNode = async () => {
  if (!activeNode.value) return;

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

    await deleteNodeDefinition(activeNode.value.definitionKey);
    ElMessage.success("節點定義刪除成功");
    activeNode.value = null;
    loadNodeDefinitions(); // 重新載入列表
  } catch (error) {
    if (error !== "cancel") {
      console.error("刪除失敗:", error);
      ElMessage.error("刪除失敗");
    }
  }
};

// 在組件掛載時載入數據
onMounted(() => {
  loadNodeDefinitions();
});

// 預設顏色配置
const predefineColors = [
  "#409EFF", // 主要藍色
  "#67C23A", // 成功綠色
  "#E6A23C", // 警告黃色
  "#F56C6C", // 危險紅色
  "#909399", // 信息灰色
  "#8B5CF6", // 紫色
  "#2DD4BF", // 青色
  "#FB923C", // 橙色
  "#EC4899", // 粉色
  "#64748B", // 石板灰
];

// 處理節點定義鍵值輸入
const handleDefinitionKeyInput = (value) => {
  if (!value) return;

  // 移除非英文字母、數字的字符，將空格轉換為連字符，並轉為小寫
  let processed = value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-"); // 將多個連字符轉換為單個

  // 限制長度在 5-15 之間
  if (processed.length > 15) {
    processed = processed.slice(0, 15);
  }

  // 更新值
  activeNode.value.definitionKey = processed;
};

// 處理節點定義鍵值按鍵
const handleDefinitionKeyKeydown = (event) => {
  if (!isValidDefinitionKeyInput(event)) {
    event.preventDefault();
  }
};

// 處理顯示 JSON
const handleShowJson = () => {
  jsonDialogVisible.value = true;
};

// 添加 handleValidationChange 函數
const handleValidationChange = (value) => {
  if (!activeNode.value) return;

  // 確保 validation 對象存在
  if (!activeNode.value.validation) {
    activeNode.value.validation = {};
  }

  activeNode.value.validation.required = value;
};

// 處理儲存
const handleSave = async () => {
  if (!formRef.value || !activeNode.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning("請檢查並修正表單中的錯誤");
      return;
    }

    submitting.value = true;
    try {
      const data = prepareNodeDataForSave(activeNode.value);
      const isNew = activeNode.value.id.startsWith("temp-");

      if (isNew) {
        await createNodeDefinition(data);
        ElMessage.success("節點定義創建成功");
      } else {
        await updateNodeDefinition(activeNode.value.definitionKey, data);
        ElMessage.success("節點定義更新成功");
      }

      await loadNodeDefinitions();
      if (isNew) {
        activeNode.value = null;
      }
    } catch (error) {
      console.error("儲存失敗:", error);
      ElMessage.error(error.response?.data?.message || "儲存失敗");
    } finally {
      submitting.value = false;
    }
  });
};

// 在 script setup 部分添加處理函數
const handleNameInput = (value) => {
  if (!activeNode.value) return;

  // 更新預覽
  updatePreview();
};
</script>

<style>
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
</style>
