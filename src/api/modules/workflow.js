import { request } from "../request";

// 上傳檔案
export const uploadFile = (file, workflowId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("workflowId", workflowId);
  return request.post("/workflow/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
