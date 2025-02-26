// frontend/src/modules/flow.js
import request from "../request";

// 獲取流程實例列表
export const getFlowInstances = (params) => {
  return request({
    url: "/flow-instances",
    method: "get",
    params,
  });
};

// 獲取單個流程實例
export const getFlowInstanceById = (instanceId) => {
  return request({
    url: `/flow-instances/${instanceId}`,
    method: "get",
  });
};

// 創建流程實例
export const createFlowInstance = (data) => {
  return request({
    url: BASE_PATH,
    method: "post",
    data: {
      projectId: data.projectId,
      templateId: data.templateId,
      nodes: data.nodes,
      edges: data.edges,
    },
  });
};

/**
 * 更新流程實例
 * @param {string} id - 流程實例ID
 * @param {Object} data - 更新數據
 * @returns {Promise} - 請求Promise
 */
export const updateFlowInstance = (id, data) => {
  return request({
    url: `/flow-instances/${id}`,
    method: "put",
    data,
  });
};

// 刪除流程實例
export const deleteFlowInstance = (instanceId) => {
  return request({
    url: `/flow-instances/${instanceId}`,
    method: "delete",
  });
};

// 開始執行流程實例
export const startFlowInstance = (instanceId) => {
  return request({
    url: `/flow-instances/${instanceId}/start`,
    method: "post",
  });
};

// 暫停流程實例
export const pauseFlowInstance = (instanceId) => {
  return request({
    url: `/flow-instances/${instanceId}/pause`,
    method: "post",
  });
};

// 繼續執行流程實例
export const resumeFlowInstance = (instanceId) => {
  return request({
    url: `/flow-instances/${instanceId}/resume`,
    method: "post",
  });
};

// 停止流程實例
export const stopFlowInstance = (instanceId) => {
  return request({
    url: `/flow-instances/${instanceId}/stop`,
    method: "post",
  });
};

// 執行節點
export const executeNode = (instanceId, nodeId, data) => {
  return request({
    url: `/flow-instances/${instanceId}/nodes/${nodeId}/execute`,
    method: "post",
    data,
  });
};

// 獲取實例日誌
export const getInstanceLogs = (instanceId) => {
  return request({
    url: `/flow-instances/${instanceId}/logs`,
    method: "get",
  });
};

// 獲取節點日誌
export const getNodeLogs = (instanceId, nodeId) => {
  return request({
    url: `/flow-instances/${instanceId}/nodes/${nodeId}/logs`,
    method: "get",
  });
};

// 獲取節點狀態
export const getNodeState = (instanceId, nodeId) => {
  return request({
    url: `/flow-instances/${instanceId}/nodes/${nodeId}/state`,
    method: "get",
  });
};

// 獲取節點上下文
export const getNodeContext = (instanceId, nodeId) => {
  return request({
    url: `/flow-instances/${instanceId}/nodes/${nodeId}/context`,
    method: "get",
  });
};

// 更新節點上下文
export const updateNodeContext = (instanceId, nodeId, data) => {
  return request({
    url: `/flow-instances/${instanceId}/nodes/${nodeId}/context`,
    method: "put",
    data,
  });
};

// 獲取流程實例統計信息
export const getInstanceStats = (instanceId) => {
  return request({
    url: `/flow-instances/${instanceId}/stats`,
    method: "get",
  });
};

// 重置流程實例
export const resetInstance = (instanceId) => {
  return request({
    url: `/flow-instances/${instanceId}/reset`,
    method: "post",
  });
};

// 批量獲取節點狀態
export const getNodesStates = (instanceId, nodeIds) => {
  return request({
    url: `/flow-instances/${instanceId}/nodes/states`,
    method: "get",
    params: { nodeIds: nodeIds.join(",") },
  });
};

export const getFlowNodeDefinitions = () => {
  return request({
    url: "/flow-node-definitions",
    method: "get",
  });
};

export const createFlowNodeDefinition = (data) => {
  return request({
    url: "/flow-node-definitions",
    method: "post",
    data,
  });
};

export const updateFlowNodeDefinition = (id, data) => {
  return request({
    url: `/flow-node-definitions/${id}`,
    method: "put",
    data,
  });
};

export const deleteFlowNodeDefinition = (id) => {
  return request({
    url: `/flow-node-definitions/${id}`,
    method: "delete",
  });
};

// FlowTemplate API
export const getFlowTemplates = () => {
  return request({
    url: "/flow-templates",
    method: "get",
  });
};

export const getFlowTemplateById = (id) => {
  return request({
    url: `/flow-templates/${id}`,
    method: "get",
  });
};

export const createFlowTemplate = (data) => {
  return request({
    url: "/flow-templates",
    method: "post",
    data,
  });
};

export const updateFlowTemplate = (id, data) => {
  return request({
    url: `/flow-templates/${id}`,
    method: "put",
    data,
  });
};

export const deleteFlowTemplate = (id) => {
  return request({
    url: `/flow-templates/${id}`,
    method: "delete",
  });
};

/**
 * 發布工作流程範本
 * @param {string} id - 範本 ID
 * @returns {Promise<Object>} - 發布後的範本
 */
export const publishFlowTemplate = (id) =>
  request.put(`/flow-templates/${id}/publish`);
