import { request } from "../request";

/**
 * 工作流程範本相關 API
 */

/**
 * 創建工作流程範本
 * @param {Object} data - 範本資料
 * @param {string} data.templateName - 範本名稱
 * @param {string} data.templateCategory - 範本分類
 * @param {string} data.description - 範本描述
 * @param {string} data.version - 版本號
 * @param {Object} data.config - 範本配置
 * @returns {Promise<Object>} - 創建的範本
 */
export const createTemplate = (data) =>
  request.post("/workflow-templates", data);

/**
 * 獲取工作流程範本列表
 * @param {Object} params - 查詢參數
 * @param {string} [params.category] - 按分類篩選
 * @param {string} [params.status] - 按狀態篩選
 * @returns {Promise<Array>} - 範本列表
 */
export const getTemplates = (params) =>
  request.get("/workflow-templates", { params });

/**
 * 獲取工作流程範本詳情
 * @param {string} id - 範本 ID
 * @returns {Promise<Object>} - 範本詳情
 */
export const getTemplateById = (id) => request.get(`/workflow-templates/${id}`);

/**
 * 更新工作流程範本
 * @param {string} id - 範本 ID
 * @param {Object} data - 更新資料
 * @param {string} [data.templateName] - 範本名稱
 * @param {string} [data.templateCategory] - 範本分類
 * @param {string} [data.description] - 範本描述
 * @param {string} [data.version] - 版本號
 * @param {Object} [data.config] - 範本配置
 * @returns {Promise<Object>} - 更新後的範本
 */
export const updateTemplate = (id, data) =>
  request.put(`/workflow-templates/${id}`, data);

/**
 * 刪除工作流程範本
 * @param {string} id - 範本 ID
 * @returns {Promise<Object>} - 刪除結果
 */
export const deleteTemplate = (id) =>
  request.delete(`/workflow-templates/${id}`);

/**
 * 發布工作流程範本
 * @param {string} id - 範本 ID
 * @returns {Promise<Object>} - 發布後的範本
 */
export const publishTemplate = (id) =>
  request.put(`/workflow-templates/${id}/publish`);

/**
 * 棄用工作流程範本
 * @param {string} id - 範本 ID
 * @returns {Promise<Object>} - 棄用後的範本
 */
export const deprecateTemplate = (id) =>
  request.put(`/workflow-templates/${id}/deprecate`);
