import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";

// 引入 Font Awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faPlus,
  faMinus,
  faExpand,
  faCompress,
  faLock,
  faUnlock,
  faCog,
  faFileUpload,
  faGears,
  faChartLine,
  faTable,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";

// 添加圖標到庫中
library.add(
  faPlus,
  faMinus,
  faExpand,
  faCompress,
  faLock,
  faUnlock,
  faCog,
  faFileUpload,
  faGears,
  faChartLine,
  faTable,
  faClipboardCheck
);

const app = createApp(App);
app.use(ElementPlus);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
