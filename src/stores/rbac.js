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
import { useUserStore } from "./user";

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

    // 角色相關
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

    async createRole(roleData) {
      try {
        const response = await createRole(roleData);
        await this.fetchRoles();
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
        await this.fetchRoles();
      } catch (error) {
        console.error("更新角色失敗:", error);
        throw error;
      }
    },

    async deleteRole(id) {
      try {
        await deleteRole(id);
        await this.fetchRoles();
      } catch (error) {
        console.error("刪除角色失敗:", error);
        throw error;
      }
    },

    // 權限相關
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

    async assignPermissionToRole(roleId, permissionId) {
      try {
        await assignPermissionToRole({ roleId, permissionId });
        await this.fetchRoles();
      } catch (error) {
        console.error("分配權限失敗:", error);
        throw error;
      }
    },

    async removePermissionFromRole(roleId, permissionId) {
      try {
        await removePermissionFromRole(roleId, permissionId);
        await this.fetchRoles();
      } catch (error) {
        console.error("移除權限失敗:", error);
        throw error;
      }
    },

    // 用戶角色關聯
    async updateUserRoles(userId, roleIds) {
      const userStore = useUserStore();
      try {
        const currentRoles = await userStore.getUserRoles(userId);
        const currentRoleIds = currentRoles.map((ur) => ur.role.id);

        // 找出需要添加和移除的角色
        const rolesToAdd = roleIds.filter((id) => !currentRoleIds.includes(id));
        const rolesToRemove = currentRoleIds.filter(
          (id) => !roleIds.includes(id)
        );

        // 批量處理角色變更
        const promises = [
          ...rolesToAdd.map((roleId) => assignRoleToUser({ userId, roleId })),
          ...rolesToRemove.map((roleId) => removeRoleFromUser(userId, roleId)),
        ];

        await Promise.all(promises);
        await userStore.fetchUsers();
      } catch (error) {
        console.error("更新用戶角色失敗:", error);
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
