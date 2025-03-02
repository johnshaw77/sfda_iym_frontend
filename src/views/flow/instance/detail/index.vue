<template>
  <div>
    <!-- 頂部操作區域 -->
    <FlowInstanceHeader
      v-model="viewFlowMode"
      :show-header-content="showHeaderContent" />

    <!-- 詳情視圖 -->
    <div
      v-if="viewFlowMode === 'list'"
      class="flow-instance-detail">
      <!-- 頂部資訊卡片 -->
      <FlowInstanceInfo
        :flow-instance="flowInstance"
        :loading="loading"
        :status-options="statusOptions"
        @view-flow="viewFlowMode = 'flow'"
        @start="handleStart"
        @stop="handleStop"
        @delete="handleDelete" />

      <!-- 內容區域 -->
      <FlowInstanceTabs :flow-instance="flowInstance" />
    </div>

    <!-- 流程圖視圖 -->
    <div v-if="viewFlowMode === 'flow'">
      <FlowInstanceDiagram
        v-if="flowInstance"
        :flowInstance="flowInstance" />
    </div>
  </div>
</template>

<script setup>
import {
  getFlowInstanceById,
  startFlowInstance,
  stopFlowInstance,
  deleteFlowInstance,
} from "@/api/modules/flow";
import { useFlowStore } from "@/stores/flowStore";

import FlowInstanceHeader from "./components/FlowInstanceHeader.vue";
import FlowInstanceInfo from "./components/FlowInstanceInfo.vue";
import FlowInstanceTabs from "./components/FlowInstanceTabs.vue";
import FlowInstanceDiagram from "./components/FlowInstanceDiagram.vue";

import { useTeleportVisibility } from "@/composables/useTeleportVisibility";

const { showHeaderContent } = useTeleportVisibility();

const flowStore = useFlowStore();
const viewFlowMode = ref("list"); // 默認為列表模式

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const flowInstance = ref(null);

// 狀態選項
const statusOptions = [
  { value: "draft", label: "草稿", tagType: "info" },
  { value: "running", label: "執行中", tagType: "warning" },
  { value: "completed", label: "已完成", tagType: "success" },
  { value: "failed", label: "失敗", tagType: "danger" },
];

// 載入實例數據
const loadFlowInstance = async () => {
  try {
    loading.value = true;
    const response = await getFlowInstanceById(route.params.id);
    flowInstance.value = response.data;

    // 設置專案名稱(給面包屑)
    if (flowInstance.value) {
      flowStore.setProjectName(
        `${flowInstance.value.project.name}-- status ${flowInstance.value}`
      );
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
</style>
