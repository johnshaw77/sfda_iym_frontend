/**
 * @fileoverview 路由配置
 * @version 1.0.0
 * @since 2025-02-14
 * @description 先保存，後續再整合到 main.js 中
 */

import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import { ElMessage } from "element-plus";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/auth/Login.vue"),
    meta: {
      title: "登入",
      guest: true,
    },
  },
  {
    path: "/",
    name: "Layout",
    component: () => import("../layouts/MainLayout.vue"),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("../views/Home.vue"),
        meta: {
          title: "首頁",
        },
      },
      {
        path: "workflow/:id?",
        name: "Workflow",
        component: () => import("../views/workflow/index.vue"),
        meta: {
          title: "工作流程",
        },
      },
      {
        path: "workflow-templates",
        name: "WorkflowTemplates",
        component: () => import("../views/workflow-templates/index.vue"),
        meta: {
          title: "工作流程範本",
        },
      },
      {
        path: "workflow-templates/design/:id",
        name: "WorkflowTemplateDesign",
        component: () => import("../views/workflow-templates/design.vue"),
        meta: {
          title: "設計工作流程範本",
        },
      },
      {
        path: "rbac",
        name: "RBAC",
        component: () => import("@/views/rbac/index.vue"),
        meta: {
          title: "權限管理",
          permissions: [
            "MANAGE_ROLES",
            "VIEW_ROLES",
            "VIEW_PERMISSIONS",
            "MANAGE_USERS",
          ],
        },
        children: [
          {
            path: "users",
            name: "UserManagement",
            component: () =>
              import("@/views/rbac/components/UserManagement.vue"),
            meta: {
              title: "用戶管理",
              permissions: ["MANAGE_USERS"],
            },
          },
          {
            path: "roles",
            name: "RoleManagement",
            component: () =>
              import("@/views/rbac/components/RoleManagement.vue"),
            meta: {
              title: "角色管理",
              permissions: ["MANAGE_ROLES", "VIEW_ROLES"],
            },
          },
          {
            path: "permissions",
            name: "PermissionList",
            component: () =>
              import("@/views/rbac/components/PermissionList.vue"),
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
    ],
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

  // 需要認證的頁面
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!userStore.isAuthenticated) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else {
      // 檢查權限
      if (to.meta.permissions) {
        // 使用新的權限檢查方法
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
