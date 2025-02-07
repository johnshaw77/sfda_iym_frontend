import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";
import zhTw from "element-plus/dist/locale/zh-tw.mjs";

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
} from "lucide-vue-next";

// 路由配置
const routes = [
  {
    path: "/",
    redirect: "/workflow",
  },
  {
    path: "/workflow",
    name: "Workflow",
    component: () => import("./views/WorkflowView.vue"),
  },
  {
    path: "/files",
    name: "Files",
    component: () => import("./views/FilesView.vue"),
  },
  {
    path: "/analysis",
    name: "Analysis",
    component: () => import("./views/AnalysisView.vue"),
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("./views/SettingsView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(ElementPlus, {
  locale: zhTw,
});
app.use(router);

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
};

Object.entries(icons).forEach(([name, component]) => {
  app.component(name, component);
});

app.mount("#app");
