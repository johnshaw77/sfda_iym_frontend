import request from "@/api/request";

// FlowNodeDefinition API
export const getFlowNodeDefinitions = () => {
  return request({
    url: '/flow-node-definitions',
    method: 'get'
  })
}

export const createFlowNodeDefinition = (data) => {
  return request({
    url: '/flow-node-definitions',
    method: 'post',
    data
  })
}

export const updateFlowNodeDefinition = (id, data) => {
  return request({
    url: `/flow-node-definitions/${id}`,
    method: 'put',
    data
  })
}

export const deleteFlowNodeDefinition = (id) => {
  return request({
    url: `/flow-node-definitions/${id}`,
    method: 'delete'
  })
}

// FlowTemplate API
export const getFlowTemplates = () => {
  return request({
    url: '/flow-templates',
    method: 'get'
  })
}

export const getFlowTemplateById = (id) => {
  return request({
    url: `/flow-templates/${id}`,
    method: 'get'
  })
}

export const createFlowTemplate = (data) => {
  return request({
    url: '/flow-templates',
    method: 'post',
    data
  })
}

export const updateFlowTemplate = (id, data) => {
  return request({
    url: `/flow-templates/${id}`,
    method: 'put',
    data
  })
}

export const deleteFlowTemplate = (id) => {
  return request({
    url: `/flow-templates/${id}`,
    method: 'delete'
  })
} 

/**
 * 發布工作流程範本
 * @param {string} id - 範本 ID
 * @returns {Promise<Object>} - 發布後的範本
 */
export const publishFlowTemplate = (id) =>
  request.put(`/flow-templates/${id}/publish`);