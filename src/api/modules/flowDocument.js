import request from "../request";

/**
 * 取得所有文檔
 * @returns {Promise} 文檔列表
 */
export function getAllDocuments() {
  return request({
    url: "/flow-documents",
    method: "get",
  });
}

/**
 * 根據專案 ID 取得文檔
 * @param {string} projectId - 專案 ID
 * @returns {Promise} 文檔列表
 */
export function getDocumentsByProject(projectId) {
  return request({
    url: `/flow-documents/project/${projectId}`,
    method: "get",
  });
}

/**
 * 根據實例 ID 取得文檔
 * @param {string} instanceId - 實例 ID
 * @returns {Promise} 文檔列表
 */
export function getDocumentsByInstance(instanceId) {
  return request({
    url: `/flow-documents/instance/${instanceId}`,
    method: "get",
  });
}

/**
 * 取得單一文檔
 * @param {string} id - 文檔 ID
 * @returns {Promise} 文檔資訊
 */
export function getDocumentById(id) {
  return request({
    url: `/flow-documents/${id}`,
    method: "get",
  });
}

/**
 * 上傳文檔
 * @param {FormData} formData - 包含檔案和相關資訊的 FormData
 * @returns {Promise} 上傳結果
 */
export function uploadDocument(formData) {
  return request({
    url: "/flow-documents/upload",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/**
 * 更新文檔資訊
 * @param {string} id - 文檔 ID
 * @param {Object} data - 更新資料
 * @returns {Promise} 更新結果
 */
export function updateDocument(id, data) {
  return request({
    url: `/flow-documents/${id}`,
    method: "put",
    data,
  });
}

/**
 * 刪除文檔
 * @param {string} id - 文檔 ID
 * @returns {Promise} 刪除結果
 */
export function deleteDocument(id) {
  return request({
    url: `/flow-documents/${id}`,
    method: "delete",
  });
}
