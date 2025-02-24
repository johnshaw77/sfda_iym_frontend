/**
 * @fileoverview 路由配置
 * @version 1.0.0
 * @since 2025-02-14
 * @description !!注意: meta 的 showContentHeader 除了影響 content-header 的顯示外，
 * 如果子頁面有用到 Teleport 就一定要設成 true
 */

import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import { ElMessage } from "element-plus";

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
      icon: "User",
    },
  },
  {
    path: "/",
    redirect: "/home",
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/home/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
      title: "首頁",
      icon: "Home",
      showContentHeader: false,
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
      icon: "WalletCards",
      showContentHeader: true,
    },
  },
  {
    path: "/workflow",
    name: "Workflow",
    component: () => import("@/views/workflow/index.vue"),
    meta: {
      keepAlive: false,
      requiresAuth: true,
      title: "工作流程",
      icon: "GitGraph",
      showContentHeader: true,
    },
  },

  {
    path: "/flow-node-definitions",
    name: "FlowNodeDefinitions",
    component: () => import("@/views/flow/FlowNodeDefinitionList.vue"),
    meta: {
      title: "節點定義管理",
      icon: "Component",
      requiresAuth: true,
      requiresAdmin: true,
      showContentHeader: true,
    },
  },
  {
    path: "/flow-templates",
    name: "FlowTemplates",
    component: () => import("@/views/flow/FlowTemplateList.vue"),
    meta: {
      title: "流程模板管理",
      icon: "Workflow",
      requiresAuth: true,
      requiresAdmin: true,
      showContentHeader: true,
    },
  },
  {
    path: "/flow-templates/:id/design",
    name: "FlowTemplateDesign",
    component: () => import("@/views/flow/FlowTemplateDesign.vue"),
    meta: {
      title: "流程模板設計",
      icon: "Workflow",
      requiresAuth: true,
      requiresAdmin: true,
      showContentHeader: true,
      hidden: true,
    },
  },
  {
    path: "/flow-instances",
    name: "FlowInstances",
    component: () => import("@/views/flow/FlowInstanceList.vue"),
    meta: {
      title: "流程實例管理",
      icon: "GitBranch",
      keepAlive: true,
      requiresAuth: true,
      showContentHeader: true,
    },
  },
  {
    path: "/flow-instances/:id",
    name: "FlowInstanceDetail",
    component: () => import("@/views/flow/FlowInstanceDetail.vue"),
    meta: {
      title: "流程實例詳情",
      icon: "GitBranch",
      requiresAuth: true,
      showContentHeader: true,
      hidden: true,
    },
  },
  {
    path: "/flow-documents",
    name: "FlowDocuments",
    component: () => import("@/views/flow/FlowDocumentList.vue"),
    meta: {
      title: "文檔管理",
      icon: "FileText",
      requiresAuth: true,
      showContentHeader: true,
    },
  },
  // {
  //   path: "/files",
  //   name: "Files",
  //   component: () => import("@/views/files/index.vue"),
  //   meta: {
  //     keepAlive: true,
  //     requiresAuth: true,
  //     title: "文件管理",
  //     icon: "FileText",
  //     showContentHeader: true,
  //   },
  // },
  // {
  //   path: "/analysis",
  //   name: "Analysis",
  //   component: () => import("@/views/analysis/index.vue"),
  //   meta: {
  //     keepAlive: true,
  //     requiresAuth: true,
  //     title: "數據分析",
  //     icon: "LineChart",
  //     showContentHeader: true,
  //   },
  // },
  // {
  //   path: "/settings",
  //   name: "Settings",
  //   component: () => import("@/views/settings/index.vue"),
  //   meta: {
  //     keepAlive: true,
  //     requiresAuth: true,
  //     requiresAdmin: true,
  //     title: "系統設置",
  //     icon: "Settings",
  //     showContentHeader: true,
  //   },
  // },
  {
    path: "/rbac",
    name: "RBAC",
    component: () => import("@/views/rbac/index.vue"),
    meta: {
      title: "權限管理",
      icon: "KeyRound",
      permissions: ["MANAGE_ROLES", "VIEW_ROLES", "VIEW_PERMISSIONS"],
      showContentHeader: false,
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
    },
  },
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
    // 如果沒有用戶資訊但有 token，先獲取用戶資訊
    if ((!userStore.user || !userStore.isAuthenticated) && token) {
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

    // 如果沒有認證，轉到登入頁
    if (!userStore.isAuthenticated) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
      return;
    }

    // 檢查管理員權限
    if (to.meta.requiresAdmin && !userStore.isAdmin) {
      ElMessage.error("需要管理員權限");
      next(from.path);
      return;
    }

    // 檢查特定權限
    if (
      to.meta.permissions &&
      !userStore.hasAnyPermission(to.meta.permissions)
    ) {
      ElMessage.error("權限不足");
      next(from.path);
      return;
    }

    next();
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
