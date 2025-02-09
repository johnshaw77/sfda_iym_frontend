<template>
  <div class="workflow-container">
    <!-- 工作流程畫布區域 -->
    <div class="workflow-canvas">
      <WorkflowCanvas />
    </div>

    <!-- 右側面板 -->
    <div class="workflow-panel">
      <el-tabs tab-position="top">
        <!-- 檔案上傳面板 -->
        <el-tab-pane class="flex-1 overflow-hidden">
          <template #label>
            <div class="flex items-center">
              <FileText :size="16" class="mr-1" />
              檔案
            </div>
          </template>

          <div class="h-full overflow-y-auto p-4">
            <FileUpload
              :workflowId="currentWorkflowId"
              :multiple="true"
              accept=".pdf,.jpg,.png,.xlsx,.csv"
              @file-uploaded="handleFileUploaded"
              @file-deleted="handleFileDeleted"
            />
          </div>
        </el-tab-pane>

        <!-- 節點配置面板 -->
        <el-tab-pane class="flex-1 overflow-hidden">
          <template #label>
            <div class="flex items-center">
              <Settings :size="16" class="mr-1" />
              設定
            </div>
          </template>
          <div class="h-full overflow-y-auto p-4">
            <NodeConfigPanel />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { FileText, Settings } from "lucide-vue-next";
import WorkflowCanvas from "./components/WorkflowCanvas.vue";
import NodeConfigPanel from "./components/NodeConfigPanel.vue";
import FileUpload from "@/components/FileUpload.vue";

// 當前工作流程 ID（這裡先用模擬數據）
const currentWorkflowId = ref("workflow-001");

// 處理檔案上傳成功
const handleFileUploaded = (file) => {
  console.log("檔案上傳成功：", file);
};

// 處理檔案刪除
const handleFileDeleted = (file) => {
  console.log("檔案已刪除：", file);
};
</script>

<style scoped>
.workflow-container {
  @apply h-full flex;
  height: calc(100vh - 5.5rem); /* 減去頂部導航欄和頁面標題的高度 */
}

.workflow-canvas {
  @apply flex-1 bg-gray-100 p-1;
  height: 100%;
}

.workflow-panel {
  @apply w-80 border-l bg-white flex flex-col;
  height: 100%;
}

:deep(.el-tabs) {
  @apply flex flex-col;
  height: 100%;
}

:deep(.el-tabs__header) {
  @apply m-0 border-b border-gray-200;
}

:deep(.el-tabs__nav-wrap) {
  @apply p-0;
}

:deep(.el-tabs__nav) {
  @apply w-full;
}

:deep(.el-tabs__item) {
  @apply flex-1 text-center !px-4 !h-10 flex items-center justify-center;
  font-size: 0.875rem;
}

:deep(.el-tabs__content) {
  @apply flex-1 overflow-hidden;
}

:deep(.el-tab-pane) {
  @apply h-full flex flex-col;
  padding: 0;
}

:deep(.el-tab-pane > div) {
  @apply flex-1 overflow-y-auto;
  padding: 1rem;
}

/* 覆蓋 element-plus 的預設樣式 */
:deep(.el-tabs--top) {
  @apply flex flex-col;
}

:deep(.el-tabs--top .el-tabs__header) {
  @apply order-first;
}

:deep(.el-tabs--top .el-tabs__content) {
  @apply flex-1;
}

/* 確保滾動條樣式一致 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}
</style>
