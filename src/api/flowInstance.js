/**
 * 更新流程實例
 * @param {string} instanceId - 流程實例ID
 * @param {object} data - 更新數據
 * @returns {Promise<object>} - 更新後的流程實例
 */
export const updateFlowInstance = (instanceId, data) => {
  return request({
    url: `/flow-instances/${instanceId}`,
    method: "put",
    data,
  });
};
