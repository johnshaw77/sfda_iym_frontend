import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";

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
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 15000, // 請求超時時間
});

// 請求攔截器
service.interceptors.request.use(
  (config) => {
    // 從 localStorage 獲取 token
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
  (error) => {
    console.error("響應錯誤:", error);

    // 根據錯誤類型設置不同的顯示時間
    let duration = 3000; // 預設 3 秒

    // 401 未授權錯誤（如登入失敗）設置為 30 秒
    if (error.response?.status === 401) {
      duration = 30000;
    }
    // 404 找不到資源，設置為 5 秒
    else if (error.response?.status === 404) {
      duration = 5000;
    }
    // 500 伺服器錯誤，設置為 8 秒
    else if (error.response?.status >= 500) {
      duration = 8000;
    }

    // 處理錯誤響應
    const message = error.response?.data?.message || "請求失敗";
    ElMessage.error({
      message,
      duration, // 使用根據錯誤類型設置的顯示時間
      showClose: true,
    });

    // 處理 401 未授權錯誤
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // 使用 Vue Router 進行導航
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
