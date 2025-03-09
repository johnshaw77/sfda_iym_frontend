<template>
  <div
    class="file-node"
    :class="{ selected: selected, 'is-uploading': isUploading }"
    @click="$emit('click', $event)">
    <Handle
      type="target"
      position="top"
      :style="{ top: '-4px', opacity: targetVisible ? 1 : 0 }"
      @connect="onConnect"
      @mouseenter="targetVisible = true"
      @mouseleave="targetVisible = false" />

    <div class="file-content">
      <!-- 圖片預覽 - 只在上傳完成且是圖片類型時顯示 -->
      <div
        v-if="isImageFile && data.uploadProgress === 100"
        class="node-preview">
        <img
          :src="data.fileUrl"
          :alt="decodedFileNameValue"
          class="preview-image" />
      </div>
      <!-- 影片預覽 - 只在上傳完成且是影片類型時顯示 -->
      <div
        v-else-if="isVideoFile && data.uploadProgress === 100"
        class="node-preview"
        @click.stop="handlePreviewFile">
        <div class="video-overlay">
          <Play
            :size="24"
            class="play-icon" />
        </div>
        <video
          ref="nodeVideoRef"
          :src="data.fileUrl"
          class="preview-video"
          preload="metadata"
          muted
          disablePictureInPicture
          disableRemotePlayback
          @loadedmetadata="captureVideoThumbnail"></video>
      </div>
      <!-- 上傳中或非圖片/影片類型顯示圖標 -->
      <div
        v-else
        class="icon-wrapper">
        <component
          :is="getFileIcon(data.fileType)"
          :size="24"
          class="file-icon"
          :class="getIconColorClass(data.fileType)" />
        <div
          v-if="data.uploadProgress < 100"
          class="upload-overlay">
          <div class="progress-text">{{ data.uploadProgress }}%</div>
          <div class="progress-bar-container">
            <div
              class="progress-bar"
              :style="{ width: `${data.uploadProgress}%` }"></div>
          </div>
        </div>
      </div>

      <div class="file-info">
        <el-tooltip
          :content="data.fileName"
          placement="top"
          :show-after="500"
          :hide-after="0">
          <div
            class="file-name"
            :title="data.fileName">
            {{ truncatedFileNameValue }}
          </div>
        </el-tooltip>
        <div class="file-size">{{ formatFileSize(data.fileSize) }}</div>
        <div
          v-if="data.uploadProgress < 100"
          class="upload-progress">
          <el-progress
            :percentage="data.uploadProgress"
            :format="(p) => `${p}%`"
            :stroke-width="4"
            class="mt-1" />
        </div>
        <!-- 檔案操作按鈕 -->
        <div
          v-if="data.uploadProgress === 100"
          class="file-actions mt-2">
          <!-- 預覽按鈕 - 只對可預覽的檔案顯示 -->
          <el-button
            v-if="isPreviewableFile"
            type="primary"
            link
            size="small"
            @click.stop="handlePreviewFile">
            <Eye
              :size="14"
              class="mr-1" />預覽
          </el-button>
          <!-- 下載按鈕 - 所有檔案都顯示 -->
          <el-button
            type="primary"
            link
            size="small"
            @click.stop="handleDownloadFile">
            <Download
              :size="14"
              class="mr-1" />下載
          </el-button>
        </div>
      </div>
    </div>

    <Handle
      type="source"
      position="bottom"
      :style="{ bottom: '-4px', opacity: sourceVisible ? 1 : 0 }"
      @connect="onConnect"
      @mouseenter="sourceVisible = true"
      @mouseleave="sourceVisible = false" />

    <!-- 右鍵選單 -->
    <el-dropdown
      trigger="contextmenu"
      @command="handleCommandWrapper">
      <div class="w-full h-full absolute top-0 left-0"></div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            command="preview"
            v-if="isPreviewableFile">
            <Eye
              :size="14"
              class="mr-2" />預覽
          </el-dropdown-item>
          <el-dropdown-item command="download">
            <Download
              :size="14"
              class="mr-2" />下載
          </el-dropdown-item>
          <el-dropdown-item
            command="delete"
            class="text-red-500">
            <Trash
              :size="14"
              class="mr-2" />刪除
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 檔案預覽對話框 -->
    <el-dialog
      v-model="previewVisible"
      :title="data.fileName"
      :fullscreen="isFullscreen"
      :append-to-body="true"
      :close-on-click-modal="false"
      :show-close="false"
      class="file-preview-dialog"
      width="60%"
      top="5vh"
      :draggable="true"
      @click.stop>
      <template #header="{ close, titleId, titleClass }">
        <div class="flex items-center justify-between w-full">
          <h4
            :id="titleId"
            :class="titleClass">
            {{ data.fileName }}
          </h4>
          <div class="flex items-center space-x-2">
            <!-- 縮放控制，只對圖片和PDF顯示，不對PPT顯示 -->
            <el-button-group v-if="showZoomControlsValue">
              <el-button @click="handleZoomOut">
                <ZoomOut :size="16" />
              </el-button>
              <el-button @click="handleZoomIn">
                <ZoomIn :size="16" />
              </el-button>
            </el-button-group>
            <!-- 全螢幕切換，對所有類型顯示 -->
            <el-button @click="toggleFullscreen">
              <component
                :is="isFullscreen ? Minimize2 : Maximize2"
                :size="16" />
            </el-button>
            <!-- 關閉按鈕 -->
            <el-button @click="close">
              <X :size="16" />
            </el-button>
          </div>
        </div>
      </template>

      <div
        class="preview-content"
        :class="{ 'is-fullscreen': isFullscreen }">
        <!-- 圖片預覽 -->
        <div
          v-if="isImageFile"
          class="image-preview">
          <img
            ref="imageRef"
            :src="data.fileUrl"
            :alt="data.fileName"
            :style="{
              transform: `scale(${zoomLevel})`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }"
            @mousedown.stop="startDrag"
            @mousemove.stop="onDrag"
            @mouseup.stop="stopDrag"
            @mouseleave.stop="stopDrag" />
        </div>

        <!-- 影片預覽 -->
        <div
          v-else-if="isVideoFile"
          class="video-preview">
          <video
            ref="videoRef"
            :src="data.fileUrl"
            class="video-player"
            controls
            autoplay
            muted
            playsinline
            @loadedmetadata="onVideoMetadataLoaded"
            @canplay="handleVideoCanPlay">
            您的瀏覽器不支持影片播放。
          </video>
        </div>

        <!-- PDF 預覽 -->
        <div
          v-else-if="isPdfFile"
          class="pdf-preview">
          <div class="pdf-controls">
            <div class="flex items-center justify-between w-full px-4">
              <div class="flex items-center space-x-2">
                <el-button-group>
                  <el-button
                    size="small"
                    @click="handleDownloadFile">
                    <Download :size="16" />
                  </el-button>
                </el-button-group>
                <span class="text-sm ml-2"> 使用 PDF.js 查看器預覽 </span>
              </div>
            </div>
          </div>
          <iframe
            :src="getPdfViewerUrl(data.fileUrl)"
            class="pdf-iframe"
            frameborder="0"
            referrerpolicy="no-referrer"
            allow="fullscreen"></iframe>
        </div>

        <!-- 其他檔案類型預覽 -->
        <div
          v-else
          class="generic-preview">
          <iframe
            v-if="data.fileUrl"
            :src="data.fileUrl"
            class="generic-iframe"
            frameborder="0"></iframe>
          <div
            v-else
            class="preview-error">
            <AlertTriangle
              :size="48"
              class="text-yellow-500 mb-2" />
            <p>無法預覽此檔案類型</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { Handle } from "@vue-flow/core";
