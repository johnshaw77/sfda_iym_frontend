import axios from "axios";
import { ElMessage } from "element-plus";

// 創建 axios 實例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
    return Promise.reject(error);
  }
);

// 響應攔截器
service.interceptors.response.use(
  (response) => {
    const { data } = response;
    return data;
  },
  (error) => {
    const { response } = error;
    let message = "系統錯誤";

    if (response) {
      switch (response.status) {
        case 400:
          message = response.data.error || "請求參數錯誤";
          break;
        case 401:
          message = "未授權，請重新登入";
          // 這裡可以處理登出邏輯
          break;
        case 403:
          message = "拒絕訪問";
          break;
        case 404:
          message = "請求錯誤，未找到該資源";
          break;
        case 500:
          message = "伺服器錯誤";
          break;
        default:
          message = response.data.error || "系統錯誤";
      }
    }

    ElMessage.error(message);
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
    formData.append("file", file);
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
