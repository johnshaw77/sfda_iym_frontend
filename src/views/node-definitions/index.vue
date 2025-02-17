<template>
  <div class="h-full flex">
    <!-- 左側：節點定義列表 -->
    <div class="w-64 bg-white border-r border-gray-200 flex flex-col">
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
      <div class="p-2.5 bg-slate-50 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">節點配置</h3>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <el-form label-position="top">
          <!-- 基本資訊 -->
          <el-form-item label="節點定義鍵值" required>
            <el-input
              v-model="activeNode.typeKey"
              placeholder="請輸入唯一的節點定義鍵值（5-15字元）"
              @input="handleNodeDefinitionKeyInput"
              minlength="5"
              maxlength="15"
            >
              <template #append>
                <el-tooltip
                  content="此鍵值必須是唯一的，長度為5-15字元，僅允許英文字母、數字和連字符號"
                  placement="top"
                >
                  <span class="px-2">?</span>
                </el-tooltip>
              </template>
            </el-input>
            <span class="text-xs text-gray-500 mt-1"
              >僅允許英文字母、數字和連字符號，長度為5-15字元，會自動轉換為小寫</span
            >
          </el-form-item>
          <el-form-item label="節點名稱" required>
            <el-input v-model="activeNode.name" />
          </el-form-item>
          <el-form-item label="分類">
            <el-select v-model="activeNode.category" class="w-full">
              <el-option
                v-for="category in nodeCategories"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              v-model="activeNode.description"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item label="Vue組件名稱">
            <el-input
              v-model="activeNode.componentName"
              placeholder="如果有預先寫好的組件，請填入組件名稱"
            />
            <span class="text-xs text-gray-500 mt-1"
              >可以同時使用 Vue 組件和 API 端點</span
            >
          </el-form-item>
          <el-form-item label="API 路由">
            <el-input
              v-model="activeNode.apiEndpoint"
              placeholder="請輸入 FastAPI 的路由名"
            >
              <template #append>
                <el-select v-model="activeNode.apiMethod" style="width: 100px">
                  <el-option label="POST" value="POST" />
                  <el-option label="GET" value="GET" />
                  <el-option label="PUT" value="PUT" />
                  <el-option label="DELETE" value="DELETE" />
                </el-select>
              </template>
            </el-input>
            <span class="text-xs text-gray-500 mt-1"
              >FastAPI 的路由名稱<a
                href="http://localhost:8000/docs"
                target="_blank"
                class="text-blue-500 hover:text-blue-600 hover:underline"
                >查看</a
              >，例如：/statistical/analysis</span
            >
          </el-form-item>

          <!-- 外觀設定 -->
          <el-divider>外觀設定</el-divider>
          <div class="flex items-center space-x-4">
            <el-form-item label="背景顏色" class="flex-1">
              <el-color-picker
                v-model="activeNode.ui_config.style.backgroundColor"
                :predefine="predefineColors"
                show-alpha
              />
            </el-form-item>
            <el-form-item label="邊框顏色" class="flex-1">
              <el-color-picker
                v-model="activeNode.ui_config.style.borderColor"
                :predefine="predefineColors"
                show-alpha
              />
            </el-form-item>
          </div>

          <!-- 驗證規則 -->
          <el-divider>驗證規則</el-divider>
          <el-form-item label="必填">
            <el-switch v-model="activeNode.validation_rules.required" />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 新增/編輯節點對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯節點定義' : '新增節點定義'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="類型鍵值" prop="typeKey">
          <el-input
            v-model="form.typeKey"
            placeholder="請輸入唯一的節點定義鍵值（5-15字元）"
            @input="(value) => handleNodeDefinitionKeyInput(value, form)"
            minlength="5"
            maxlength="15"
          />
          <span class="text-xs text-gray-500 mt-1"
            >僅允許英文字母、數字和連字符號，長度為5-15字元，會自動轉換為小寫</span
          >
        </el-form-item>
        <el-form-item label="節點名稱" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分類" prop="category">
          <el-select v-model="form.category" class="w-full">
            <el-option
              v-for="category in nodeCategories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
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
} from "lucide-vue-next";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getNodeDefinitions,
  createNodeDefinition,
  updateNodeDefinition,
  deleteNodeDefinition,
} from "@/api";

