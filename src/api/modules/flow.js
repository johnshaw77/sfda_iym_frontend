import request from "@/api/request";

// FlowNodeDefinition API
export const getNodeDefinitions = () => {
  return request({
    url: '/flow-node-definitions',
    method: 'get'
  })
}

export const createNodeDefinition = (data) => {
  return request({
    url: '/flow-node-definitions',
    method: 'post',
    data
  })
}

export const updateNodeDefinition = (id, data) => {
  return request({
    url: `/flow-node-definitions/${id}`,
    method: 'put',
    data
  })
}

export const deleteNodeDefinition = (id) => {
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