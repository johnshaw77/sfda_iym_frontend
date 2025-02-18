import ComplaintSelectorNode from "./business/ComplaintSelectorNode.vue";

// 註冊所有節點
export const registerNodes = (vueFlow) => {
  // 業務節點
  vueFlow.addNode("complaint-selector", ComplaintSelectorNode);
};

// 導出所有節點組件
export const nodes = {
  ComplaintSelectorNode,
};

export default {
  registerNodes,
  nodes,
};