// 節點定義配置（未來會從後端 API 獲取）
const nodeDefinitionsConfig = {
  categories: [
    {
      id: "business-input",
      label: "業務輸入節點",
      icon: FileInput,
      nodes: [
        {
          id: "1",
          typeKey: "complaint-selector",
          name: "客訴單號選擇器",
          icon: Component,
          description: "用於選擇客訴單號",
          version: "1.0.0",
          componentName: "ComplaintSelector",
          config: {},
          ui_config: {
            style: {
              backgroundColor: "#ffffff",
              borderColor: "#64748b",
            },
          },
          validation_rules: {
            required: true,
          },
          handles: {
            inputs: [],
            outputs: ["data"],
          },
        },
        {
          id: "2",
          typeKey: "defect-item-selector",
          name: "不良品項選擇器",
          icon: TextCursorInput,
          description: "用於選擇不良品項",
          version: "1.0.0",
          componentName: "DefectItemSelector",
          config: {},
          ui_config: {
            style: {
              backgroundColor: "#ffffff",
              borderColor: "#64748b",
            },
          },
          validation_rules: {
            required: true,
          },
          handles: {
            inputs: [],
            outputs: ["data"],
          },
        },
      ],
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
      nodes: [
        {
          id: "5",
          typeKey: "shared-statistics",
          name: "共用統計組件",
          icon: Component,
          description: "進行基礎統計分析，必須定義apiEndpoint",
          version: "1.0.0",
          componentName: "",
          apiEndpoint: "/statistical/basic-statistics",
          apiMethod: "POST",
          config: {},
          ui_config: {
            style: {
              backgroundColor: "#ffffff",
              borderColor: "#64748b",
            },
          },
          validation_rules: {
            required: true,
          },
          handles: {
            inputs: ["data"],
            outputs: ["result"],
          },
        },
        {
          id: "3",
          typeKey: "hypothesis-test",
          name: "假設檢定",
          icon: Calculator,
          description: "進行統計假設檢定分析",
          version: "1.0.0",
          componentName: "",
          apiEndpoint: "/statistical/hypothesis-test",
          apiMethod: "POST",
          config: {},
          ui_config: {
            style: {
              backgroundColor: "#ffffff",
              borderColor: "#64748b",
            },
          },
          validation_rules: {
            required: true,
          },
          handles: {
            inputs: ["data"],
            outputs: ["result"],
          },
        },
        {
          id: "4",
          typeKey: "correlation-analysis",
          name: "相關性分析",
          icon: BarChart,
          description: "進行變數間的相關性分析",
          version: "1.0.0",
          componentName: "",
          apiEndpoint: "/statistical/correlation",
          apiMethod: "POST",
          config: {},
          ui_config: {
            style: {
              backgroundColor: "#ffffff",
              borderColor: "#64748b",
            },
          },
          validation_rules: {
            required: true,
          },
          handles: {
            inputs: ["data"],
            outputs: ["result"],
          },
        },
        {
          id: "6",
          typeKey: "chi-square-analysis",
          name: "卡方圖分析",
          icon: Component,
          description:
            "卡方圖分析（Chi-Square Analysis）是一種統計方法，用於檢驗分類資料之間的相關性或獨立性。它通常應用於檢驗兩個或多個變數之間是否存在顯著的關聯，或者檢查觀察值與期望值之間的差異是否由隨機性所引起。",
          version: "1.0.0",
          componentName: "",
          apiEndpoint: "/statistical/chi-square",
          apiMethod: "POST",
          config: {},
          ui_config: {
            style: {
              backgroundColor: "#ffffff",
              borderColor: "#64748b",
            },
          },
          validation_rules: {
            required: true,
          },
          handles: {
            inputs: ["data"],
            outputs: ["result"],
          },
        },
      ],
    },
  ],
};

// 從配置中提取分類選項
const nodeCategories = computed(() =>
  nodeDefinitionsConfig.categories.map(({ id, label, icon }) => ({
    value: id,
    label,
    icon,
  }))
);

// 按分類過濾節點
const businessInputNodes = computed(
  () =>
    nodeDefinitionsConfig.categories
      .find((cat) => cat.id === "business-input")
      ?.nodes.map((node) => ({ ...node, category: "business-input" })) || []
);

const businessProcessNodes = computed(
  () =>
    nodeDefinitionsConfig.categories
      .find((cat) => cat.id === "business-process")
      ?.nodes.map((node) => ({ ...node, category: "business-process" })) || []
);

const statisticalAnalysisNodes = computed(
  () =>
    nodeDefinitionsConfig.categories
      .find((cat) => cat.id === "statistical-analysis")
      ?.nodes.map((node) => ({ ...node, category: "statistical-analysis" })) ||
    []
);

