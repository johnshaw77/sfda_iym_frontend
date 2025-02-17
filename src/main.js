import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";
import zhTw from "element-plus/dist/locale/zh-tw.mjs";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useUserStore } from "./stores/user";
import router from "./router";

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
  // 導航/選單圖標
  LineChart,
  FileText,
  Settings,
  GitGraph,
  Workflow,
  WalletCards,
  KeyRound,
  Cog,
  Home,
  Component,

  // 通用操作圖標
  Plus,
  Upload,
  Download,
  Trash,
  Eye,
  X,
  Edit,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  UserCircle,
  Table,
  ClipboardCheck,
  Shield,
  LogOut,
  FolderKanban,
  Search,
  Edit2,
  Send,
  Archive,
  Trash2,
  Pencil,
  RotateCw,
  MoreVertical,
  Tag,
  Calendar,
} from "lucide-vue-next";

// 創建應用實例
const app = createApp(App);

// 創建 Pinia 實例
const pinia = createPinia();
app.use(pinia);

// 修改初始化函數
const initializeUserState = async () => {
  const userStore = useUserStore();
  const token = localStorage.getItem("token");

  if (token) {
    try {
      await userStore.fetchUser();
    } catch (error) {
      console.error("恢復用戶狀態失敗:", error);
      localStorage.removeItem("token");
    }
  }
};

// 配置 Element Plus
app.use(ElementPlus, {
  locale: zhTw,
});

// 註冊 Lucide Icons
const icons = {
  // 導航/選單圖標
  LineChart,
  FileText,
  Settings,
  GitGraph,
  Workflow,
  WalletCards,
  KeyRound,
  Cog,
  Home,
  Component,

  // 通用操作圖標
  Plus,
  Upload,
  Download,
  Trash,
  Eye,
  X,
  Edit,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  UserCircle,
  Table,
  ClipboardCheck,
  Shield,
  LogOut,
  FolderKanban,
  Search,
  Edit2,
  Send,
  Archive,
  Trash2,
  Pencil,
  RotateCw,
  MoreVertical,
  Tag,
  Calendar,
};

Object.entries(icons).forEach(([name, component]) => {
  app.component(name, component);
});

// 使用路由
app.use(router);

// 初始化用戶狀態並啟動應用
initializeUserState().then(() => {
  app.mount("#app");
});