import { useFileNode } from "@/composables/flow/useFileNode";
import {
  Eye,
  Download,
  Trash,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  AlertTriangle,
  Play,
} from "lucide-vue-next";

// 定義 props
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

// 定義 emits
const emit = defineEmits(["click", "delete"]);

// 使用 composable
const {
  previewVisible,
  zoomLevel,
  isDragging,
  imageRef,
  targetVisible,
  sourceVisible,
  isUploading,
  isFullscreen,
  currentPage,
  totalPages,
  isImage,
  isPdf,
  isPreviewable,
  showZoomControls,
  truncatedFileName,
  decodedFileName,
  getFileIcon,
  getIconColorClass,
  formatFileSize,
  handlePreview,
  handleDownload,
  handleDelete,
  handleCommand,
  handleZoomIn,
  handleZoomOut,
  handlePrevPage,
  handleNextPage,
  toggleFullscreen,
  startDrag,
  onDrag,
  stopDrag,
  onConnect,
  isVideo,
  onVideoMetadataLoaded,
  captureVideoThumbnail,
  handleVideoCanPlay,
  handlePdfLoad,
  getPdfViewerUrl,
} = useFileNode();

// 計算屬性
const isImageFile = computed(() => isImage.value(props.data));
const isPdfFile = computed(() => isPdf.value(props.data));
const isPreviewableFile = computed(() => isPreviewable.value(props.data));
const showZoomControlsValue = computed(() =>
  showZoomControls.value(props.data)
);
const truncatedFileNameValue = computed(() =>
  truncatedFileName.value(props.data)
);
const decodedFileNameValue = computed(() => decodedFileName.value(props.data));
const isVideoFile = computed(() => isVideo.value(props.data));

