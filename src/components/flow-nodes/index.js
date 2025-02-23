import ComplaintSelectorNode from "./business/ComplaintSelectorNode.vue";
import TopDefectsNode from "./business/TopDefectsNode.vue";
import StatisticProcessNode from "./business/StatisticProcessNode.vue";
import HttpRequestNode from "./base/HttpRequestNode.vue";

// 註冊所有節點
export const registerNodes = (vueFlow) => {
  // 業務節點
  vueFlow.addNode("complaint-selector", ComplaintSelectorNode);
  vueFlow.addNode("custom-process", TopDefectsNode);
  vueFlow.addNode("statistic-process", StatisticProcessNode);
  vueFlow.addNode("http-request", HttpRequestNode);
};

// 導出所有節點組件
export const nodes = {
  ComplaintSelectorNode,
  TopDefectsNode,
  StatisticProcessNode,
  HttpRequestNode,
};

export default {
  registerNodes,
  nodes,
};
