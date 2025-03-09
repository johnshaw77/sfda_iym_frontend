import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useFullscreen } from "@vueuse/core";
import { uploadDocument } from "@/api/modules/flowDocument";

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
  const uploadProgress = ref(0);

  // PDF 相關狀態
  const currentPage = ref(1);
  const totalPages = ref(1);

  // 全螢幕控制
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  // 統一的檔案類型定義
  const ALLOWED_FILE_TYPES = {
    // 圖片類型
    "image/jpeg": "圖片檔案",
    "image/jpg": "圖片檔案",
    "image/png": "圖片檔案",
    "image/gif": "圖片檔案",
    "image/webp": "圖片檔案",
    "image/svg+xml": "圖片檔案",
    // PDF 類型
    "application/pdf": "PDF 檔案",
    // 文字類型
    "text/plain": "文字檔案",
    "text/csv": "CSV 檔案",
    "application/json": "JSON 檔案",
    // Excel 相關
    "application/vnd.ms-excel": "Excel 檔案",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "Excel 檔案",
    "application/excel": "Excel 檔案",
    "application/x-excel": "Excel 檔案",
    "application/x-msexcel": "Excel 檔案",
    // PPT 相關
    "application/vnd.ms-powerpoint": "PPT 檔案",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "PPT 檔案",
    "application/powerpoint": "PPT 檔案",
    "application/mspowerpoint": "PPT 檔案",
    "application/x-mspowerpoint": "PPT 檔案",
    "application/ppt": "PPT 檔案",
    // Word 相關
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word 檔案",
    "application/word": "Word 檔案",
    "application/x-word": "Word 檔案",
    "application/vnd.ms-word": "Word 檔案",

    // 視頻類型
    "video/mp4": "視頻檔案",
    "video/avi": "視頻檔案",
    "video/mov": "視頻檔案",
    "video/wmv": "視頻檔案",
    "video/mp3": "視頻檔案",
  };

  // 檢查檔案類型是否允許
  const isFileTypeAllowed = (file) => {
    // 直接檢查 MIME 類型
    if (ALLOWED_FILE_TYPES[file.type]) {
      return true;
    }

    // 檢查通配符類型
    for (const type in ALLOWED_FILE_TYPES) {
      if (type.endsWith("*") && file.type.startsWith(type.slice(0, -1))) {
        return true;
      }
    }

    // 從檔名推斷
    const fileName = file.name.toLowerCase();
    const extension = fileName.split(".").pop();
    const extensionMap = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      pdf: "application/pdf",
      txt: "text/plain",
      csv: "text/csv",
      json: "application/json",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      doc: "application/vnd.ms-word",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    return !!ALLOWED_FILE_TYPES[extensionMap[extension]];
  };

  // 計算屬性
  const isImage = computed(() => {
    return (data) => {
      if (!data) return false;

      // 檢查檔案類型
      const fileType = data.fileType?.toLowerCase();
      const fileName = data.fileName?.toLowerCase();

      // 先檢查 fileType，如果沒有則從檔名推斷
      if (fileType && fileType.startsWith("image/")) {
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

  // 檔案上傳處理
  const uploadFile = async (file, projectId, instanceId) => {
    isUploading.value = true;
    uploadProgress.value = 0;

    return new Promise((resolve, reject) => {
      try {
        // 創建 FormData
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);
        formData.append("instanceId", instanceId);
        formData.append("docType", file.type);

        // 開發環境下模擬上傳延遲
        const isDevelopment = process.env.NODE_ENV === "development";
        const simulateSlowUpload =
          isDevelopment &&
          localStorage.getItem("simulateSlowUpload") !== "false";

        if (simulateSlowUpload) {
          console.log("模擬慢速上傳中...");
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 100) progress = 100;
            uploadProgress.value = Math.floor(progress);

            if (progress >= 100) {
              clearInterval(interval);
              // 模擬上傳完成後，發送實際請求
              uploadDocument(formData)
                .then((response) => {
                  isUploading.value = false;
                  resolve(response);
                })
                .catch((error) => {
                  isUploading.value = false;
                  reject(error);
                });
            }
          }, 300); // 每300毫秒更新一次進度
          return;
        }

        // 實際上傳邏輯 - 使用 XMLHttpRequest 來獲取上傳進度
        const xhr = new XMLHttpRequest();

        // 監聽上傳進度事件
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            // 計算上傳進度百分比
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            uploadProgress.value = percentComplete;
            console.log(`上傳進度: ${percentComplete}%`);
          }
        });

        // 監聽請求完成事件
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            isUploading.value = false;
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error("解析響應失敗"));
            }
          } else {
            isUploading.value = false;
            reject(new Error(`上傳失敗，狀態碼: ${xhr.status}`));
          }
        });

        // 監聽錯誤事件
        xhr.addEventListener("error", () => {
          isUploading.value = false;
          reject(new Error("網絡錯誤，上傳失敗"));
        });

        // 監聽中止事件
        xhr.addEventListener("abort", () => {
          isUploading.value = false;
          reject(new Error("上傳已取消"));
        });

        // 開啟請求
        xhr.open("POST", "/api/flow-documents/upload");

        // 設置請求頭（如果需要認證）
        const token = localStorage.getItem("token");
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        // 發送請求
        xhr.send(formData);
      } catch (error) {
        isUploading.value = false;
        reject(error);
      }
    });
  };

  // 檔案拖放處理
  const handleFileDrop = async (
    event,
    projectId,
    instanceId,
    position,
    onNodeCreated
  ) => {
    // 阻止事件冒泡，確保事件不會被重複處理
    event.stopPropagation();

    // 獲取拖放的檔案
    const files = Array.from(event.dataTransfer.files);

    // 檢查檔案類型
    const invalidFiles = files.filter((file) => !isFileTypeAllowed(file));
    if (invalidFiles.length > 0) {
      ElMessage.error(
        `不支援的檔案類型：${invalidFiles.map((f) => f.name).join(", ")}`
      );
      return;
    }

    // 處理每個檔案
    for (const file of files) {
      try {
        // 創建臨時節點 ID
        const nodeId = `file-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // 創建臨時節點數據
        const tempNodeData = {
          id: nodeId,
          type: "file",
          position,
          draggable: true,
          data: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadProgress: 0,
          },
        };

        // 通知創建臨時節點
        onNodeCreated && onNodeCreated(tempNodeData, "temp");

        // 上傳檔案
        const result = await uploadFile(file, projectId, instanceId);

        // 更新節點數據
        const updatedNodeData = {
          id: nodeId,
          type: "file",
          position,
          draggable: true,
          data: {
            fileId: result.data.id,
            fileUrl: result.data.url,
            fileName: result.data.name,
            fileType: file.type,
            fileSize: file.size,
            uploadProgress: 100,
          },
        };

        // 通知更新節點
        onNodeCreated && onNodeCreated(updatedNodeData, "final");

        // 返回節點數據，用於保存到流程實例
        return {
          nodeId,
          fileId: result.data.id,
          fileUrl: result.data.url,
          fileName: result.data.name,
        };
      } catch (error) {
        ElMessage.error(
          `檔案 ${file.name} 上傳失敗：${error.message || "未知錯誤"}`
        );
      }
    }
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
    uploadProgress,
    isFullscreen,
    currentPage,
    totalPages,

    // 檔案類型相關
    ALLOWED_FILE_TYPES,
    isFileTypeAllowed,

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

    // 新增方法
    uploadFile,
    handleFileDrop,
  };
}
