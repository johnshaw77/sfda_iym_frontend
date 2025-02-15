import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";
import zhTw from "element-plus/dist/locale/zh-tw.mjs";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { ElMessage } from "element-plus";
import { useUserStore } from "./stores/user";

// 配置 NProgress
NProgress.configure({
  easing: "ease",
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
});

// 引入 Lucide Icons
import {
  LineChart,
  FileText,
  Settings,
  Plus,
  User,
  Upload,
  Cog,
  Table,
  ClipboardCheck,
  X,
  Bell,
  UserCircle,
  GitGraph,
  Download,
  Trash,
  Eye,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Workflow,
} from "lucide-vue-next";

// 路由配置
const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("./views/auth/Login.vue"),
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
    component: () => import("./views/projects/index.vue"),
    meta: {
      keepAlive: true,
      requiresAuth: true,
      title: "專案管理",
      icon: FolderKanban,
    },
  },
  {
    path: "/workflow",
    name: "Workflow",
    component: () => import("./views/workflow/index.vue"),
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
    component: () => import("./views/workflow-templates/index.vue"),
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
    component: () => import("./views/workflow-templates/design.vue"),
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
    component: () => import("./views/files/index.vue"),
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
    component: () => import("./views/analysis/index.vue"),
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
    component: () => import("./views/settings/index.vue"),
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
    component: () => import("./views/api-test/index.vue"),
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
router.beforeEach((to, from, next) => {
  NProgress.start();

  const userStore = useUserStore();

  // 檢查是否需要認證
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const isGuest = to.matched.some((record) => record.meta.guest);

  if (requiresAuth && !userStore.isAuthenticated) {
    next({ path: "/login", query: { redirect: to.fullPath } });
  } else if (isGuest && userStore.isAuthenticated) {
    next("/");
  } else if (requiresAdmin && !userStore.isAdmin) {
    ElMessage.error("需要管理員權限");
    next("/");
  } else {
    next();
  }
});

router.afterEach(() => {
  NProgress.done();
});

// 創建應用實例
const app = createApp(App);

// 創建 Pinia 實例
const pinia = createPinia();

// 使用插件
app.use(ElementPlus, {
  locale: zhTw,
});
app.use(router);
app.use(pinia); // 使用 Pinia

// 註冊 Lucide 圖標
const icons = {
  LineChart,
  FileText,
  Settings,
  Plus,
  User,
  Upload,
  Cog,
  Table,
  ClipboardCheck,
  X,
  Bell,
  UserCircle,
  GitGraph,
  Download,
  Trash,
  Eye,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Workflow,
};

Object.entries(icons).forEach(([name, component]) => {
  app.component(name, component);
});

// 掛載應用
app.mount("#app");
