import request from "../request";

/**
 * 測試外部 API 連接
 * @param {string} url - API 基礎 URL
 * @param {string} apiEndpoint - API 端點路徑
 * @returns {Promise} 返回測試結果
 */
export const testExternalApi = (apiEndpoint = "methods", url = "/") => {
  return request({
    url: `/external/test?url=${url}&apiEndpoint=${apiEndpoint}`,
    method: "get",
  });
};
