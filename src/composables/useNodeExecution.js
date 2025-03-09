/**
 * 節點執行邏輯 Composable
 * 用於統一所有節點的執行邏輯
 */
import { ref, computed } from "vue";
import { useFlowInstance } from "@/composables/useFlowInstance";
import { useFlowStore } from "@/stores/flowStore";
import { logger } from "@/utils/logger";
import { globalEventBus, NodeEventType } from "@/utils/eventBus";

/**
 * 節點執行邏輯 Composable
 * @param {Object} options - 選項
 * @param {string} options.nodeId - 節點ID
 * @param {string} options.nodeType - 節點類型
 * @param {string} options.nodeName - 節點名稱
 * @param {Object} options.nodeRef - 節點引用
 * @returns {Object} - 節點執行邏輯相關方法和狀態
 */
export function useNodeExecution(options) {
  const { nodeId, nodeType, nodeName, nodeRef } = options;

  // 使用流程實例 composable
  const {
    executeNode: executeFlowNode,
    clearNodeError,
    updateSharedData,
    getSharedData,
    updateGlobalVariable,
    getGlobalVariable,
  } = useFlowInstance();

  // 獲取流程 store
  const flowStore = useFlowStore();

  // 節點狀態
  const executing = ref(false);
  const errorMessage = ref("");
  const errorDetails = ref(null);
  const outputData = ref(null);

  /**
   * 更新節點狀態
   * @param {string} newStatus - 新狀態
   * @param {Object} result - 執行結果
   * @param {Error} error - 錯誤對象
   */
  const updateNodeStatus = (newStatus, result = null, error = null) => {
    logger.debug(nodeType, `更新節點 ${nodeId} 狀態為 ${newStatus}`);

    // 如果有節點引用，使用 BaseNode 中的方法更新狀態
    if (nodeRef?.value) {
      logger.debug(nodeType, `使用 nodeRef 更新狀態`);
      nodeRef.value.updateNodeStatus(newStatus, result, error);
    } else {
      // 如果節點引用不可用，直接更新 flowStore
      logger.debug(nodeType, `nodeRef 不可用，直接更新 flowStore`);
      flowStore.updateNodeState(flowStore.currentInstance?.id, nodeId, {
        status: newStatus,
        data: result,
        error: error ? error.message || "未知錯誤" : null,
        _isDataUpdate: true, // 標記為數據更新
      });
    }
  };

  /**
   * 執行節點
   * @param {Object} context - 執行上下文
   * @param {Function} processFunction - 處理函數
   * @returns {Promise<Object>} - 執行結果
   */
  const executeNode = async (context = {}, processFunction) => {
    // 檢查是否有來自上一個節點的數據
    if (context && context.sourceNodeId) {
      logger.info(
        nodeType,
        `節點 ${nodeId} 被節點 ${context.sourceNodeId} 自動觸發執行`
      );
      logger.debug(nodeType, "上下文數據:", context);
    }

    // 檢查節點是否已在執行中
    if (executing.value) {
      logger.warn(nodeType, `節點 ${nodeId} 已在執行中，忽略重複執行請求`);
      return;
    }

    executing.value = true;

    try {
      // 更新節點狀態為執行中
      updateNodeStatus("running");

      // 清除錯誤信息
      errorMessage.value = "";
      errorDetails.value = null;

      // 準備輸入數據
      const inputData = {
        // 如果有上下文數據，則包含在輸入數據中
        ...(context || {}),
        timestamp: new Date().toISOString(),
        nodeType,
        nodeName,
      };

      logger.info(nodeType, `準備執行節點 ${nodeId}`);
      logger.debug(nodeType, "輸入數據:", inputData);

      // 使用 executeNode 執行節點
      const result = await executeFlowNode(nodeId, inputData, processFunction);

      // 將結果保存到共享數據中
      await updateSharedData(nodeId, {
        detail: result,
        timestamp: new Date().toISOString(),
        nodeId,
        nodeName,
      });

      // 更新本地狀態
      outputData.value = result;

      // 構建完整的結果對象
      const completeResult = {
        ...result,
        timestamp: new Date().toISOString(),
        nodeId,
        nodeName,
      };

      // 更新節點狀態為完成
      updateNodeStatus("completed", completeResult);

      // 觸發節點狀態變更事件
      globalEventBus.emit(
        NodeEventType.STATE_CHANGE,
        {
          nodeId,
          status: "completed",
          result: completeResult,
          timestamp: new Date().toISOString(),
        },
        { source: nodeType }
      );

      logger.info(nodeType, `節點 ${nodeId} 執行完成`);

      return completeResult;
    } catch (error) {
      logger.error(nodeType, `執行節點 ${nodeId} 時發生錯誤:`, error);

      // 更新錯誤狀態
      errorMessage.value = error.message || "執行節點時發生未知錯誤";
      errorDetails.value = {
        message: error.message,
        stack: error.stack,
      };

      // 更新節點狀態為錯誤
      updateNodeStatus("error", null, error);

      // 觸發節點錯誤事件
      globalEventBus.emit(
        NodeEventType.ERROR,
        {
          nodeId,
          error: {
            message: error.message,
            stack: error.stack,
          },
          timestamp: new Date().toISOString(),
        },
        { source: nodeType }
      );

      throw error;
    } finally {
      executing.value = false;
      // 重置 loading 狀態
      nodeRef?.value?.setRunningState?.(false);
    }
  };

  /**
   * 清除節點錯誤
   */
  const handleClearError = async () => {
    await clearNodeError(nodeId);
    errorMessage.value = "";
    errorDetails.value = null;
  };

  /**
   * 從共享數據中恢復節點狀態
   */
  const restoreFromSharedData = () => {
    const previousData = getSharedData(nodeId);
    if (previousData && previousData.detail) {
      logger.info(nodeType, `從共享數據中恢復節點 ${nodeId} 的狀態`);
      logger.debug(nodeType, "恢復的數據:", previousData);

      outputData.value = previousData.detail;
      return previousData.detail;
    }
    return null;
  };

  /**
   * 檢查節點是否可以執行
   * @returns {boolean} - 是否可以執行
   */
  const canExecute = computed(() => {
    return !executing.value;
  });

  return {
    // 狀態
    executing,
    errorMessage,
    errorDetails,
    outputData,
    canExecute,

    // 方法
    executeNode,
    updateNodeStatus,
    handleClearError,
    restoreFromSharedData,

    // 原始方法
    updateSharedData,
    getSharedData,
    updateGlobalVariable,
    getGlobalVariable,
  };
}
