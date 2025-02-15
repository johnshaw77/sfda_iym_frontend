/**
 * 獲取 API 基礎 URL
 * @returns {string} API 基礎 URL
 */
export const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    console.warn("VITE_API_URL 未設定");
    return "/api";
  }
  return apiUrl;
};

/**
 * 獲取上傳文件的基礎 URL
 * @returns {string} 上傳文件的基礎 URL
 */
export const getUploadBaseUrl = () => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace(/\/api$/, "");
};

/**
 * 獲取頭像完整 URL
 * @param {string} avatarPath - 頭像路徑
 * @returns {string} 頭像完整 URL
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "";
  const baseUrl = getUploadBaseUrl();
  return `${baseUrl}/${avatarPath}`;
};

/**
 * 獲取文件完整 URL
 * @param {string} filePath - 文件路徑
 * @returns {string} 文件完整 URL
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return "";
  const baseUrl = getUploadBaseUrl();
  //TODO: 修正路徑
  return `${baseUrl}/uploads/${filePath}`;
};
