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
          permissions: ["MANAGE_ROLES", "VIEW_ROLES", "VIEW_PERMISSIONS"],
        },
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

  // 獲取 token
  const token = localStorage.getItem("token");
  const userStore = useUserStore();

  // 需要認證的頁面
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
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
    if (token) {
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
