<template>
  <BaseNode
    :id="id"
    nodeType="http-request"
    :title="title"
    :description="description"
    :icon="icon"
    :status="status"
    :selected="selected"
    :header-bg-color="headerBgColor"
    :header-border-color="headerBorderColor"
    :handles="handles"
    :minHeight="320"
    :minWidth="480"
    @click="handleNodeClick"
    @handle-connect="handleConnect"
    @handle-disconnect="handleDisconnect"
  >
    <div class="p-4 space-y-4">
      <!-- HTTP 請求配置區域 -->
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <el-select v-model="method" class="w-24">
            <el-option label="POST" value="POST" />
            <el-option label="GET" value="GET" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
          <el-input
            v-model="endpoint"
            placeholder="請輸入請求端點"
            class="flex-1"
          />
        </div>

        <!-- 響應結果顯示區域 -->
        <div
          class="mt-4 rounded-lg overflow-hidden"
          :class="{ 'bg-gray-100': !httpResult }"
        >
          <!-- 預覽模式 -->
          <div
            v-if="!httpResult"
            class="h-32 flex items-center justify-center text-gray-400"
          >
            <div class="text-center">
              <component :is="icon" :size="24" class="mx-auto mb-2" />
              <span class="text-sm">HTTP 響應將顯示在此處</span>
            </div>
          </div>

          <!-- 響應結果顯示 -->
          <div v-else class="p-4 bg-white rounded-lg border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <el-tag
                  :type="getStatusTagType(httpResult.status)"
                  size="small"
                >
                  {{ httpResult.status }}
                </el-tag>
                <span class="text-sm text-gray-600">
                  {{ formatTimestamp(httpResult.timestamp) }}
                </span>
              </div>
              <el-button type="text" size="small" @click="handleCopyResult">
                複製
              </el-button>
            </div>
            <div class="overflow-auto max-h-48">
              <pre class="text-xs text-gray-700">{{
                formatResponse(httpResult.data)
              }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseNode>
</template>

<script setup>
import { ref, computed } from "vue";
import { Network } from "lucide-vue-next";
import BaseNode from "../base/BaseNode.vue";
import { ElMessage } from "element-plus";
import { formatTimestamp } from "@/utils/dateUtils";

// 節點基本屬性
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "HTTP 請求",
  },
  description: {
    type: String,
    default: "發送 HTTP 請求並處理響應數據",
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

// 視覺相關設定
const headerBgColor = ref("#f0f9ff"); // 淺藍色背景
const headerBorderColor = ref("#bae6fd"); // 淺藍色邊框
const icon = Network;

// 連接點配置
const handles = {
  inputs: [
    {
      id: "input",
      type: "target",
      position: "left",
    },
  ],
  outputs: [
    {
      id: "output",
      type: "source",
      position: "right",
    },
  ],
};

// 節點狀態和數據
const status = ref("idle");
const method = ref("POST");
const endpoint = ref("");
const httpResult = ref(null);

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

// 響應結果格式化
const formatResponse = (data) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return String(data);
  }
};

// 獲取狀態標籤類型
const getStatusTagType = (status) => {
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "warning";
  if (status >= 400) return "danger";
  return "info";
};

// 複製結果
const handleCopyResult = async () => {
  try {
    await navigator.clipboard.writeText(formatResponse(httpResult.value.data));
    ElMessage.success("已複製到剪貼簿");
  } catch (error) {
    ElMessage.error("複製失敗");
  }
};

// HTTP 請求處理
const processData = async (inputData) => {
  try {
    status.value = "running";

    const response = await fetch(endpoint.value, {
      method: method.value,
      headers: {
        "Content-Type": "application/json",
      },
      body: method.value !== "GET" ? JSON.stringify(inputData) : undefined,
    });

    const data = await response.json();

    httpResult.value = {
      status: response.status,
      data: data,
      timestamp: new Date().toISOString(),
    };

    status.value = "completed";
    emit("update:data", {
      id: props.id,
      data: httpResult.value,
    });
  } catch (error) {
    console.error("HTTP 請求錯誤:", error);
    status.value = "error";
    httpResult.value = {
      status: 500,
      data: { error: error.message },
      timestamp: new Date().toISOString(),
    };
    emit("update:data", {
      id: props.id,
      error: {
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
};
</script>

<style scoped>
.el-input {
  @apply w-full;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
