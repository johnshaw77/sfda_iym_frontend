import { request } from "../request";

/**
 * 工作流程相關 API
 */

/**
 * 創建工作流程
 * @param {Object} data - 工作流程資料
 * @param {string} data.name - 工作流程名稱
 * @param {string} [data.description] - 工作流程描述
 * @returns {Promise<Object>} - 創建的工作流程
 */
export const createWorkflow = (data) => request.post("/workflows", data);

/**
 * 獲取工作流程列表
 * @returns {Promise<Array>} - 工作流程列表
 */
export const getWorkflows = () => request.get("/workflows");

/**
 * 獲取工作流程詳情
 * @param {string} id - 工作流程 ID
 * @returns {Promise<Object>} - 工作流程詳情
 */
export const getWorkflow = (id) => request.get(`/workflows/${id}`);

/**
 * 更新工作流程
 * @param {string} id - 工作流程 ID
 * @param {Object} data - 更新資料
 * @returns {Promise<Object>} - 更新後的工作流程
 */
export const updateWorkflow = (id, data) =>
  request.put(`/workflows/${id}`, data);

/**
 * 刪除工作流程
 * @param {string} id - 工作流程 ID
 * @returns {Promise} - 刪除結果
 */
export const deleteWorkflow = (id) => request.delete(`/workflows/${id}`);

/**
 * 上傳工作流程檔案
 * @param {File} file - 要上傳的檔案
 * @param {string} workflowId - 工作流程 ID
 * @returns {Promise} - 上傳結果
 */
export const uploadWorkflowFile = async (file, workflowId) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workflowId", workflowId);

    const response = await request.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    console.error("工作流程檔案上傳失敗：", error);
    throw error;
  }
};

/**
 * 批量上傳工作流程檔案
 * @param {Array<File>} files - 要上傳的檔案列表
 * @param {string} workflowId - 工作流程 ID
 * @returns {Promise<Array>} - 上傳結果列表
 */
export const uploadWorkflowFiles = async (files, workflowId) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("workflowId", workflowId);

    const response = await request.post("/files/upload/batch", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    console.error("批量上傳檔案失敗：", error);
    throw error;
  }
};

/**
 * 獲取工作流程的檔案列表
 * @param {string} workflowId - 工作流程 ID
 * @returns {Promise} - 檔案列表
 */
export const getWorkflowFiles = (workflowId) =>
  request.get(`/workflows/${workflowId}/files`);

/**
 * 刪除工作流程檔案
 * @param {string} fileId - 檔案 ID
 * @returns {Promise} - 刪除結果
 */
export const deleteWorkflowFile = (fileId) =>
  request.delete(`/files/${fileId}`);

/**
 * 下載工作流程檔案
 * @param {string} fileId - 檔案 ID
 * @returns {Promise} - 下載結果
 */
export const downloadWorkflowFile = (fileId) =>
  request.download(`/files/${fileId}/download`);

/**
 * 檢查檔案處理狀態
 * @param {string} fileId - 檔案 ID
 * @returns {Promise<Object>} - 檔案狀態
 */
export const checkFileStatus = (fileId) =>
  request.get(`/files/${fileId}/status`);