// 狀態
const searchQuery = ref("");
const activeNode = ref(null);
const dialogVisible = ref(false);
const isEdit = ref(false);
const elements = ref([]);

// 表單
const form = ref({
  name: "",
  category: "",
  description: "",
  typeKey: "",
});

// 使用 useVueFlow hook
const { fitView } = useVueFlow();

// 載入節點定義列表
const loadNodeDefinitions = async () => {
  try {
    const response = await getNodeDefinitions();
    // 將 API 返回的數據轉換為前端需要的格式
    const nodeDefinitions = response.data;

    // 更新 nodeDefinitionsConfig
    nodeDefinitionsConfig.categories = nodeDefinitionsConfig.categories.map(
      (category) => ({
        ...category,
        nodes: nodeDefinitions
          .filter((node) => node.category === category.id)
          .map((node) => ({
            id: node.id.toString(),
            typeKey: node.type_key,
            name: node.name,
            icon: getNodeIcon(node.category, node.type_key),
            description: node.description,
            version: node.version,
            componentName: node.component_name,
            apiEndpoint: node.api_endpoint,
            apiMethod: node.api_method,
            config: {},
            ui_config: node.ui_config,
            validation_rules: node.validation_rules,
            handles: node.handles,
          })),
      })
    );
  } catch (error) {
    console.error("載入節點定義失敗:", error);
    ElMessage.error("載入節點定義失敗");
  }
};

// 根據節點定義獲取對應的圖標
const getNodeIcon = (category, typeKey) => {
  switch (category) {
    case "business-input":
      return TextCursorInput;
    case "business-process":
      return Filter;
    case "statistical-analysis":
      switch (typeKey) {
        case "hypothesis-test":
          return Calculator;
        case "correlation-analysis":
          return BarChart;
        default:
          return Component;
      }
    default:
      return Component;
  }
};

// 處理節點選擇
const handleSelectNode = (node) => {
  activeNode.value = { ...node };
  // 更新預覽
  updatePreview();
};

// 更新預覽
const updatePreview = () => {
  console.log(
    "activeNode.value updatePreview",
    activeNode.value.name,
    activeNode.value.ui_config.style
  );
  if (!activeNode.value) {
    elements.value = [];
    return;
  }

  // 創建預覽節點
  elements.value = [
    {
      id: "preview",
      type: activeNode.value.category,
      position: { x: 100, y: 100 },
      data: {
        label: activeNode.value.name,
        ...activeNode.value.config,
      },
      style: activeNode.value.ui_config.style,
    },
  ];

  console.log("elements", elements.value);
  // 使用 setTimeout 確保節點已經渲染完成
  setTimeout(() => {
    fitView({ padding: 0.2 });
  }, 100);
};

// 處理新增節點
const handleCreateNode = () => {
  isEdit.value = false;
  form.value = {
    name: "",
    category: "",
    description: "",
    typeKey: "",
  };
  dialogVisible.value = true;
};

// 處理表單提交
const handleSubmit = async () => {
  try {
    const data = {
      type_key: form.value.typeKey,
      name: form.value.name,
      category: form.value.category,
      description: form.value.description,
      version: "1.0.0",
      component_name: "",
      ui_config: {
        style: {
          backgroundColor: "#ffffff",
          borderColor: "#64748b",
        },
      },
      validation_rules: {
        required: false,
      },
      handles: {
        inputs: [],
        outputs: [],
      },
    };

    if (isEdit.value) {
      await updateNodeDefinition(form.value.typeKey, data);
      ElMessage.success("節點定義更新成功");
    } else {
      await createNodeDefinition(data);
      ElMessage.success("節點定義創建成功");
    }

    dialogVisible.value = false;
    loadNodeDefinitions(); // 重新載入列表
  } catch (error) {
    console.error("提交失敗:", error);
    ElMessage.error(error.response?.data?.message || "操作失敗");
  }
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

    await deleteNodeDefinition(activeNode.value.typeKey);
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
const handleNodeDefinitionKeyInput = (value) => {
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
  activeNode.value.typeKey = processed;
};

// 更新表單配置，添加必填驗證
const rules = {
  name: [{ required: true, message: "請輸入節點名稱", trigger: "blur" }],
  typeKey: [
    { required: true, message: "請輸入節點定義鍵值", trigger: "blur" },
    {
      pattern: /^[a-z0-9-]+$/,
      message: "僅允許小寫英文字母、數字和連字符號",
      trigger: "blur",
    },
    { min: 5, max: 15, message: "長度必須在5到15個字元之間", trigger: "blur" },
  ],
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
</style>
