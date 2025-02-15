import { request } from "../request";

/**
 * 獲取所有角色
 */
export const getRoles = () => request.get("/rbac/roles");

/**
 * 創建角色
 * @param {Object} data - 角色數據
 * @param {string} data.name - 角色名稱
 * @param {string} data.description - 角色描述
 */
export const createRole = (data) => request.post("/rbac/roles", data);

/**
 * 更新角色
 * @param {string} id - 角色ID
 * @param {Object} data - 角色數據
 */
export const updateRole = (id, data) => request.put(`/rbac/roles/${id}`, data);

/**
 * 刪除角色
 * @param {string} id - 角色ID
 */
export const deleteRole = (id) => request.delete(`/rbac/roles/${id}`);

/**
 * 獲取所有權限
 */
export const getPermissions = () => request.get("/rbac/permissions");

/**
 * 為角色分配權限
 * @param {Object} data - 分配數據
 * @param {string} data.roleId - 角色ID
 * @param {string} data.permissionId - 權限ID
 */
export const assignPermissionToRole = (data) =>
  request.post("/rbac/role-permissions", data);

/**
 * 移除角色的權限
 * @param {string} roleId - 角色ID
 * @param {string} permissionId - 權限ID
 */
export const removePermissionFromRole = (roleId, permissionId) =>
  request.delete(`/rbac/role-permissions/${roleId}/${permissionId}`);

/**
 * 為用戶分配角色
 * @param {Object} data - 分配數據
 * @param {string} data.userId - 用戶ID
 * @param {string} data.roleId - 角色ID
 */
export const assignRoleToUser = (data) =>
  request.post("/rbac/user-roles", data);

/**
 * 移除用戶的角色
 * @param {string} userId - 用戶ID
 * @param {string} roleId - 角色ID
 */
export const removeRoleFromUser = (userId, roleId) =>
  request.delete(`/rbac/user-roles/${userId}/${roleId}`);
