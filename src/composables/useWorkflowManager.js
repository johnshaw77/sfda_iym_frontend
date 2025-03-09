import { ref, computed, watch } from "vue";
import { useFlowStore } from "@/stores/flowStore";
import { useFlowInstance } from "@/composables/useFlowInstance";

/**
 * 工作流管理器 Composable
 * 負責處理工作流的流轉邏輯，包括節點的執行、狀態管理和數據傳遞
 */
export function useWorkflowManager() {
  const flowStore = useFlowStore();
  const { updateSharedData, getSharedData } = useFlowInstance();

  // 當前正在執行的節點ID
  const currentExecutingNodeId = ref(null);
  // 執行隊列
  const executionQueue = ref([]);
  // 執行歷史
  const executionHistory = ref([]);
  // 是否正在執行
  const isExecuting = ref(false);
  // 執行錯誤
  const executionError = ref(null);

  /**
   * 獲取節點的下一個節點
   * @param {string} nodeId - 當前節點ID
   * @returns {Array} - 下一個節點的ID數組
   */
  const getNextNodes = (nodeId) => {
    if (!flowStore.currentInstance?.edges) {
      return [];
    }

    // 找出從當前節點出發的所有邊
    const outgoingEdges = flowStore.currentInstance.edges.filter(
      (edge) => edge.source === nodeId
    );

    // 獲取目標節點ID
    return outgoingEdges.map((edge) => edge.target);
  };

  /**
   * 獲取節點的上一個節點
   * @param {string} nodeId - 當前節點ID
   * @returns {Array} - 上一個節點的ID數組
   */
  const getPreviousNodes = (nodeId) => {
    if (!flowStore.currentInstance?.edges) {
      return [];
    }

    // 找出指向當前節點的所有邊
    const incomingEdges = flowStore.currentInstance.edges.filter(
      (edge) => edge.target === nodeId
    );

    // 獲取來源節點ID
    return incomingEdges.map((edge) => edge.source);
  };

  /**
   * 檢查節點是否可以執行
   * @param {string} nodeId - 節點ID
   * @returns {boolean} - 是否可以執行
   */
  const canExecuteNode = (nodeId) => {
    // 獲取上一個節點
    const previousNodes = getPreviousNodes(nodeId);

    // 如果沒有上一個節點，則可以執行
    if (previousNodes.length === 0) {
      return true;
    }

    // 檢查所有上一個節點是否都已完成
    return previousNodes.every((prevNodeId) => {
      const nodeState = flowStore.getNodeStateById(prevNodeId);
      return nodeState.status === "completed";
    });
  };

  /**
   * 執行節點
   * @param {string} nodeId - 節點ID
   * @param {Object} context - 執行上下文
   * @returns {Promise<Object>} - 執行結果
   */
  const executeNode = async (nodeId, context = {}) => {
    if (!nodeId) {
      throw new Error("未提供節點ID");
    }

    if (!flowStore.currentInstance) {
      throw new Error("沒有活動的流程實例");
    }

    // 檢查節點是否可以執行
    if (!canExecuteNode(nodeId)) {
      console.warn(`節點 ${nodeId} 的前置節點尚未完成，無法執行`);
      return;
    }

    try {
      // 設置當前執行節點
      currentExecutingNodeId.value = nodeId;
      isExecuting.value = true;
      executionError.value = null;

      // 更新節點狀態為執行中
      await flowStore.updateNodeState(nodeId, { status: "running" });

      // 記錄執行開始
      executionHistory.value.push({
        nodeId,
        action: "start",
        timestamp: new Date().toISOString(),
        context,
      });

      // 觸發節點執行事件
      const event = new CustomEvent("flow:executeNode", {
        detail: {
          nodeId,
          ...context,
        },
      });
      console.log(
        `[${new Date().toISOString()}] 工作流管理器觸發節點 ${nodeId} 執行事件，上下文:`,
        context
      );
      window.dispatchEvent(event);

      console.log(`工作流管理器已觸發節點 ${nodeId} 的執行`);

      // 等待節點執行完成
      // 注意：這裡我們不直接等待節點執行完成，而是通過事件監聽來處理
      // 節點執行完成後會更新狀態，我們通過監聽狀態變化來處理後續流程
      console.log(
        "注意：這裡我們不直接等待節點執行完成，而是通過事件監聽來處理"
      );
      return true;
    } catch (error) {
      console.error(`工作流管理器執行節點 ${nodeId} 時發生錯誤:`, error);
      executionError.value = error;

      // 更新節點狀態為錯誤
      await flowStore.updateNodeState(nodeId, {
        status: "error",
        error: error.message || "執行節點時發生未知錯誤",
      });

      // 記錄執行錯誤
      executionHistory.value.push({
        nodeId,
        action: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      });

      throw error;
    } finally {
      isExecuting.value = false;
      currentExecutingNodeId.value = null;
    }
  };

  /**
   * 執行工作流
   * @param {string} startNodeId - 起始節點ID，如果不提供則自動查找入口節點
   * @returns {Promise<void>}
   */
  const executeWorkflow = async (startNodeId = null) => {
    if (!flowStore.currentInstance) {
      throw new Error("沒有活動的流程實例");
    }

    try {
      // 清空執行隊列和歷史
      executionQueue.value = [];
      executionHistory.value = [];
      executionError.value = null;

      // 如果沒有提供起始節點，則查找入口節點（沒有入邊的節點）
      if (!startNodeId) {
        const nodes = flowStore.currentInstance.nodes || [];
        const edges = flowStore.currentInstance.edges || [];

        // 找出沒有入邊的節點作為入口節點
        const entryNodes = nodes.filter((node) => {
          return !edges.some((edge) => edge.target === node.id);
        });

        if (entryNodes.length === 0) {
          throw new Error("找不到工作流的入口節點");
        }

        // 使用第一個入口節點
        startNodeId = entryNodes[0].id;
      }

      // 將起始節點加入執行隊列
      executionQueue.value.push(startNodeId);

      // 執行起始節點
      await executeNode(startNodeId);

      console.log(`工作流從節點 ${startNodeId} 開始執行`);
    } catch (error) {
      console.error("執行工作流時發生錯誤:", error);
      executionError.value = error;
      throw error;
    }
  };

  /**
   * 處理節點執行完成事件
   * @param {string} nodeId - 節點ID
   * @param {Object} result - 執行結果
   */
  const handleNodeCompleted = async (nodeId, result) => {
    if (!nodeId) return;

    try {
      console.log(
        `[${new Date().toISOString()}] 處理節點 ${nodeId} 完成事件開始`
      );

      // 記錄執行完成
      executionHistory.value.push({
        nodeId,
        action: "complete",
        timestamp: new Date().toISOString(),
        result,
      });

      // 更新節點狀態為完成
      await flowStore.updateNodeState(nodeId, { status: "completed" });

      // 獲取下一個節點
      const nextNodes = getNextNodes(nodeId);
      console.log(`節點 ${nodeId} 的下一個節點: [${nextNodes.join(", ")}]`);

      // 如果沒有下一個節點，則工作流執行完成
      if (nextNodes.length === 0) {
        console.log(`節點 ${nodeId} 沒有下一個節點，工作流執行完成`);
        return;
      }

      // 將下一個節點加入執行隊列
      for (const nextNodeId of nextNodes) {
        console.log(`將節點 ${nextNodeId} 加入執行隊列`);
        executionQueue.value.push(nextNodeId);

        // 檢查下一個節點是否可以執行
        if (canExecuteNode(nextNodeId)) {
          console.log(`節點 ${nextNodeId} 可以執行，準備上下文數據`);
          // 準備上下文數據
          const context = {
            sourceNodeId: nodeId,
            sourceNodeOutput: result,
            // 如果有客訴單號等重要信息，也傳遞過去
            ...(result?.complaintId
              ? {
                  complaintId: result.complaintId,
                  complaintDetail: result.complaintDetail,
                }
              : {}),
          };

          // 執行下一個節點
          console.log(`開始執行節點 ${nextNodeId}，上下文:`, context);
          await executeNode(nextNodeId, context);
          console.log(`節點 ${nextNodeId} 執行完成`);
        } else {
          console.log(`節點 ${nextNodeId} 的前置條件未滿足，暫時不執行`);
        }
      }
    } catch (error) {
      console.error(`處理節點 ${nodeId} 完成事件時發生錯誤:`, error);
    }
  };

  /**
   * 處理節點執行錯誤事件
   * @param {string} nodeId - 節點ID
   * @param {Error} error - 錯誤對象
   */
  const handleNodeError = async (nodeId, error) => {
    if (!nodeId) return;

    try {
      // 記錄執行錯誤
      executionHistory.value.push({
        nodeId,
        action: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      });

      // 更新節點狀態為錯誤
      await flowStore.updateNodeState(nodeId, {
        status: "error",
        error: error.message || "執行節點時發生未知錯誤",
      });

      console.error(`節點 ${nodeId} 執行失敗:`, error);

      // 這裡可以添加錯誤處理策略，例如重試、跳過等
    } catch (err) {
      console.error(`處理節點 ${nodeId} 錯誤事件時發生錯誤:`, err);
    }
  };

  /**
   * 設置節點狀態監聽器
   * 當節點狀態變化時，自動處理後續流程
   */
  const setupNodeStateListeners = () => {
    // 監聽全局事件
    const handleNodeStateChange = async (event) => {
      const { nodeId, status, result, error, timestamp } = event.detail;

      // 添加更詳細的日誌，幫助追蹤狀態變更
      console.log(
        `[${new Date().toISOString()}] 接收到節點 ${nodeId} 狀態變更事件: ${status}, 時間戳: ${timestamp}`
      );
      console.log(
        `當前執行節點: ${
          currentExecutingNodeId.value
        }, 執行隊列: [${executionQueue.value.join(", ")}]`
      );

      // 檢查是否是當前正在執行的節點，避免重複處理
      if (status === "running" && currentExecutingNodeId.value === nodeId) {
        console.log(`節點 ${nodeId} 已經在執行中，忽略重複的運行事件`);
        return;
      }

      // 檢查執行隊列中是否已經有這個節點，避免重複添加
      if (status === "completed" && executionQueue.value.includes(nodeId)) {
        console.log(`節點 ${nodeId} 已經在執行隊列中，避免重複處理`);
        // 不要直接返回，因為我們仍然需要處理完成事件
      }

      if (status === "completed") {
        console.log(`準備處理節點 ${nodeId} 的完成事件，結果:`, result);
        await handleNodeCompleted(nodeId, result);
      } else if (status === "error") {
        console.log(`準備處理節點 ${nodeId} 的錯誤事件，錯誤:`, error);
        await handleNodeError(nodeId, error);
      }
    };

    // 添加事件監聽器
    window.addEventListener("flow:nodeStateChange", handleNodeStateChange);

    // 返回清理函數
    return () => {
      window.removeEventListener("flow:nodeStateChange", handleNodeStateChange);
    };
  };

  // 設置節點狀態監聽器
  setupNodeStateListeners();

  return {
    // 狀態
    currentExecutingNodeId,
    executionQueue,
    executionHistory,
    isExecuting,
    executionError,

    // 方法
    executeNode,
    executeWorkflow,
    getNextNodes,
    getPreviousNodes,
    canExecuteNode,
    handleNodeCompleted,
    handleNodeError,
  };
}
