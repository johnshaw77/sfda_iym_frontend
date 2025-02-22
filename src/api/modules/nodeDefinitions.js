import request from "@/api/request";

// 獲取所有節點定義
export const getNodeDefinitions = () => {
  return request.get("/node-definitions");
};

// 獲取單個節點定義
export const getNodeDefinition = (id) => {
  return request.get(`/node-definitions/${id}`);
};

// 創建節點定義
export const createNodeDefinition = (data) => {
  return request.post("/node-definitions", data);
};

// 更新節點定義
export const updateNodeDefinition = (id, data) => {
  return request.put(`/node-definitions/${id}`, data);
};

// 刪除節點定義
export const deleteNodeDefinition = (id) => {
  return request.delete(`/node-definitions/${id}`);
};
