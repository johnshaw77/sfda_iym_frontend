import { ref } from "vue";
import { ElMessage } from "element-plus";
import { createFlowInstance } from "@/api/modules/flow";
import { useFlowStore } from "@/stores/flowStore";

/**
 * 流程實例操作 Composable
 * 提供創建臨時實例、執行節點等通用功能
 * @returns {Object} 流程實例相關方法和狀態
 */
export function useFlowInstance() {
  const flowStore = useFlowStore();
  const creating = ref(false);
  const error = ref(null);

  /**
   * 初始化流程上下文
   * @returns {Object} 初始化的上下文對象
   */
  const initializeContext = () => {
    return {
      // 全域變數，可供所有節點訪問
      globalVariables: {
        createdAt: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      },
      // 節點間共享的數據
      sharedData: {},
      // 流程執行統計資訊
      statistics: {
        totalNodes: 0,
        completedNodes: 0,
        errorNodes: 0,
        executionProgress: 0,
        lastUpdated: new Date().toISOString(),
      },
      // 執行歷史記錄
      executionHistory: [],
      // 流程執行階段
      executionPhase: "initialization",
    };
  };

  /**
   * 確保存在流程實例，如果不存在則創建臨時實例
   * @param {Object} nodeProps - 節點屬性
   * @param {String} nodeProps.id - 節點ID
   * @param {String} nodeProps.type - 節點類型
   * @returns {Promise<Object>} 流程實例
   */
  const ensureFlowInstance = async (nodeProps) => {
    // 如果已有當前實例，直接返回
    if (flowStore.currentInstance) {
      return flowStore.currentInstance;
    }

    creating.value = true;
    error.value = null;

    try {
      console.log("ensureFlowInstance...");

      // 創建臨時實例數據
      const tempInstance = {
        projectId: flowStore.projectId || "1", // 優先使用 store 中的 projectId
        templateId: flowStore.templateId || "1", // 優先使用 store 中的 templateId
        name: "臨時測試實例",
        status: "draft",
        nodes: [
          {
            id: nodeProps.id,
            type: nodeProps.type || "GenericNode",
            data: nodeProps.data || {},
          },
        ],
        edges: [],
        // 初始化流程上下文
        context: initializeContext(),
      };

      // 調用 API 創建實例
      const response = await createFlowInstance(tempInstance);
      console.log("成功創建臨時測試實例:", response.data);

      // 設置當前實例
      flowStore.setCurrentInstance(response.data);

      creating.value = false;
      return response.data;
    } catch (error) {
      console.error("創建臨時測試實例失敗:", error);
      ElMessage.error("創建臨時測試實例失敗: " + (error.message || "未知錯誤"));

      creating.value = false;
      error.value = error;

      throw error;
    }
  };

  /**
   * 執行節點並更新狀態
   * @param {String} nodeId - 節點ID
   * @param {Object} input - 輸入數據
   * @param {Function} processFunction - 處理數據的函數
   * @returns {Promise<Object>} 執行結果
   */
  const executeNode = async (nodeId, input = {}, processFunction) => {
    try {
      // 確保有流程實例
      const instance = await ensureFlowInstance({ id: nodeId });

      // 更新流程上下文中的執行歷史
      await updateFlowContextField("executionHistory", (history = []) => {
        return [
          ...history,
          {
            nodeId,
            action: "started",
            timestamp: new Date().toISOString(),
          },
        ];
      });

      // 更新執行階段
      await updateFlowContextField("executionPhase", "processing");

      // 執行節點處理邏輯
      const result = await processFunction(input);

      // 更新節點數據
      await flowStore.updateNodeData(instance.id, nodeId, {
        input,
        output: result,
        timestamp: new Date().toISOString(),
      });

      // 更新節點狀態
      await flowStore.updateNodeState(instance.id, nodeId, {
        status: "completed",
        error: null,
        errorDetails: null,
      });

      // 更新流程上下文中的執行歷史和統計資訊
      await updateFlowContextField("executionHistory", (history = []) => {
        return [
          ...history,
          {
            nodeId,
            action: "completed",
            timestamp: new Date().toISOString(),
            result: { success: true },
          },
        ];
      });

      // 更新統計資訊
      await updateFlowStatistics();

      return result;
    } catch (error) {
      console.error("執行節點時發生錯誤:", error);

      // 如果有流程實例，更新節點錯誤狀態
      if (flowStore.currentInstance?.id) {
        await flowStore.updateNodeState(flowStore.currentInstance.id, nodeId, {
          status: "error",
          error: error.message,
          errorDetails: {
            message: error.message,
            stack: error.stack,
          },
        });

        // 更新流程上下文中的執行歷史
        await updateFlowContextField("executionHistory", (history = []) => {
          return [
            ...history,
            {
              nodeId,
              action: "error",
              timestamp: new Date().toISOString(),
              error: error.message,
            },
          ];
        });

        // 更新執行階段
        await updateFlowContextField("executionPhase", "error");

        // 更新統計資訊
        await updateFlowStatistics();
      }

      throw error;
    }
  };

  /**
   * 清除節點錯誤狀態
   * @param {String} nodeId - 節點ID
   * @returns {Promise<void>}
   */
  const clearNodeError = async (nodeId) => {
    try {
      // 確保有流程實例
      const instance = await ensureFlowInstance({ id: nodeId });

      console.log(`清除節點 ${nodeId} 的錯誤狀態`);

      // 更新節點狀態
      await flowStore.updateNodeState(instance.id, nodeId, {
        status: "default",
        error: null,
        errorDetails: null,
      });

      // 更新流程上下文中的執行歷史
      await updateFlowContextField("executionHistory", (history = []) => {
        return [
          ...history,
          {
            nodeId,
            action: "error_cleared",
            timestamp: new Date().toISOString(),
          },
        ];
      });

      // 如果所有節點都沒有錯誤，更新執行階段
      const hasErrors = Object.values(
        flowStore.currentInstance.value?.nodeStates || {}
      ).some((state) => state.status === "error" || state.status === "failed");

      if (!hasErrors) {
        await updateFlowContextField("executionPhase", "ready");
      }

      // 更新統計資訊
      await updateFlowStatistics();

      console.log(`節點 ${nodeId} 的錯誤狀態已清除`);
    } catch (error) {
      console.error("清除節點錯誤狀態失敗:", error);
      throw error;
    }
  };

  /**
   * 更新流程上下文
   * @param {String} key - 上下文鍵名
   * @param {any} value - 上下文值
   */
  const updateFlowContext = async (key, value) => {
    try {
      if (!flowStore.currentInstance?.id) return;

      // 獲取當前上下文
      const currentContext = flowStore.currentInstance.context || {};

      // 更新上下文
      const updatedContext = {
        ...currentContext,
        [key]: value,
      };

      // 更新流程實例
      await flowStore.updateInstance(flowStore.currentInstance.id, {
        context: updatedContext,
      });

      console.log(`流程上下文 ${key} 已更新`);
    } catch (error) {
      console.error("更新流程上下文失敗:", error);
    }
  };

  /**
   * 更新流程上下文中的特定字段
   * @param {String} field - 上下文字段名
   * @param {Function|any} updater - 更新函數或新值
   */
  const updateFlowContextField = async (field, updater) => {
    try {
      if (!flowStore.currentInstance?.id) return;

      // 獲取當前上下文
      const currentContext = flowStore.currentInstance.context || {};
      console.log("currentContext", currentContext);
      // 獲取當前字段值
      const currentValue = currentContext[field];

      // 計算新值
      const newValue =
        typeof updater === "function" ? updater(currentValue) : updater;

      // 更新上下文
      const updatedContext = {
        ...currentContext,
        [field]: newValue,
      };

      // 更新流程實例，標記為數據更新而不是結構更新
      await flowStore.updateInstance(flowStore.currentInstance.id, {
        context: updatedContext,
        _isDataUpdate: true, // 添加標記，表示這是數據更新而不是結構更新
      });

      console.log(`流程上下文字段 ${field} 已更新`);
    } catch (error) {
      console.error(`更新流程上下文字段 ${field} 失敗:`, error);
    }
  };

  /**
   * 獲取流程上下文中的特定字段
   * @param {String} field - 上下文字段名
   * @param {any} defaultValue - 默認值
   * @returns {any} 字段值
   */
  const getFlowContextField = (field, defaultValue = null) => {
    if (!flowStore.currentInstance?.context) return defaultValue;
    return flowStore.currentInstance.context[field] ?? defaultValue;
  };

  /**
   * 更新流程共享數據
   * @param {String} key - 數據鍵名
   * @param {any} value - 數據值
   */
  const updateSharedData = async (key, value) => {
    await updateFlowContextField("sharedData", (sharedData = {}) => {
      return {
        ...sharedData,
        [key]: value,
      };
    });
  };

  /**
   * 獲取流程共享數據
   * @param {String} key - 數據鍵名
   * @param {any} defaultValue - 默認值
   * @returns {any} 數據值
   */
  const getSharedData = (key, defaultValue = null) => {
    const sharedData = getFlowContextField("sharedData", {});
    return sharedData[key] ?? defaultValue;
  };

  /**
   * 更新流程全域變數
   * @param {String} key - 變數名
   * @param {any} value - 變數值
   */
  const updateGlobalVariable = async (key, value) => {
    await updateFlowContextField("globalVariables", (variables = {}) => {
      return {
        ...variables,
        [key]: value,
      };
    });
  };

  /**
   * 獲取流程全域變數
   * @param {String} key - 變數名
   * @param {any} defaultValue - 默認值
   * @returns {any} 變數值
   */
  const getGlobalVariable = (key, defaultValue = null) => {
    const variables = getFlowContextField("globalVariables", {});
    return variables[key] ?? defaultValue;
  };

  /**
   * 更新流程統計資訊
   */
  const updateFlowStatistics = async () => {
    if (!flowStore.currentInstance?.id) return;

    // 獲取所有節點狀態
    const nodeStates = flowStore.currentInstance.nodeStates || {};

    // 計算統計資訊
    const totalNodes = Object.keys(nodeStates).length;
    const completedNodes = Object.values(nodeStates).filter(
      (state) => state.status === "completed"
    ).length;
    const errorNodes = Object.values(nodeStates).filter(
      (state) => state.status === "error"
    ).length;
    const executionProgress =
      totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

    // 更新統計資訊
    await updateFlowContextField("statistics", {
      totalNodes,
      completedNodes,
      errorNodes,
      executionProgress,
      lastUpdated: new Date().toISOString(),
    });
  };

  /**
   * 獲取節點間的數據傳遞
   * @param {String} sourceNodeId - 源節點ID
   * @param {String} targetNodeId - 目標節點ID
   * @returns {Object|null} 節點間傳遞的數據
   */
  const getNodeDataTransfer = (sourceNodeId, targetNodeId) => {
    const dataTransfers = getFlowContextField("dataTransfers", {});
    const key = `${sourceNodeId}->${targetNodeId}`;
    return dataTransfers[key] || null;
  };

  /**
   * 設置節點間的數據傳遞
   * @param {String} sourceNodeId - 源節點ID
   * @param {String} targetNodeId - 目標節點ID
   * @param {Object} data - 要傳遞的數據
   */
  const setNodeDataTransfer = async (sourceNodeId, targetNodeId, data) => {
    const key = `${sourceNodeId}->${targetNodeId}`;
    await updateFlowContextField("dataTransfers", (dataTransfers = {}) => {
      return {
        ...dataTransfers,
        [key]: {
          data,
          timestamp: new Date().toISOString(),
        },
      };
    });
  };

  /**
   * 獲取流程執行階段
   * @returns {String} 執行階段
   */
  const getExecutionPhase = () => {
    return getFlowContextField("executionPhase", "unknown");
  };

  /**
   * 設置流程執行階段
   * @param {String} phase - 執行階段
   */
  const setExecutionPhase = async (phase) => {
    await updateFlowContextField("executionPhase", phase);
  };

  /**
   * 獲取流程執行歷史
   * @returns {Array} 執行歷史
   */
  const getExecutionHistory = () => {
    return getFlowContextField("executionHistory", []);
  };

  /**
   * 清除流程上下文
   */
  const clearFlowContext = async () => {
    if (!flowStore.currentInstance?.id) return;

    // 重新初始化上下文
    await flowStore.updateInstance(flowStore.currentInstance.id, {
      context: initializeContext(),
    });

    console.log("流程上下文已清除並重新初始化");
  };

  return {
    ensureFlowInstance,
    executeNode,
    clearNodeError,
    updateFlowContext,
    updateFlowContextField,
    getFlowContextField,
    updateSharedData,
    getSharedData,
    updateGlobalVariable,
    getGlobalVariable,
    updateFlowStatistics,
    getNodeDataTransfer,
    setNodeDataTransfer,
    getExecutionPhase,
    setExecutionPhase,
    getExecutionHistory,
    clearFlowContext,
    creating,
    error,
    flowStore,
  };
}
