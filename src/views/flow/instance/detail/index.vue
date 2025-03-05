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
const viewFlowMode = ref("flow"); // 默認為流程模式

// 監聽視圖模式變化，確保麵包屑不會重置
watch(viewFlowMode, (newMode) => {
  console.log("視圖模式變化", newMode, "flowInstance", flowInstance.value);
  // 如果已經載入了流程實例數據，則重新設置麵包屑
  if (flowInstance.value) {
    updateBreadcrumb();
  }
});

// 更新麵包屑的輔助函數
const updateBreadcrumb = () => {
  console.log(
    "更新麵包屑",
    route.query,
    flowInstance.value,
    "當前視圖模式:",
    viewFlowMode.value
  );
  // 檢查是否從專案詳情頁進入
  if (route.query && route.query.from === "project") {
    // 從專案詳情頁進入，設置專案名稱 -> 流程實例名稱的麵包屑
    const projectName =
      (route.query && route.query.projectName) ||
      (flowInstance.value &&
        flowInstance.value.project &&
        flowInstance.value.project.name) ||
      "專案詳情";
    const instanceName =
      (route.query && route.query.instanceName) ||
      (flowInstance.value &&
        flowInstance.value.template &&
        flowInstance.value.template.name) ||
      "流程實例";
    console.log("設置麵包屑", `${projectName} / ${instanceName}`);

    // 強制設置為字符串格式，確保分隔符存在
    flowStore.setProjectName(`${projectName} / ${instanceName}`);
    flowStore.setFromProject(true);
    flowStore.setProjectId(
      (route.query && route.query.projectId) ||
        (flowInstance.value &&
          flowInstance.value.project &&
          flowInstance.value.project.id) ||
        ""
    );
  } else {
    // 從流程實例管理頁進入，保持原有的麵包屑
    const instanceName =
      (flowInstance.value &&
        flowInstance.value.template &&
        flowInstance.value.template.name) ||
      "流程實例";
    console.log("設置麵包屑", instanceName);
    flowStore.setProjectName(instanceName);
    flowStore.setFromProject(false);
  }
};

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
    console.log("載入的流程實例數據:", flowInstance.value);

    // 設置專案名稱(給面包屑)
    if (flowInstance.value) {
      // 確保無論當前視圖模式是什麼，都正確設置麵包屑
      updateBreadcrumb();

      // 強制觸發一次麵包屑更新
      nextTick(() => {
        console.log("強制更新麵包屑");
        const tempName = flowStore.projectName;
        flowStore.setProjectName("");
        setTimeout(() => {
          flowStore.setProjectName(tempName);
        }, 10);
      });
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
  console.log("組件掛載，當前視圖模式:", viewFlowMode.value);
  loadFlowInstance().then(() => {
    console.log("數據載入完成，當前視圖模式:", viewFlowMode.value);
    // 確保在數據載入完成後，無論當前視圖模式是什麼，都正確設置麵包屑
    if (flowInstance.value) {
      updateBreadcrumb();
    }
  });
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
