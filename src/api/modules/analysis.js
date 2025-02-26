import request from "../request";

// 基礎路徑
const BASE_PATH = "/analysis";

/**
 * 執行相關性分析
 * @param {Object} data - 分析參數
 * @param {string} data.method - 分析方法 (pearson, spearman, kendall)
 * @param {number} data.significanceLevel - 顯著性水平
 * @param {string} data.colorMap - 熱圖顏色
 * @param {number} data.threshold - 篩選閾值
 * @param {Array<string>} data.columns - 要分析的欄位
 * @param {string} data.outputFormat - 輸出格式 (matrix, list, both)
 * @param {string} data.datasetId - 數據集 ID
 * @returns {Promise<Object>} - 分析結果
 */
export const performCorrelationAnalysis = (data) => {
  return request({
    url: `${BASE_PATH}/correlation`,
    method: "post",
    data,
  });
};

/**
 * 獲取相關性分析結果
 * @param {string} analysisId - 分析 ID
 * @returns {Promise<Object>} - 分析結果
 */
export const getCorrelationAnalysisResult = (analysisId) => {
  return request({
    url: `${BASE_PATH}/correlation/${analysisId}`,
    method: "get",
  });
};

/**
 * 獲取相關性熱圖
 * @param {string} analysisId - 分析 ID
 * @param {string} format - 圖片格式 (png, svg, pdf)
 * @returns {Promise<Blob>} - 圖片數據
 */
export const getCorrelationHeatmap = (analysisId, format = "png") => {
  return request({
    url: `${BASE_PATH}/correlation/${analysisId}/heatmap`,
    method: "get",
    params: { format },
    responseType: "blob",
  });
};

/**
 * 獲取可用於相關性分析的數據集列表
 * @param {Object} params - 查詢參數
 * @returns {Promise<Array>} - 數據集列表
 */
export const getAnalysisDatasets = (params) => {
  return request({
    url: `${BASE_PATH}/datasets`,
    method: "get",
    params,
  });
};

/**
 * 獲取數據集的欄位信息
 * @param {string} datasetId - 數據集 ID
 * @returns {Promise<Object>} - 欄位信息
 */
export const getDatasetColumns = (datasetId) => {
  return request({
    url: `${BASE_PATH}/datasets/${datasetId}/columns`,
    method: "get",
  });
};

/**
 * 保存相關性分析結果
 * @param {string} analysisId - 分析 ID
 * @param {Object} data - 保存參數
 * @returns {Promise<Object>} - 保存結果
 */
export const saveCorrelationAnalysis = (analysisId, data) => {
  return request({
    url: `${BASE_PATH}/correlation/${analysisId}/save`,
    method: "post",
    data,
  });
};

/**
 * 導出相關性分析結果
 * @param {string} analysisId - 分析 ID
 * @param {string} format - 導出格式 (csv, excel, json)
 * @returns {Promise<Blob>} - 導出文件
 */
export const exportCorrelationAnalysis = (analysisId, format = "excel") => {
  return request({
    url: `${BASE_PATH}/correlation/${analysisId}/export`,
    method: "get",
    params: { format },
    responseType: "blob",
  });
};
