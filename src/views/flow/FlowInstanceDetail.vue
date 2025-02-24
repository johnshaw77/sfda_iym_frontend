<template>
  <div>
    <Teleport to="#header-actions" v-if="showHeaderContent">
      <el-button
        plain
        link
        type="primary"
        @click="viewFlowMode = !viewFlowMode"
      >
        <Workflow class="mr-1" />
        {{ viewFlowMode ? "流程" : "測試" }}
      </el-button>
    </Teleport>
    <div v-if="!viewFlowMode" class="flow-instance-detail">
      <!-- 頂部資訊卡片 -->
      <el-card class="mb-4">
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <h2 class="text-xl font-bold mb-2">
              {{ flowInstance?.template?.name }}
              <el-tag
                :type="getStatusTagType(flowInstance?.status)"
                class="ml-2"
              >
                {{ getStatusLabel(flowInstance?.status) }}
              </el-tag>
            </h2>
            <div class="text-gray-500">
              <p>專案名稱：{{ flowInstance?.project?.name }}</p>
              <p>建立者：{{ flowInstance?.creator?.username }}</p>
              <p>建立時間：{{ formatTimestamp(flowInstance?.createdAt) }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <el-button type="primary" @click="viewFlowMode = true">
              <Workflow class="mr-1" />
              流程
            </el-button>
            <el-button
              v-if="flowInstance?.status === 'draft'"
              type="primary"
              @click="handleStart"
              :loading="loading"
            >
              <Play class="mr-1" />
              啟動
            </el-button>
            <el-button
              v-if="flowInstance?.status === 'running'"
              type="danger"
              @click="handleStop"
              :loading="loading"
            >
              <StopCircle class="mr-1" />
              停止
            </el-button>
            <el-button
              v-if="flowInstance?.status === 'draft'"
              type="danger"
              @click="handleDelete"
              :loading="loading"
            >
              <Trash2 class="mr-1" />
              刪除
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 內容區域 -->
      <el-tabs v-model="activeTab" class="flow-tabs">
        <el-tab-pane label="流程圖" name="flow">
          <el-card class="flow-container">
            <VueFlow
              v-if="nodes.length > 0"
              v-model="nodes"
              v-model:edges="edges"
              :default-viewport="{ zoom: 1 }"
              :min-zoom="0.2"
              :max-zoom="4"
            >
              <template #node-custom="props">
                <BaseNode v-bind="props" />
              </template>
              <Background :gap="8" />
              <Controls />
              <MiniMap />
            </VueFlow>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="文件" name="documents">
          <el-card>
            <el-table :data="flowInstance?.documents" border stripe>
              <el-table-column prop="name" label="文件名稱" min-width="200" />
              <el-table-column prop="docType" label="類型" width="120">
                <template #default="{ row }">
                  <el-tag>{{ row.docType }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="上傳時間" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link @click="handleDownload(row)">
                    <Icon name="Download" class="mr-1" />
                    下載
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="上下文" name="context">
          <el-card>
            <vue-json-pretty
              :data="flowInstance?.context"
              :deep="2"
              :show-double-quotes="true"
              :show-length="true"
              :show-line="true"
            />
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="測試" name="logs">
          <el-card class="overflow-auto">
            <json-viewer
              :value="flowInstance"
              :expand-depth="5"
              expandIconStyle="circle"
              sort
              boxed
              :expand-on-click="true"
              class="custom-json-viewer"
            />
            {{ flowInstance }}
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
  <div v-if="viewFlowMode">
    <FlowInstanceDiagram v-if="flowInstance" :flowInstance="flowInstance" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onActivated, onDeactivated } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { formatTimestamp } from "@/utils/dateUtils";
import {
  getFlowInstanceById,
  startFlowInstance,
  stopFlowInstance,
  deleteFlowInstance,
} from "@/api/modules/flow";

import FlowInstanceDiagram from "./FlowInstanceDiagram.vue";
import BaseNode from "@/components/flow-nodes/base/BaseNode.vue";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

import JsonViewer from "vue-json-viewer";
import "vue-json-viewer/style.css";

import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import { Controls } from "@vue-flow/controls";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";

// 控制 Teleport 內容顯示
const showHeaderContent = ref(true);

// KeepAlive 生命週期鉤子
onActivated(() => {
  showHeaderContent.value = true;
});

onDeactivated(() => {
  showHeaderContent.value = false;
});

import { useFlowInstanceStore } from "@/stores/flowInstance";
const flowInstanceStore = useFlowInstanceStore();

const viewFlowMode = ref(true); // 默認為流程圖模式
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const flowInstance = ref(null);
const activeTab = ref("flow");

// 流程圖相關
const nodes = ref([]);
const edges = ref([]);

// 狀態選項
const statusOptions = [
  { value: "draft", label: "草稿", tagType: "info" },
  { value: "running", label: "執行中", tagType: "warning" },
  { value: "completed", label: "已完成", tagType: "success" },
  { value: "failed", label: "失敗", tagType: "danger" },
];

// 獲取狀態標籤類型
const getStatusTagType = (status) => {
  const option = statusOptions.find((opt) => opt.value === status);
  return option ? option.tagType : "info";
};

// 獲取狀態標籤文字
const getStatusLabel = (status) => {
  const option = statusOptions.find((opt) => opt.value === status);
  return option ? option.label : status;
};

// 載入實例數據
const loadFlowInstance = async () => {
  try {
    loading.value = true;
    const response = await getFlowInstanceById(route.params.id);
    flowInstance.value = response.data;

    // 設置流程圖數據
    if (flowInstance.value) {
      nodes.value = flowInstance.value.template.nodes;
      edges.value = flowInstance.value.template.edges;

      // 設置專案名稱(給面包屑)
      flowInstanceStore.setProjectName(flowInstance.value.project.name);
    }
  } catch (error) {
    console.error("載入數據失敗:", error);
    ElMessage.error("載入數據失敗");
  } finally {
    loading.value = false;
  }
};

// 啟動流程實例
const handleStart = async () => {
  try {
    await ElMessageBox.confirm("確定要啟動該流程實例嗎？", "提示", {
      type: "warning",
    });

    loading.value = true;
    await startFlowInstance(flowInstance.value.id);
    ElMessage.success("啟動成功");
    loadFlowInstance();
  } catch (error) {
    if (error !== "cancel") {
      console.error("啟動失敗:", error);
      ElMessage.error("啟動失敗");
    }
  } finally {
    loading.value = false;
  }
};

// 停止流程實例
const handleStop = async () => {
  try {
    await ElMessageBox.confirm("確定要停止該流程實例嗎？", "提示", {
      type: "warning",
    });

    loading.value = true;
    await stopFlowInstance(flowInstance.value.id);
    ElMessage.success("停止成功");
    loadFlowInstance();
  } catch (error) {
    if (error !== "cancel") {
      console.error("停止失敗:", error);
      ElMessage.error("停止失敗");
    }
  } finally {
    loading.value = false;
  }
};

// 刪除流程實例
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      "確定要刪除該流程實例嗎？此操作不可恢復！",
      "警告",
      {
        type: "error",
      }
    );

    loading.value = true;
    await deleteFlowInstance(flowInstance.value.id);
    ElMessage.success("刪除成功");
    router.push("/flow-instances");
  } catch (error) {
    if (error !== "cancel") {
      console.error("刪除失敗:", error);
      ElMessage.error("刪除失敗");
    }
  } finally {
    loading.value = false;
  }
};

// 下載文件
const handleDownload = (document) => {
  window.open(document.url, "_blank");
};

onMounted(() => {
  loadFlowInstance();
});
</script>

<style scoped>
.flow-instance-detail {
  padding: 20px;
}

.flow-container {
  height: 600px;
}

.flow-tabs :deep(.el-tabs__content) {
  padding: 20px 0;
}

:deep(.vue-flow__minimap) {
  transform: scale(0.75);
  transform-origin: bottom right;
}
</style>
