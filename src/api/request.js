import axios from "axios";
import { ElMessage } from "element-plus";

// 創建 axios 實例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api", // 從環境變數獲取 baseURL
  timeout: 15000, // 請求超時時間
  headers: {
    "Content-Type": "application/json",
  },
});

// 請求攔截器
service.interceptors.request.use(
  (config) => {
    // 從 localStorage 獲取 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// 響應攔截器
service.interceptors.response.use(
  (response) => {
    const { data } = response;

    // 這裡假設後端返回的數據結構為 { code, data, message }
    if (data.code === 200) {
      return data.data;
    }

    // 處理其他狀態碼
    ElMessage.error(data.message || "請求失敗");
    return Promise.reject(new Error(data.message || "請求失敗"));
  },
  (error) => {
    // 處理 HTTP 錯誤狀態
    const message =
      {
        400: "請求錯誤",
        401: "未授權，請重新登入",
        403: "拒絕訪問",
        404: "請求地址出錯",
        408: "請求超時",
        500: "伺服器內部錯誤",
        501: "服務未實現",
        502: "網關錯誤",
        503: "服務不可用",
        504: "網關超時",
        505: "HTTP版本不受支援",
      }[error.response?.status] || "網路異常";

    ElMessage.error(message);

    // 如果是 401 未授權，清除 token 並重新登入
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // 重定向到登入頁
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// 封裝請求方法
export const request = {
  get: (url, params) => service.get(url, { params }),
  post: (url, data) => service.post(url, data),
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
