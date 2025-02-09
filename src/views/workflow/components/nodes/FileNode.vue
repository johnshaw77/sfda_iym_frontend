<template>
  <div
    class="file-node"
    :class="{ selected: selected }"
    @click="$emit('click', $event)"
  >
    <Handle
      type="target"
      position="top"
      :style="{ top: '-4px', opacity: targetVisible ? 1 : 0 }"
      @connect="onConnect"
      @mouseenter="targetVisible = true"
      @mouseleave="targetVisible = false"
    />

    <div class="file-content">
      <component
        :is="getFileIcon(data.fileType)"
        :size="24"
        class="file-icon"
        :class="getIconColorClass(data.fileType)"
      />
      <div class="file-info">
        <div class="file-name">{{ data.fileName }}</div>
        <div class="file-size">{{ formatFileSize(data.fileSize) }}</div>
        <div v-if="data.uploadProgress < 100" class="upload-progress">
          <el-progress
            :percentage="data.uploadProgress"
            :format="(p) => `${p}%`"
            :stroke-width="4"
            class="mt-1"
          />
        </div>
      </div>
    </div>

    <Handle
      type="source"
      position="bottom"
      :style="{ bottom: '-4px', opacity: sourceVisible ? 1 : 0 }"
      @connect="onConnect"
      @mouseenter="sourceVisible = true"
      @mouseleave="sourceVisible = false"
    />

    <!-- 右鍵選單 -->
    <el-dropdown trigger="contextmenu" @command="handleCommand">
      <div class="w-full h-full absolute top-0 left-0"></div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="preview" v-if="isPreviewable">
            <Eye :size="14" class="mr-2" />預覽
          </el-dropdown-item>
          <el-dropdown-item command="download">
            <Download :size="14" class="mr-2" />下載
          </el-dropdown-item>
          <el-dropdown-item command="delete" class="text-red-500">
            <Trash :size="14" class="mr-2" />刪除
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 檔案預覽對話框 -->
    <el-dialog
      v-model="previewVisible"
      :title="data.fileName"
      width="80%"
      destroy-on-close
      class="file-preview-dialog"
    >
      <div class="preview-content">
        <!-- 圖片預覽 -->
        <img
          v-if="isImage"
          :src="data.fileUrl"
          :alt="data.fileName"
          class="max-w-full max-h-[70vh] object-contain mx-auto"
        />
        <!-- PDF 預覽 -->
        <iframe
          v-else-if="isPdf"
          :src="data.fileUrl"
          class="w-full h-[70vh]"
          frameborder="0"
        ></iframe>
        <!-- 文本預覽 -->
        <pre
          v-else-if="isText"
          class="bg-gray-50 p-4 rounded max-h-[70vh] overflow-auto"
          >{{ textContent }}</pre
        >
        <!-- 不支援預覽 -->
        <div v-else class="text-center py-8">
          <FileX :size="48" class="mx-auto mb-4 text-gray-400" />
          <p class="text-gray-600">此檔案類型不支援預覽</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Handle } from "@vue-flow/core";
import {
  FileText,
  Image as ImageIcon,
  File,
  FileX,
  Eye,
  Download,
  Trash,
} from "lucide-vue-next";
import { ElMessage } from "element-plus";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

const sourceVisible = ref(false);
const targetVisible = ref(false);
const previewVisible = ref(false);
const textContent = ref("");

// 檔案類型判斷
const isImage = computed(() => props.data.fileType?.startsWith("image/"));
const isPdf = computed(() => props.data.fileType === "application/pdf");
const isText = computed(
  () =>
    props.data.fileType === "text/plain" ||
    props.data.fileType === "text/csv" ||
    props.data.fileType === "application/json"
);
const isPreviewable = computed(
  () => isImage.value || isPdf.value || isText.value
);

// 根據檔案類型獲取對應圖標和顏色
const getFileIcon = (type) => {
  if (type?.startsWith("image/")) return ImageIcon;
  if (type?.includes("pdf")) return FileText;
  return File;
};

const getIconColorClass = (type) => {
  if (type?.startsWith("image/")) return "text-green-500";
  if (type?.includes("pdf")) return "text-red-500";
  if (type?.includes("text")) return "text-blue-500";
  return "text-gray-500";
};

// 格式化檔案大小
const formatFileSize = (size) => {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let index = 0;
  let fileSize = size;

  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024;
    index++;
  }

  return `${fileSize.toFixed(2)} ${units[index]}`;
};

// 處理檔案預覽
const handlePreview = async () => {
  if (!isPreviewable.value) {
    ElMessage.warning("此檔案類型不支援預覽");
    return;
  }

  if (isText.value) {
    try {
      const response = await fetch(props.data.fileUrl);
      textContent.value = await response.text();
    } catch (error) {
      ElMessage.error("無法讀取檔案內容");
      return;
    }
  }

  previewVisible.value = true;
};

// 處理右鍵選單命令
const handleCommand = async (command) => {
  switch (command) {
    case "preview":
      await handlePreview();
      break;
    case "download":
      // 創建下載連結
      const link = document.createElement("a");
      link.href = props.data.fileUrl;
      link.download = props.data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      ElMessage.success("開始下載檔案");
      break;
    case "delete":
      ElMessageBox.confirm("確定要刪除此檔案嗎？", "警告", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        emit("delete", props.id);
      });
      break;
  }
};

const onConnect = (params) => {
  console.log("連接參數：", params);
};
</script>

<style scoped>
.file-node {
  @apply bg-white rounded-lg shadow-md p-4 min-w-[200px] relative border-2 border-transparent;
  transition: all 0.2s ease;
}

.file-node.selected {
  @apply border-blue-500 shadow-lg;
}

.file-content {
  @apply flex items-center space-x-3;
}

.file-icon {
  @apply flex-shrink-0;
}

.file-info {
  @apply flex-1 min-w-0;
}

.file-name {
  @apply text-sm font-medium text-gray-700 truncate;
}

.file-size {
  @apply text-xs text-gray-500;
}

.upload-progress {
  @apply mt-1;
}

/* Handle 樣式 */
:deep(.vue-flow__handle) {
  @apply w-3 h-3 bg-blue-500;
  transition: opacity 0.2s ease;
}

:deep(.vue-flow__handle:hover) {
  @apply bg-blue-600;
}

/* 預覽對話框樣式 */
.file-preview-dialog {
  :deep(.el-dialog__body) {
    @apply p-4;
  }
}

.preview-content {
  @apply flex items-center justify-center;
}
</style>
