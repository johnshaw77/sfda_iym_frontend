import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";
import zhTw from "element-plus/dist/locale/zh-tw.mjs";

// 引入 Font Awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faChartLine,
  faFileAlt,
  faCog,
  faPlus,
  faUser,
  faFileUpload,
  faGears,
  faTable,
  faClipboardCheck,
  faTimes,
  faUpload,
  faBell,
  faUserCircle,
  faProjectDiagram,
  faDownload,
  faTrash,
  faEye,
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";

// 添加圖標到庫中
library.add(
  faChartLine,
  faFileAlt,
  faCog,
  faPlus,
  faUser,
  faFileUpload,
  faGears,
  faTable,
  faClipboardCheck,
  faTimes,
  faUpload,
  faBell,
  faUserCircle,
  faProjectDiagram,
  faDownload,
  faTrash,
  faEye,
  faAngleLeft,
  faAngleRight
);

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
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
