import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useFullscreen } from "@vueuse/core";

export function useFileNode() {
  // 檔案預覽相關狀態
  const previewVisible = ref(false);
  const zoomLevel = ref(1);
  const isDragging = ref(false);
  const dragStartX = ref(0);
  const dragStartY = ref(0);
  const imageRef = ref(null);
  const targetVisible = ref(false);
  const sourceVisible = ref(false);
  const isUploading = ref(false);

  // PDF 相關狀態
  const currentPage = ref(1);
  const totalPages = ref(1);

  // 全螢幕控制
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  // 計算屬性
  const isImage = computed(() => {
    return (data) => {
      if (!data) return false;

      // 檢查檔案類型
      const fileType = data.fileType?.toLowerCase();
      const fileName = data.fileName?.toLowerCase();

      // 除錯日誌
      console.log("檢查是否為圖片:", {
        fileName,
        fileType,
        isImage:
          fileType &&
          ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileType),
      });

      // 先檢查 fileType，如果沒有則從檔名推斷
      if (
        fileType &&
        ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileType)
      ) {
        return true;
      }

      // 從檔名推斷
      if (fileName) {
        const extension = fileName.split(".").pop();
        return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension);
      }

      return false;
    };
  });

  const isPdf = computed(() => {
    return (data) => {
      if (!data) return false;

      // 檢查檔案類型
      const fileType = data.fileType?.toLowerCase();
      const fileName = data.fileName?.toLowerCase();

      // 除錯日誌
      console.log("檢查是否為PDF:", {
        fileName,
        fileType,
        isPdf: fileType === "pdf",
      });

      // 先檢查 fileType
      if (fileType === "pdf") {
        return true;
      }

      // 從檔名推斷
      if (fileName) {
        const extension = fileName.split(".").pop();
        return extension === "pdf";
      }

      return false;
    };
  });

  const isPreviewable = computed(() => {
    return (data) => {
      if (!data) return false;

      // 檢查檔案類型
      const fileType = data.fileType?.toLowerCase();
      const fileName = data.fileName?.toLowerCase();
      const previewableTypes = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg",
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
      ];

      // 先檢查 fileType
      if (fileType && previewableTypes.includes(fileType)) {
        return true;
      }

      // 從檔名推斷
      if (fileName) {
        const extension = fileName.split(".").pop();
        return previewableTypes.includes(extension);
      }

      return false;
    };
  });

  const showZoomControls = computed(() => {
    return (data) => {
      if (!data) return false;

      // 檢查檔案類型
      const fileType = data.fileType?.toLowerCase();
      const fileName = data.fileName?.toLowerCase();
      const zoomableTypes = ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf"];

      // 先檢查 fileType
      if (fileType && zoomableTypes.includes(fileType)) {
        return true;
      }

      // 從檔名推斷
      if (fileName) {
        const extension = fileName.split(".").pop();
        return zoomableTypes.includes(extension);
      }

      return false;
    };
  });

  const truncatedFileName = computed(() => {
    return (data) => {
      if (!data.fileName) return "";
      return data.fileName.length > 20
        ? data.fileName.substring(0, 17) + "..."
        : data.fileName;
    };
  });

  const decodedFileName = computed(() => {
    return (data) => {
      try {
        return decodeURIComponent(data.fileName);
      } catch (e) {
        return data.fileName;
      }
    };
  });

  // 檔案圖示和格式化
  const getFileIcon = (fileType) => {
    if (!fileType) return "File";

    fileType = fileType.toLowerCase();

    switch (fileType) {
      case "pdf":
        return "FileText";
      case "doc":
      case "docx":
        return "FileText";
      case "xls":
      case "xlsx":
        return "FileSpreadsheet";
      case "ppt":
      case "pptx":
        return "FilePresentation";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
      case "svg":
        return "Image";
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
        return "FileVideo";
      case "mp3":
      case "wav":
      case "ogg":
        return "FileAudio";
      case "zip":
      case "rar":
      case "7z":
        return "FileArchive";
      case "txt":
        return "FileText";
      case "html":
      case "css":
      case "js":
        return "FileCode";
      default:
        return "File";
    }
  };

  const getIconColorClass = (fileType) => {
    if (!fileType) return "text-gray-500";

    fileType = fileType.toLowerCase();

    switch (fileType) {
      case "pdf":
        return "text-red-500";
      case "doc":
      case "docx":
        return "text-blue-600";
      case "xls":
      case "xlsx":
        return "text-green-600";
      case "ppt":
      case "pptx":
        return "text-orange-500";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
      case "svg":
        return "text-purple-500";
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
        return "text-blue-500";
      case "mp3":
      case "wav":
      case "ogg":
        return "text-green-500";
      case "zip":
      case "rar":
      case "7z":
        return "text-yellow-600";
      case "txt":
        return "text-gray-600";
      case "html":
      case "css":
      case "js":
        return "text-indigo-500";
      default:
        return "text-gray-500";
    }
  };

  const formatFileSize = (size) => {
    if (!size) return "未知大小";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let formattedSize = size;
    let unitIndex = 0;

    while (formattedSize >= 1024 && unitIndex < units.length - 1) {
      formattedSize /= 1024;
      unitIndex++;
    }

    return `${formattedSize.toFixed(2)} ${units[unitIndex]}`;
  };

  // 檔案操作處理
  const handlePreview = (data) => {
    previewVisible.value = true;
    zoomLevel.value = 1;

    // 重置 PDF 頁面
    if (isPdf.value(data)) {
      currentPage.value = 1;
      // 這裡可以添加獲取 PDF 總頁數的邏輯
      totalPages.value = 1; // 假設為 1，實際應該從 PDF 中獲取
    }
  };

  const handleDownload = (data) => {
    if (!data.fileUrl) {
      ElMessage.error("檔案連結無效，無法下載");
      return;
    }

    const link = document.createElement("a");
    link.href = data.fileUrl;
    link.download = data.fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (data, onDelete) => {
    try {
      await ElMessageBox.confirm(
        "確定要刪除此檔案嗎？此操作不可恢復。",
        "刪除確認",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      );

      onDelete && onDelete(data);
    } catch (error) {
      // 用戶取消刪除
    }
  };

  const handleCommand = (
    command,
    data,
    { onPreview, onDownload, onDelete }
  ) => {
    switch (command) {
      case "preview":
        onPreview ? onPreview(data) : handlePreview(data);
        break;
      case "download":
        onDownload ? onDownload(data) : handleDownload(data);
        break;
      case "delete":
        handleDelete(data, onDelete);
        break;
    }
  };

  // PDF 頁面控制
  const handlePrevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  const handleNextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };

  // 縮放控制
  const handleZoomIn = () => {
    zoomLevel.value = Math.min(zoomLevel.value + 0.1, 3);
  };

  const handleZoomOut = () => {
    zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.5);
  };

  // 拖拽控制
  const startDrag = (event) => {
    isDragging.value = true;
    dragStartX.value = event.clientX;
    dragStartY.value = event.clientY;
  };

  const onDrag = (event) => {
    if (!isDragging.value) return;

    const dx = event.clientX - dragStartX.value;
    const dy = event.clientY - dragStartY.value;

    if (imageRef.value) {
      const img = imageRef.value;
      img.style.transform = `translate(${dx}px, ${dy}px) scale(${zoomLevel.value})`;
    }
  };

  const stopDrag = () => {
    isDragging.value = false;
  };

  // 連接處理
  const onConnect = (event) => {
    // 通知父元件處理連接事件
    // 這裡可以添加特定於檔案節點的連接邏輯
    console.log("檔案節點連接事件", event);
  };

  return {
    // 狀態
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

    // 計算屬性
    isImage,
    isPdf,
    isPreviewable,
    showZoomControls,
    truncatedFileName,
    decodedFileName,

    // 方法
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
  };
}
