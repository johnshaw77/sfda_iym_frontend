import { defineStore } from "pinia";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  uploadAvatar,
} from "@/api/modules/user";
import {
  login,
  logout,
  getCurrentUser,
  getUserPermissions,
} from "@/api/modules/auth";
import { ref, computed } from "vue";

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

export const useUserStore = defineStore("user", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token") || null);
  const userPermissions = ref([]);
  const users = ref([]);
  const usersLoading = ref(false);

  const isAuthenticated = computed(() => !!token.value);

  // 檢查是否有任一權限
  const hasAnyPermission = (permissions) => {
    console.log("hasAnyPermission", permissions, user.value?.roles);

    const tt = user.value.roles.some(
      (role) => role.name === "ADMIN" || role.name === "SUPERADMIN"
    );
    console.log("tt", tt);
    if (!user.value?.roles) return false;

    // 如果是超級管理員，直接返回 true
    if (
      user.value.roles.some(
        (role) => role.name === "ADMIN" || role.name === "SUPERADMIN"
      )
    ) {
      return true;
    }

    // 獲取用戶所有權限
    const userPermissions = new Set();
    user.value.roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        userPermissions.add(permission.name);
      });
    });

    // 檢查是否有任一所需權限
    return Array.isArray(permissions)
      ? permissions.some((permission) => userPermissions.has(permission))
      : userPermissions.has(permissions);
  };

  // 檢查是否有所有權限
  const hasAllPermissions = (permissions) => {
    if (!user.value?.roles) return false;

    // 如果是超級管理員，直接返回 true
    if (user.value.roles.some((role) => role.name === "SUPERADMIN")) {
      return true;
    }

    // 獲取用戶所有權限
    const userPermissions = new Set();
    user.value.roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        userPermissions.add(permission.name);
      });
    });

    // 檢查是否有所有所需權限
    return Array.isArray(permissions)
      ? permissions.every((permission) => userPermissions.has(permission))
      : userPermissions.has(permissions);
  };

  // 檢查是否有特定角色
  const hasRole = (roleName) => {
    return user.value?.roles.some((role) => role.name === roleName) || false;
  };

  // 檢查是否為管理員
  const isAdmin = computed(() => {
    return (
      user.value?.roles.some((role) =>
        ["ADMIN", "SUPERADMIN"].includes(role.name)
      ) || false
    );
  });

  // 登入
  const handleLogin = async (credentials) => {
    try {
      const response = await login(credentials);
      console.log("登入回應:", response); // 用於調試

      // 檢查回應格式
      if (!response.data) {
        throw new Error("伺服器回應格式錯誤");
      }

      const { token: newToken, user: userData } = response.data;

      if (!newToken || !userData) {
        throw new Error("伺服器回應缺少必要資料");
      }

      token.value = newToken;
      user.value = userData;
      localStorage.setItem("token", newToken);

      // 獲取用戶所有權限
      const permissionSet = new Set();
      if (userData.roles) {
        userData.roles.forEach((role) => {
          if (role.permissions) {
            role.permissions.forEach((permission) => {
              permissionSet.add(permission.name);
            });
          }
        });
      }

      // 設置用戶權限
      userPermissions.value = Array.from(permissionSet);

      return response;
    } catch (error) {
      console.error("登入失敗:", error);
      if (error.response?.message) {
        throw new Error(error.response.message);
      } else {
        throw new Error(error.message || "登入失敗，請稍後再試");
      }
    }
  };

  // 登出
  const handleLogout = async () => {
    try {
      await logout();
      token.value = null;
      user.value = null;
      localStorage.removeItem("token");
      userPermissions.value = [];
      users.value = [];
    } catch (error) {
      console.error("登出失敗:", error);
      throw error;
    }
  };

  // 獲取當前用戶信息
  const fetchUser = async () => {
    try {
      const response = await getCurrentUser();
      user.value = response.data;

      // 根據用戶角色設置權限
      if (user.value.role === "ADMIN" || user.value.role === "SUPER_ADMIN") {
        userPermissions.value = ALL_PERMISSIONS;
      } else if (user.value.role === "POWERUSER") {
        userPermissions.value = [
          "VIEW_PROJECTS",
          "CREATE_PROJECTS",
          "EDIT_PROJECTS",
        ];
      } else if (user.value.role === "READER") {
        userPermissions.value = ["VIEW_PROJECTS"];
      } else {
        userPermissions.value = [];
      }

      return response;
    } catch (error) {
      console.error("獲取用戶信息失敗:", error);
      throw error;
    }
  };

  // 權限相關
  const fetchUserPermissions = async () => {
    try {
      if (user.value?.role === "SUPER_ADMIN" || user.value?.role === "ADMIN") {
        userPermissions.value = ALL_PERMISSIONS;
        return;
      }

      const permissions = await getUserPermissions();
      userPermissions.value = permissions;
    } catch (error) {
      console.error("獲取權限失敗:", error);
      userPermissions.value = [];
    }
  };

  // 用戶管理相關
  const fetchUsers = async () => {
    usersLoading.value = true;
    try {
      const response = await getUsers();
      users.value = response;
    } catch (error) {
      console.error("獲取用戶列表失敗:", error);
      throw error;
    } finally {
      usersLoading.value = false;
    }
  };

  // 創建用戶
  const createUser = async (userData) => {
    try {
      const newUser = await createUser(userData);
      await fetchUsers();
      return newUser;
    } catch (error) {
      console.error("創建用戶失敗:", error);
      throw error;
    }
  };

  // 更新用戶
  const updateUser = async (userId, userData) => {
    try {
      await updateUser(userId, userData);
      await fetchUsers();
    } catch (error) {
      console.error("更新用戶失敗:", error);
      throw error;
    }
  };

  // 刪除用戶
  const deleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error("刪除用戶失敗:", error);
      throw error;
    }
  };

  // 獲取用戶角色
  const getUserRoles = async (userId) => {
    try {
      return await getUserRoles(userId);
    } catch (error) {
      console.error("獲取用戶角色失敗:", error);
      throw error;
    }
  };

  // 上傳用戶頭像
  const uploadUserAvatar = async (userId, file) => {
    try {
      const response = await uploadAvatar(userId, file);
      await fetchUsers(); // 重新獲取用戶列表以更新頭像
      return response;
    } catch (error) {
      console.error("上傳頭像失敗:", error);
      throw error;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    handleLogin,
    handleLogout,
    fetchUser,
    userPermissions,
    users,
    usersLoading,
    fetchUserPermissions,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserRoles,
    uploadUserAvatar,
  };
});
