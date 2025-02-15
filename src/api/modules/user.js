import request from "@/api/request";

/**
 * 用戶相關 API
 * 包含用戶資料的查詢、更新等功能
 */

// API 端點
const API_ENDPOINTS = {
  users: "/users",
  userProfile: "/auth/me",
  updateProfile: "/auth/profile",
  updatePassword: "/auth/password",
  updateAvatar: "/auth/avatar",
  userAvatar: (id) => `/users/${id}/avatar`,
  userRoles: (userId) => `/users/${userId}/roles`,
  userRole: (userId, roleId) => `/user-roles/${userId}/${roleId}`,
};

/**
 * 獲取當前登入用戶資料
 * @returns {Promise<Object>} 返回用戶資料
 */
export function getCurrentUser() {
  return request.get("/auth/me");
}

/**
 * 更新用戶資料
 * @param {Object} data - 要更新的用戶資料
 * @param {string} [data.username] - 用戶名稱
 * @param {string} [data.avatar] - 用戶頭像
 * @param {string} [data.email] - 電子郵件
 * @returns {Promise<Object>} 返回更新後的用戶資料
 */
export function updateProfile(data) {
  return request({
    url: API_ENDPOINTS.updateProfile,
    method: "put",
    data,
  });
}

/**
 * 更新用戶密碼
 * @param {Object} data - 密碼資料
 * @param {string} data.currentPassword - 當前密碼
 * @param {string} data.newPassword - 新密碼
 * @returns {Promise<{message: string}>} 返回操作結果
 */
export function updatePassword(data) {
  return request({
    url: API_ENDPOINTS.updatePassword,
    method: "put",
    data,
  });
}

/**
 * 更新用戶頭像
 * @param {FormData} data - 包含頭像文件的 FormData
 * @returns {Promise<Object>} 返回更新後的用戶資料
 */
export function updateAvatar(data) {
  return request({
    url: API_ENDPOINTS.updateAvatar,
    method: "put",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data,
  });
}

/**
 * 獲取用戶列表（管理員用）
 * @param {Object} params - 查詢參數
 * @param {number} params.page - 頁碼
 * @param {number} params.limit - 每頁數量
 * @returns {Promise<{total: number, users: Array}>} 返回用戶列表和總數
 */
export function getUsers(params) {
  return request({
    url: API_ENDPOINTS.users,
    method: "get",
    params,
  });
}

/**
 * 獲取特定用戶資料（管理員用）
 * @param {string} id - 用戶ID
 * @returns {Promise<Object>} 返回用戶資料
 */
export function getUserById(id) {
  return request({
    url: `/users/${id}`,
    method: "get",
  });
}

/**
 * 更新用戶狀態（管理員用）
 * @param {string} id - 用戶ID
 * @param {Object} data - 更新資料
 * @param {boolean} data.isActive - 是否啟用
 * @returns {Promise<Object>} 返回更新後的用戶資料
 */
export function updateUserStatus(id, data) {
  return request({
    url: `/users/${id}/status`,
    method: "put",
    data,
  });
}

/**
 * 刪除用戶（管理員用）
 * @param {string} id - 用戶ID
 * @returns {Promise<{message: string}>} 返回操作結果
 */
export function deleteUser(id) {
  return request({
    url: `/users/${id}`,
    method: "delete",
  });
}

/**
 * 獲取所有用戶
 */
export const getAllUsers = () => request.get("/users");

/**
 * 創建用戶
 * @param {Object} data - 用戶數據
 * @param {string} data.username - 用戶名
 * @param {string} data.email - 郵箱
 * @param {string} data.password - 密碼
 * @param {string} data.status - 狀態
 */
export const createUser = (data) => request.post("/users", data);

/**
 * 更新用戶
 * @param {string} id - 用戶ID
 * @param {Object} data - 用戶數據
 */
export const updateUser = (id, data) => request.put(`/users/${id}`, data);

/**
 * 獲取用戶的角色
 * @param {string} userId - 用戶ID
 */
export const getUserRoles = (userId) => request.get(`/users/${userId}/roles`);

/**
 * 為用戶分配角色
 * @param {Object} data - 分配數據
 * @param {string} data.userId - 用戶ID
 * @param {string} data.roleId - 角色ID
 */
export const assignRoleToUser = (data) => request.post("/user-roles", data);

/**
 * 移除用戶的角色
 * @param {string} userId - 用戶ID
 * @param {string} roleId - 角色ID
 */
export const removeRoleFromUser = (userId, roleId) =>
  request.delete(`/user-roles/${userId}/${roleId}`);

/**
 * 上傳用戶頭像
 * @param {string} userId - 用戶ID
 * @param {File} file - 頭像文件
 */
export const uploadAvatar = (userId, file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return request.post(API_ENDPOINTS.userAvatar(userId), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
