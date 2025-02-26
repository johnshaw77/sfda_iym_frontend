<template>
  <BaseNode
    :id="id"
    :title="title"
    nodeType="custom-input"
    :description="description"
    :icon="icon"
    :status="status"
    :selected="selected"
    header-bg-color="#fee08b"
    @click="handleNodeClick"
    @handle-connect="handleConnect"
    @handle-disconnect="handleDisconnect"
    @run="handleRun">
    <!-- 主要內容區域 -->
    <div class="p-4 space-y-4">
      <!-- 單號選擇 -->
      <el-form-item label="客訴單號">
        <el-select
          v-model="selectedComplaint"
          placeholder="請選擇客訴單號"
          clearable
          filterable
          class="w-full"
          :loading="loading"
          @change="handleComplaintChange">
          <el-option
            v-for="item in complaintOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>

      <!-- 已選擇的單號資訊 -->
      <div
        v-if="selectedComplaint && complaintDetail"
        class="bg-gray-50 p-3 rounded text-sm">
        <div class="flex items-center justify-between text-gray-500 mb-2">
          <span>單號資訊</span>
          <el-tag
            size="small"
            type="info"
            >{{ selectedComplaint }}</el-tag
          >
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-gray-500">建立日期</span>
            <span>{{ complaintDetail.createdAt || "2024-03-22" }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500">狀態</span>
            <el-tag
              size="small"
              :type="getStatusType(complaintDetail.status)">
              {{ complaintDetail.statusText || "處理中" }}
            </el-tag>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500">產品</span>
            <span>{{ complaintDetail.product || "產品A" }}</span>
          </div>
        </div>
      </div>

      <!-- 錯誤信息展示 -->
      <div
        v-if="errorMessage"
        class="bg-red-50 p-3 rounded text-sm border border-red-200">
        <div class="flex items-center justify-between text-red-500 mb-2">
          <div class="flex items-center">
            <i class="el-icon-warning mr-1"></i>
            <span>執行錯誤</span>
          </div>
          <el-button
            type="text"
            size="small"
            @click="toggleErrorDetails">
            {{ showErrorDetails ? "隱藏詳情" : "查看詳情" }}
          </el-button>
        </div>
        <p class="text-red-600">{{ formatErrorMessage(errorMessage) }}</p>

        <!-- 錯誤詳情 -->
        <div
          v-if="showErrorDetails && errorDetails"
          class="mt-2 pt-2 border-t border-red-200">
          <div
            v-if="errorDetails.suggestion"
            class="text-orange-600 mb-2">
            {{ errorDetails.suggestion }}
          </div>

          <div
            v-if="errorDetails.retryCount"
            class="flex justify-between text-xs mb-1">
            <span class="text-gray-600">重試次數:</span>
            <span>{{ errorDetails.retryCount }}</span>
          </div>

          <div
            v-if="errorDetails.timestamp"
            class="flex justify-between text-xs mb-1">
            <span class="text-gray-600">發生時間:</span>
            <span>{{ formatTime(errorDetails.timestamp) }}</span>
          </div>

          <!-- 顯示完整錯誤信息 -->
          <div
            v-if="errorDetails.message"
            class="mt-2">
            <div class="text-xs text-gray-600 mb-1">完整錯誤信息:</div>
            <div
              class="text-xs text-red-600 p-2 bg-red-50 rounded overflow-auto max-h-24">
              {{ errorDetails.message }}
            </div>
          </div>
        </div>

        <div class="mt-2 flex justify-end space-x-2">
          <el-button
            type="danger"
            size="small"
            plain
            @click="handleClearError">
            清除錯誤
          </el-button>
          <el-button
            type="warning"
            size="small"
            @click="handleRun">
            重試執行
          </el-button>
        </div>
      </div>

      <!-- 執行歷史記錄 -->
      <div
        v-if="executionHistory.length > 0"
        class="bg-gray-50 p-3 rounded text-sm mt-3">
        <div class="flex items-center justify-between text-gray-500 mb-2">
          <span>執行歷史</span>
          <el-button
            type="text"
            size="small"
            @click="showHistory = !showHistory">
            {{ showHistory ? "隱藏" : "顯示" }}
          </el-button>
        </div>
        <div
          v-if="showHistory"
          class="space-y-2">
          <div
            v-for="(record, index) in executionHistory"
            :key="index"
            class="text-xs p-1 border-b border-gray-200">
            <div class="flex justify-between">
              <span>{{ formatTime(record.timestamp) }}</span>
              <el-tag
                size="small"
                :type="record.success ? 'success' : 'danger'">
                {{ record.success ? "成功" : "失敗" }}
              </el-tag>
            </div>
            <div
              v-if="!record.success"
              class="text-red-500 mt-1">
              {{ record.error }}
            </div>
          </div>
        </div>
      </div>

      <!-- 執行按鈕 -->
      <div class="flex justify-end space-x-2">
        <el-button
          v-if="status === 'error'"
          type="warning"
          size="small"
          :disabled="!selectedComplaint || executing"
          @click="handleRun">
          重試執行
        </el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="!selectedComplaint || executing"
          :loading="executing"
          @click="handleRun">
          {{ status === "success" ? "重新執行" : "確認選擇" }}
        </el-button>
      </div>
    </div>
  </BaseNode>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import { TextCursorInput, Box } from "lucide-vue-next";
import BaseNode from "@/components/flow-nodes/base/BaseNode.vue";
import { ElMessage } from "element-plus";
import { useFlowStore } from "@/stores/flowStore";
import { storeToRefs } from "pinia";
import { createFlowInstance } from "@/api/modules/flow";
import { useFlowInstance } from "@/composables/useFlowInstance";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "客訴單號選擇器",
  },
  description: {
    type: String,
    default: "用於選擇客訴單號進行分析",
  },
  selected: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: Object,
    default: () => Box,
  },
});

