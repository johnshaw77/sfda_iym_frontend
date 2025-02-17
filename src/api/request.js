import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";
import { getApiBaseUrl } from "@/utils/url";
import { useUserStore } from "@/stores/user";

/**
 * 生成安全的檔案名
 * @param {File} file - 原始檔案
 * @returns {string} 安全的檔案名
 */
const generateSafeFileName = (file) => {
  // 獲取檔案副檔名
  const ext = file.name.split(".").pop().toLowerCase();
  // 生成時間戳
  const timestamp = new Date().getTime();
  // 生成 6 位隨機字串
  const randomStr = Math.random().toString(36).substring(2, 8);
  // 組合新檔案名：時間戳_隨機字串.副檔名
  return `${timestamp}_${randomStr}.${ext}`;
};

// 創建 axios 實例
const service = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000, // 請求超時時間
});

// 請求攔截器
service.interceptors.request.use(
  (config) => {
    // 直接從 localStorage 獲取 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // 如果是 FormData，不要設置 Content-Type，讓瀏覽器自動設置
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    console.error("請求錯誤:", error);
    return Promise.reject(error);
  }
);

// 響應攔截器
service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    console.error("響應錯誤:", error);

    // 處理錯誤響應
    const message = error.response?.data?.message || "請求失敗";
    ElMessage.error({
      message,
      duration: 3000,
      showClose: true,
    });

    // 只有在非 /auth 相關的請求發生 401 時才自動登出
    if (error.response?.status === 401 && !error.config.url.includes("/auth")) {
      const userStore = useUserStore();
      // 清除 token 和用戶信息
      localStorage.removeItem("token");
      userStore.$reset();

      // 只在非登入頁時重定向
      if (router.currentRoute.value.path !== "/login") {
        router.push({
          path: "/login",
          query: { redirect: router.currentRoute.value.fullPath },
        });
      }
    }

    return Promise.reject(error);
  }
);

// 封裝請求方法
export const request = {
  get: (url, params) => service.get(url, { params }),
  post: (url, data, config = {}) => service.post(url, data, config),
  put: (url, data) => service.put(url, data),
  delete: (url) => service.delete(url),
  upload: (url, file) => {
    const formData = new FormData();
    // 使用安全的檔案名
    const safeFileName = generateSafeFileName(file);
    formData.append("file", file, safeFileName);
    // 添加原始檔案名，以便後端記錄
    formData.append("originalName", file.name);

    return service.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  download: (url, params) =>
    service.get(url, {
      params,
      responseType: "blob",
    }),
};

export default service;
