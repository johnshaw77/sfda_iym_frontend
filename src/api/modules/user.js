import { request } from "../request";

// 用戶登入
export const login = (data) => request.post("/user/login", data);

// 用戶登出
export const logout = () => request.post("/user/logout");

// 獲取用戶資訊
export const getUserInfo = () => request.get("/user/info");

// 更新用戶資訊
export const updateUserInfo = (data) => request.put("/user/info", data);

// 更新用戶密碼
export const updatePassword = (data) => request.put("/user/password", data);

// 獲取用戶通知
export const getNotifications = (params) =>
  request.get("/user/notifications", params);

// 標記通知為已讀
export const markNotificationRead = (id) =>
  request.put(`/user/notifications/${id}/read`);

// 獲取用戶設置
export const getUserSettings = () => request.get("/user/settings");

// 更新用戶設置
export const updateUserSettings = (data) => request.put("/user/settings", data);

// 上傳用戶頭像
export const uploadAvatar = (file) => request.upload("/user/avatar", file);