// 獲取流程實例 store
const flowStore = useFlowStore();
const { currentInstance, projectId } = storeToRefs(flowStore);

// 使用流程實例 composable
const {
  ensureFlowInstance,
  executeNode,
  clearNodeError,
  updateSharedData,
  getSharedData,
  updateGlobalVariable,
} = useFlowInstance();

// 節點狀態
const status = ref("default");
const selectedComplaint = ref(null);
const complaintDetail = ref(null);
const loading = ref(false);
const executing = ref(false);
const errorMessage = ref("");
const errorDetails = ref(null);
const executionHistory = ref([]);
const showHistory = ref(false);
const showErrorDetails = ref(false);

// 模擬的客訴單號選項
const complaintOptions = [
  { value: "CP20240322001", label: "CP20240322001 - 產品A異常" },
  { value: "CP20240322002", label: "CP20240322002 - 產品B瑕疵" },
  { value: "CP20240322003", label: "CP20240322003 - 產品C故障" },
  { value: "CP20240322004", label: "CP20240322004 - 產品D問題" },
  { value: "CP20240322005", label: "CP20240322005 - 產品E異常" },
];

// 事件處理
const emit = defineEmits(["update:data", "click", "connect", "disconnect"]);

const handleNodeClick = (event) => {
  emit("click", { id: props.id, event });
};

const handleConnect = (data) => {
  emit("connect", { id: props.id, ...data });
};

const handleDisconnect = (data) => {
  emit("disconnect", { id: props.id, ...data });
};

// 獲取狀態對應的類型
const getStatusType = (status) => {
  const statusMap = {
    pending: "warning",
    processing: "primary",
    resolved: "success",
    rejected: "danger",
    default: "info",
  };
  return statusMap[status] || statusMap.default;
};

// 處理客訴單號變更
const handleComplaintChange = async (value) => {
  if (!value) {
    complaintDetail.value = null;
    status.value = "default";
    return;
  }

  try {
    loading.value = true;
    // 模擬API調用獲取客訴單詳情
    // 實際項目中應該調用真實API
    // const response = await getComplaintDetail(value);
    // complaintDetail.value = response.data;

    // 模擬數據
    await new Promise((resolve) => setTimeout(resolve, 500));
    complaintDetail.value = {
      id: value,
      createdAt: "2024-03-22",
      status: "processing",
      statusText: "處理中",
      product: value.includes("A")
        ? "產品A"
        : value.includes("B")
        ? "產品B"
        : value.includes("C")
        ? "產品C"
        : value.includes("D")
        ? "產品D"
        : "產品E",
      description: `${value} 問題描述`,
    };

    status.value = "info";
  } catch (error) {
    ElMessage.error("獲取客訴單詳情失敗");
    console.error("獲取客訴單詳情失敗:", error);
  } finally {
    loading.value = false;
  }
};

