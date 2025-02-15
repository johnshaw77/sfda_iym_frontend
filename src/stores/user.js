import { defineStore } from "pinia";
import axios from "axios";

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
    async login(credentials) {
      try {
        const response = await axios.post("/api/auth/login", credentials);
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        this.user = user;

        // 如果不是管理員才需要獲取具體權限
        if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
          await this.fetchUserPermissions();
        } else {
          // 管理員直接賦予所有權限
          this.userPermissions = ALL_PERMISSIONS;
        }

        return true;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },

    async fetchUserPermissions() {
      try {
        // 如果是管理員，直接返回所有權限
        if (this.user?.role === "SUPER_ADMIN" || this.user?.role === "ADMIN") {
          this.userPermissions = ALL_PERMISSIONS;
          return;
        }

        const response = await axios.get("/api/rbac/user-permissions");
        this.userPermissions = response.data;
      } catch (error) {
        console.error("Fetch permissions error:", error);
        this.userPermissions = [];
      }
    },

    async logout() {
      localStorage.removeItem("token");
      this.user = null;
      this.userPermissions = [];
    },

    async fetchUser() {
      try {
        const response = await axios.get("/api/auth/me");
        this.user = response.data;

        // 如果不是管理員才需要獲取具體權限
        if (this.user.role !== "SUPER_ADMIN" && this.user.role !== "ADMIN") {
          await this.fetchUserPermissions();
        } else {
          // 管理員直接賦予所有權限
          this.userPermissions = ALL_PERMISSIONS;
        }
      } catch (error) {
        console.error("Fetch user error:", error);
        this.logout();
      }
    },
  },
});