// 處理預覽
const handlePreviewFile = () => {
  handlePreview(props.data);
};

// 處理下載
const handleDownloadFile = () => {
  handleDownload(props.data);
};

// 處理刪除
const handleDeleteFile = () => {
  handleDelete(props.data, () => {
    emit("delete", props.id);
  });
};

// 處理右鍵選單命令
const handleCommandWrapper = (command) => {
  handleCommand(command, props.data, {
    onPreview: handlePreviewFile,
    onDownload: handleDownloadFile,
    onDelete: handleDeleteFile,
  });
};

// 監聽預覽狀態變化
watch(previewVisible, (newValue) => {
  if (newValue && isPdfFile.value) {
    // PDF 頁面控制已經移到 useFileNode 中處理
    // 這裡只需要確保 UI 更新
  }
});
</script>

<style scoped>
.file-node {
  position: relative;
  width: 220px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.file-node.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.file-node.is-uploading {
  opacity: 0.7;
}

.file-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-preview {
  width: 100%;
  height: 120px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: #f0f9ff;
  margin-bottom: 12px;
  position: relative;
  border: 1px solid #e0f2fe;
}

.file-icon {
  color: #0ea5e9;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  z-index: 10;
}

.progress-text {
  font-size: 14px;
  font-weight: bold;
  color: #3b82f6;
  margin-bottom: 8px;
}

.progress-bar-container {
  width: 80%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #3b82f6;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.file-info {
  width: 100%;
  text-align: center;
}

.file-name {
  font-weight: 500;
  margin-bottom: 4px;
  word-break: break-word;
  color: #1e293b;
}

.file-size {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.file-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.file-actions .el-button {
  padding: 4px 8px;
}

/* 預覽對話框樣式 */
.file-preview-dialog :deep(.el-dialog__header) {
  padding: 12px 20px;
  margin-right: 0;
  border-bottom: 1px solid #e2e8f0;
}

.file-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.preview-content {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.preview-content.is-fullscreen {
  height: 100vh;
}

.image-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  overflow: hidden;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.2s ease;
}

.video-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  overflow: hidden;
}

.video-player {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.pdf-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pdf-controls {
  padding: 8px 0;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.pdf-iframe {
  flex: 1;
  width: 100%;
  border: none;
}

.generic-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
}

.generic-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.preview-video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.video-progress-container {
  width: 200px;
  margin: 0 10px;
}

.video-progress-slider :deep(.el-slider__runway) {
  margin: 8px 0;
}

.video-progress-slider :deep(.el-slider__bar) {
  background-color: #3b82f6;
}

.video-progress-slider :deep(.el-slider__button) {
  border-color: #3b82f6;
  width: 12px;
  height: 12px;
}

.video-time {
  color: #e5e7eb;
  min-width: 90px;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 45%;
  cursor: pointer !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.node-preview:hover .video-overlay {
  cursor: pointer !important;
  background-color: rgba(0, 0, 0, 0.5);
}

.play-icon {
  color: white;
  width: 48px;
  height: 48px;
  cursor: pointer;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
}
</style>