// 切換錯誤詳情顯示
const toggleErrorDetails = () => {
  showErrorDetails.value = !showErrorDetails.value;
};

// 格式化時間
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

// 格式化錯誤信息，使其更簡潔友好
const formatErrorMessage = (message) => {
  if (!message) return "未知錯誤";

  // 如果錯誤信息包含堆棧跟踪，只顯示第一行
  if (message.includes("\n")) {
    return message.split("\n")[0];
  }

  // 如果錯誤信息太長，截斷它
  if (message.length > 100) {
    return message.substring(0, 100) + "...";
  }

  // 處理特定類型的錯誤信息
  if (message.includes("不支持的節點類型")) {
    return "節點類型不支持，請聯繫系統管理員";
  }

  return message;
};

// 實作 handleRun 方法，覆蓋 BaseNode 的空方法
const handleRun = async () => {
  console.log("ComplaintSelectorNode handleRun 被調用");

  // 防止重複點擊
  if (status.value === "running" || window._nodeRunningPromise) {
    console.log("節點正在執行中，忽略重複點擊");
    return;
  }

  try {
    // 設置狀態為運行中
    status.value = "running";
    errorMessage.value = "";
    errorDetails.value = null;

    // 檢查是否選擇了客訴單號
    if (!selectedComplaint.value) {
      throw new Error("請先選擇客訴單號");
    }

    // 準備輸入數據
    const inputData = {
      complaintId: selectedComplaint.value,
      complaintDetail: complaintDetail.value,
    };

    // 使用防抖機制執行節點
    window._nodeRunningPromise = executeNode(
      props.id,
      inputData,
      async (input) => {
        // 模擬處理過程
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 返回處理結果
        return {
          complaintId: input.complaintId,
          complaintDetail: input.complaintDetail,
          processedAt: new Date().toISOString(),
          status: "processed",
          message: `客訴單號 ${input.complaintId} 已成功處理`,
        };
      }
    );

    const result = await window._nodeRunningPromise;
    window._nodeRunningPromise = null;

    // 將選擇的客訴單號保存到共享數據和全域變數中
    await updateSharedData("selectedComplaint", {
      id: selectedComplaint.value,
      detail: complaintDetail.value,
      timestamp: new Date().toISOString(),
      nodeId: props.id,
    });

    // 設置全域變數，方便其他節點使用
    await updateGlobalVariable("complaintId", selectedComplaint.value);
    await updateGlobalVariable("complaintDetail", complaintDetail.value);

    // 更新狀態
    status.value = "success";
    ElMessage.success(`客訴單號 ${selectedComplaint.value} 處理成功`);

    return result;
  } catch (error) {
    console.error("執行節點時發生錯誤:", error);
    status.value = "error";
    errorMessage.value = error.message || "執行節點時發生未知錯誤";
    errorDetails.value = {
      message: error.message,
      stack: error.stack,
    };

    ElMessage.error(`執行失敗: ${errorMessage.value}`);
    throw error;
  }
};

// 清除錯誤
const handleClearError = async () => {
  await clearNodeError(props.id);
};

// 檢查是否有之前選擇的客訴單號
onMounted(async () => {
  // 嘗試從共享數據中獲取之前選擇的客訴單號
  const previousSelection = getSharedData("selectedComplaint");
  if (previousSelection) {
    console.log("找到之前選擇的客訴單號:", previousSelection);
    // 可以選擇是否要恢復之前的選擇
    // selectedComplaint.value = previousSelection.id;
    // complaintDetail.value = previousSelection.detail;
  }
});

// 暴露方法給父元件
defineExpose({
  handleRun,
  handleClearError,
});
</script>

<style scoped>
.complaint-selector {
  @apply w-full;
}

.complaint-selector__info {
  @apply mt-2 p-2 bg-gray-50 rounded-md text-sm;
}
</style>
