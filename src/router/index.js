/**
 * @fileoverview 路由配置
 * @version 1.0.0
 * @since 2025-02-14
 * @description
 */

import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import { ElMessage } from "element-plus";
import {
  User,
  Settings,
  FileText,
  LineChart,
  GitGraph,
  Workflow,
  WalletCards,
  KeyRound,
  Cog,
} from "lucide-vue-next";

// 路由配置
const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/Login.vue"),
    meta: {
      guest: true,
      requiresAuth: false,
      layout: "blank",
      title: "登入",
      icon: User,
    },
  },
  {
    path: "/",
    redirect: "/projects",
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/projects",
    name: "Projects",
    component: () => import("@/views/projects/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
      title: "專案管理",
      icon: WalletCards,
    },
  },
  {
    path: "/workflow",
    name: "Workflow",
    component: () => import("@/views/workflow/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
      title: "工作流程",
      icon: GitGraph,
    },
  },
  {
    path: "/workflow-templates",
    name: "WorkflowTemplates",
    component: () => import("@/views/workflow-templates/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
      requiresAdmin: true,
      title: "工作流程範本",
      icon: Workflow,
    },
  },
  {
    path: "/workflow-templates/:id/design",
    name: "WorkflowTemplateDesign",
    component: () => import("@/views/workflow-templates/design.vue"),
    meta: {
      keepAlive: false,
      requiresAuth: true,
      requiresAdmin: true,
      title: "工作流程範本設計",
      showContentHeader: false,
      hidden: true,
      icon: Workflow,
    },
  },
  {
    path: "/files",
    name: "Files",
    component: () => import("@/views/files/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
      title: "文件管理",
      icon: FileText,
    },
  },
  {
    path: "/analysis",
    name: "Analysis",
    component: () => import("@/views/analysis/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
      title: "數據分析",
      icon: LineChart,
    },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/views/settings/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
      title: "系統設置",
      icon: Settings,
    },
  },
  {
    path: "/rbac",
    name: "RBAC",
    component: () => import("@/views/rbac/index.vue"),
    meta: {
      title: "權限管理",
      icon: KeyRound,
      permissions: ["MANAGE_ROLES", "VIEW_ROLES", "VIEW_PERMISSIONS"],
    },
    children: [
      {
        path: "roles",
        name: "RoleManagement",
        component: () => import("@/views/rbac/components/RoleManagement.vue"),
        meta: {
          title: "角色管理",
          permissions: ["MANAGE_ROLES", "VIEW_ROLES"],
        },
      },
      {
        path: "permissions",
        name: "PermissionList",
        component: () => import("@/views/rbac/components/PermissionList.vue"),
        meta: {
          title: "權限列表",
          permissions: ["VIEW_PERMISSIONS"],
        },
      },
      {
        path: "user-roles",
        name: "UserRoleManagement",
        component: () =>
          import("@/views/rbac/components/UserRoleManagement.vue"),
        meta: {
          title: "用戶角色",
          permissions: ["ASSIGN_ROLES", "VIEW_ROLES"],
        },
      },
    ],
  },
  {
    path: "/api-test",
    name: "ApiTest",
    component: () => import("@/views/api-test/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
      requiresAdmin: true,
      title: "API 測試",
      showContentHeader: false,
      icon: Cog,
    },
  },

  // {
  //   path: "/workflow-test",
  //   name: "WorkflowTest",
  //   component: () => import("./views/workflow-test/index.vue"),
  //   meta: {
  //     keepAlive: true,
  //   },
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守衛
router.beforeEach(async (to, from, next) => {
  // 設置頁面標題
  document.title = `${to.meta.title} - SFDA IYM` || "SFDA IYM";

  const userStore = useUserStore();
  const token = localStorage.getItem("token");

  // 需要認證的頁面
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!userStore.isAuthenticated && token) {
      try {
        await userStore.fetchUser();
      } catch (error) {
        localStorage.removeItem("token");
        next({
          path: "/login",
          query: { redirect: to.fullPath },
        });
        return;
      }
    }

    if (!userStore.isAuthenticated) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else {
      // 檢查權限
      if (to.meta.permissions) {
        const hasPermission = userStore.hasAnyPermission(to.meta.permissions);
        if (!hasPermission) {
          ElMessage.error("權限不足");
          next(from.path);
          return;
        }
      }
      next();
    }
  }
  // 訪客頁面（如登入頁）
  else if (to.matched.some((record) => record.meta.guest)) {
    if (userStore.isAuthenticated) {
      next("/");
    } else if (token) {
      try {
        await userStore.fetchUser();
        next("/");
      } catch (error) {
        localStorage.removeItem("token");
        next();
      }
    } else {
      next();
    }
  }
  // 其他頁面
  else {
    next();
  }
});

export default router;
