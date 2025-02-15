import { defineStore } from "pinia";
import axios from "axios";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  uploadAvatar,
} from "@/api/modules/user";

// 定義系統中所有可能的權限
const ALL_PERMISSIONS = [
  "MANAGE_ROLES",
  "MANAGE_PERMISSIONS",
  "ASSIGN_ROLES",
  "VIEW_ROLES",
  "VIEW_PERMISSIONS",
  "MANAGE_USERS",
  "VIEW_USERS",
  "MANAGE_PROJECTS",
  "VIEW_PROJECTS",
];

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    userPermissions: [], // 用戶權限列表
    users: [], // 所有用戶列表
    usersLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) =>
      state.user?.role === "ADMIN" || state.user?.role === "SUPER_ADMIN",
    // 如果是管理員，返回所有權限；否則返回用戶實際擁有的權限
    effectivePermissions: (state) =>
      state.user?.role === "SUPER_ADMIN"
        ? ALL_PERMISSIONS
        : state.user?.role === "ADMIN"
        ? ALL_PERMISSIONS
        : state.userPermissions,

    hasPermission: (state) => (permission) => {
      if (state.user?.role === "SUPER_ADMIN" || state.user?.role === "ADMIN")
        return true;
      return state.userPermissions.includes(permission);
    },

    hasAnyPermission: (state) => (permissions) => {
      if (state.user?.role === "SUPER_ADMIN" || state.user?.role === "ADMIN")
        return true;
      return permissions.some((p) => state.userPermissions.includes(p));
    },

    hasAllPermissions: (state) => (permissions) => {
      if (state.user?.role === "SUPER_ADMIN" || state.user?.role === "ADMIN")
        return true;
      return permissions.every((p) => state.userPermissions.includes(p));
    },
  },

  actions: {
    // 認證相關
    async login(credentials) {
      try {
        const response = await axios.post("/api/auth/login", credentials);
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        this.user = user;

        if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
          await this.fetchUserPermissions();
        } else {
          this.userPermissions = ALL_PERMISSIONS;
        }

        return true;
      } catch (error) {
        console.error("登入失敗:", error);
        throw error;
      }
    },

    async logout() {
      localStorage.removeItem("token");
      this.user = null;
      this.userPermissions = [];
      this.users = [];
    },

    async fetchUser() {
      try {
        const response = await axios.get("/api/auth/me");
        this.user = response.data;

        if (this.user.role !== "SUPER_ADMIN" && this.user.role !== "ADMIN") {
          await this.fetchUserPermissions();
        } else {
          this.userPermissions = ALL_PERMISSIONS;
        }
      } catch (error) {
        console.error("獲取用戶信息失敗:", error);
        this.logout();
      }
    },

    // 權限相關
    async fetchUserPermissions() {
      try {
        if (this.user?.role === "SUPER_ADMIN" || this.user?.role === "ADMIN") {
          this.userPermissions = ALL_PERMISSIONS;
          return;
        }

        const response = await axios.get("/api/rbac/user-permissions");
        this.userPermissions = response.data;
      } catch (error) {
        console.error("獲取權限失敗:", error);
        this.userPermissions = [];
      }
    },

    // 用戶管理相關
    async fetchUsers() {
      this.usersLoading = true;
      try {
        const users = await getUsers();
        this.users = users;
      } catch (error) {
        console.error("獲取用戶列表失敗:", error);
        throw error;
      } finally {
        this.usersLoading = false;
      }
    },

    async createUser(userData) {
      try {
        const newUser = await createUser(userData);
        await this.fetchUsers();
        return newUser;
      } catch (error) {
        console.error("創建用戶失敗:", error);
        throw error;
      }
    },

    async updateUser(userId, userData) {
      try {
        await updateUser(userId, userData);
        await this.fetchUsers();
      } catch (error) {
        console.error("更新用戶失敗:", error);
        throw error;
      }
    },

    async deleteUser(userId) {
      try {
        await deleteUser(userId);
        await this.fetchUsers();
      } catch (error) {
        console.error("刪除用戶失敗:", error);
        throw error;
      }
    },

    async getUserRoles(userId) {
      try {
        return await getUserRoles(userId);
      } catch (error) {
        console.error("獲取用戶角色失敗:", error);
        throw error;
      }
    },

    async uploadUserAvatar(userId, file) {
      try {
        const response = await uploadAvatar(userId, file);
        await this.fetchUsers(); // 重新獲取用戶列表以更新頭像
        return response;
      } catch (error) {
        console.error("上傳頭像失敗:", error);
        throw error;
      }
    },
  },
});
