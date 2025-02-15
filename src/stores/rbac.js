import { defineStore } from "pinia";
import {
  getRoles,
  getPermissions,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionToRole,
  removePermissionFromRole,
  assignRoleToUser,
  removeRoleFromUser,
} from "@/api/modules/rbac";

export const useRbacStore = defineStore("rbac", {
  state: () => ({
    roles: [],
    permissions: [],
    rolesLoading: false,
    permissionsLoading: false,
    initialized: false,
  }),

  getters: {
    getRoleById: (state) => (id) => state.roles.find((role) => role.id === id),
    getPermissionById: (state) => (id) =>
      state.permissions.find((permission) => permission.id === id),
    loading: (state) => state.rolesLoading || state.permissionsLoading,
  },

  actions: {
    async initialize() {
      if (this.initialized) return;

      try {
        await Promise.all([this.fetchRoles(), this.fetchPermissions()]);
        this.initialized = true;
      } catch (error) {
        console.error("初始化 RBAC store 失敗:", error);
        throw error;
      }
    },

    async fetchRoles() {
      if (this.rolesLoading) return this.roles;

      try {
        this.rolesLoading = true;
        this.roles = await getRoles();
        return this.roles;
      } catch (error) {
        console.error("獲取角色列表失敗:", error);
        throw error;
      } finally {
        this.rolesLoading = false;
      }
    },

    async fetchPermissions() {
      if (this.permissionsLoading) return this.permissions;

      try {
        this.permissionsLoading = true;
        this.permissions = await getPermissions();
        return this.permissions;
      } catch (error) {
        console.error("獲取權限列表失敗:", error);
        throw error;
      } finally {
        this.permissionsLoading = false;
      }
    },

    async createRole(roleData) {
      try {
        const response = await createRole(roleData);
        await this.fetchRoles(); // 重新獲取角色列表
        // 從更新後的角色列表中找到新創建的角色
        const newRole = this.roles.find((role) => role.name === roleData.name);
        return newRole;
      } catch (error) {
        console.error("創建角色失敗:", error);
        throw error;
      }
    },

    async updateRole(id, roleData) {
      try {
        await updateRole(id, roleData);
        await this.fetchRoles(); // 重新獲取角色列表
      } catch (error) {
        console.error("更新角色失敗:", error);
        throw error;
      }
    },

    async deleteRole(id) {
      try {
        await deleteRole(id);
        await this.fetchRoles(); // 重新獲取角色列表
      } catch (error) {
        console.error("刪除角色失敗:", error);
        throw error;
      }
    },

    async assignPermissionToRole(roleId, permissionId) {
      try {
        await assignPermissionToRole({ roleId, permissionId });
        await this.fetchRoles(); // 重新獲取角色列表
      } catch (error) {
        console.error("分配權限失敗:", error);
        throw error;
      }
    },

    async removePermissionFromRole(roleId, permissionId) {
      try {
        await removePermissionFromRole(roleId, permissionId);
        await this.fetchRoles(); // 重新獲取角色列表
      } catch (error) {
        console.error("移除權限失敗:", error);
        throw error;
      }
    },

    async assignRoleToUser(userId, roleId) {
      try {
        await assignRoleToUser({ userId, roleId });
      } catch (error) {
        console.error("分配角色失敗:", error);
        throw error;
      }
    },

    async removeRoleFromUser(userId, roleId) {
      try {
        await removeRoleFromUser(userId, roleId);
      } catch (error) {
        console.error("移除角色失敗:", error);
        throw error;
      }
    },

    // 重置 store
    reset() {
      this.roles = [];
      this.permissions = [];
      this.rolesLoading = false;
      this.permissionsLoading = false;
      this.initialized = false;
    },
  },
});
