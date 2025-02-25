// 節點執行狀態
export const FlowNodeState = {
  IDLE: "idle",
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  ERROR: "error",
  SKIPPED: "skipped",
};

// 節點執行狀態管理
export class FlowExecutor {
  constructor() {
    this.nodeStates = new Map();
    this.executionQueue = [];
    this.currentNode = null;
  }

  // 設置節點狀態
  setNodeState(nodeId, state) {
    this.nodeStates.set(nodeId, {
      state,
      timestamp: Date.now(),
      logs: [],
    });
  }

  // 添加執行日誌
  addNodeLog(nodeId, log) {
    const nodeState = this.nodeStates.get(nodeId);
    if (nodeState) {
      nodeState.logs.push({
        timestamp: Date.now(),
        message: log,
      });
    }
  }

  // 獲取下一個可執行的節點
  getNextExecutableNodes(nodes, edges) {
    return nodes.filter((node) => {
      // 檢查所有輸入節點是否已完成
      const inputEdges = edges.filter((edge) => edge.target === node.id);
      return inputEdges.every((edge) => {
        const sourceState = this.nodeStates.get(edge.source);
        return sourceState?.state === FlowNodeState.COMPLETED;
      });
    });
  }
}
