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

import * as LucideIcons from "lucide-vue-next";
// 註冊所有圖示
// 全局註冊的方式只允許在 template 中使用元件標籤（如 <Save />），但不能直接作為值傳遞
Object.entries(LucideIcons).forEach(([name, component]) => {
  app.component(name, component)
})

// 使用路由
app.use(router);

// 初始化用戶狀態並啟動應用
initializeUserState().then(() => {
  app.mount("#app");
});
