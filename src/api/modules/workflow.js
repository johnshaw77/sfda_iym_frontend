import { request } from "../request";

/**
 * 上傳檔案
 * @param {File} file - 要上傳的檔案
 * @param {string} workflowId - 工作流程 ID
 * @returns {Promise} - 上傳結果
 */
export const uploadFile = async (file, workflowId) => {
  console.log("準備上傳檔案：", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    workflowId,
  });

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workflowId", workflowId);

    const response = await request.post("/file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("上傳檔案回應：", response);
    return response;
  } catch (error) {
    console.error("檔案上傳失敗：", error);
    throw error;
  }
};

// 獲取工作流程的檔案列表
export const getWorkflowFiles = (workflowId) =>
  request.get(`/workflow/${workflowId}/files`);

// 刪除檔案
export const deleteFile = (fileId) =>
  request.delete(`/workflow/files/${fileId}`);

// 下載檔案
export const downloadFile = (fileId) =>
  request.download(`/workflow/files/${fileId}/download`);
