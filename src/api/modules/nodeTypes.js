import request from "@/api/request";

// 獲取所有節點定義
export const getNodeDefinitions = () => {
  return request.get("/node-definitions");
};

// 獲取單個節點定義
export const getNodeDefinition = (typeKey) => {
  return request.get(`/node-definitions/${typeKey}`);
};

// 創建節點定義
export const createNodeDefinition = (data) => {
  return request.post("/node-definitions", data);
};

// 更新節點定義
export const updateNodeDefinition = (typeKey, data) => {
  return request.put(`/node-definitions/${typeKey}`, data);
};

// 刪除節點定義
export const deleteNodeDefinition = (typeKey) => {
  return request.delete(`/node-definitions/${typeKey}`);
};
