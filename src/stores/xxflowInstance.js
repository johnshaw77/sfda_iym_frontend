import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getFlowInstanceById,
  executeNode as executeNodeAPI,
  getInstanceLogs,
  updateFlowInstance,
} from "@/api/modules/flow";
import { ElMessage } from "element-plus";

// 工作流程實例 store (用於設置實例所屬專案名稱，並在麵包屑中顯示)
export const useFlowInstanceStore = defineStore("flowInstance", () => {
  // 給麵包屑
  const projectName = ref("");
  // 當前流程實例
  const currentInstance = ref(null);
  // 載入狀態
  const loading = ref(false);
  // 執行狀態
  const executing = ref(false);
  // 實例日誌
  const instanceLogs = ref([]);

  function setProjectName(name) {
    projectName.value = name;
  }

  // 設置當前流程實例
  function setCurrentInstance(instance) {
    console.log("設置當前流程實例:", instance);
    currentInstance.value = instance;

    // 初始化節點狀態和數據
    if (instance && !instance.nodeStates) {
      instance.nodeStates = {};
    }

    if (instance && !instance.nodeData) {
      instance.nodeData = {};
    }

    return instance;
  }

  // 獲取流程實例
  async function fetchInstance(instanceId) {
    if (!instanceId) {
      throw new Error("未提供實例ID");
    }

    try {
      loading.value = true;
      const response = await getFlowInstanceById(instanceId);
      currentInstance.value = response.data;
      return response.data;
    } catch (error) {
      console.error("獲取流程實例失敗:", error);
      ElMessage.error(`獲取流程實例失敗: ${error.message || "未知錯誤"}`);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 執行節點
   * @param {string} instanceId - 流程實例ID
   * @param {string} nodeId - 節點ID
   * @param {object} input - 輸入數據
   * @returns {Promise<object>} - 執行結果
   */
  const executeNode = async (instanceId, nodeId, input = {}) => {
    if (!instanceId) {
      throw new Error("未提供實例ID");
    }

    if (!nodeId) {
      throw new Error("未提供節點ID");
    }

    // 檢查輸入數據是否為空
    if (!input || Object.keys(input).length === 0) {
      throw new Error("輸入數據不能為空");
    }

    console.log(`準備執行節點 - 實例ID: ${instanceId}, 節點ID: ${nodeId}`);
    console.log("輸入數據:", JSON.stringify(input, null, 2));

    try {
      executing.value = true;

      // 獲取當前實例
      const instance = currentInstance.value;
      if (!instance) {
        throw new Error(`找不到流程實例 ${instanceId}`);
      }

      // 獲取節點數據
      const nodeData = instance.nodeData?.[nodeId] || {};
      console.log("節點數據:", JSON.stringify(nodeData, null, 2));

      // 合併節點數據和輸入數據
      const mergedInput = {
        ...nodeData,
        ...input,
      };
      console.log("合併後的輸入數據:", JSON.stringify(mergedInput, null, 2));

      // 更新節點狀態為運行中
      const updatedNodeStates = {
        ...instance.nodeStates,
        [nodeId]: {
          ...instance.nodeStates?.[nodeId],
          status: "running",
          startTime: new Date().toISOString(),
        },
      };

      // 更新當前實例
      currentInstance.value = {
        ...instance,
        nodeStates: updatedNodeStates,
      };

      // 調用API執行節點
      const startTime = performance.now();
      console.log(`開始調用執行節點API - ${new Date().toISOString()}`);
      const response = await executeNodeAPI(instanceId, nodeId, mergedInput);
      const endTime = performance.now();
      const executionTime = (endTime - startTime) / 1000; // 轉換為秒

      console.log(`節點執行API響應 (${executionTime.toFixed(2)}秒):`, response);

      // 更新節點狀態
      const newNodeState = response.data.nodeStates?.[nodeId] || {};

      // 檢查節點是否執行失敗
      if (newNodeState.status === "failed") {
        ElMessage.error(`節點執行失敗: ${newNodeState.error || "未知錯誤"}`);
        console.error("節點執行失敗:", newNodeState.error);
        console.error("錯誤詳情:", newNodeState.errorDetails);
      }

      // 更新當前實例
      currentInstance.value = {
        ...response.data,
        nodeContext: {
          ...instance.nodeContext,
          [nodeId]: {
            ...instance.nodeContext?.[nodeId],
            executionTime,
          },
        },
      };

      return response.data;
    } catch (error) {
      console.error("執行節點時發生錯誤:", error);
      console.error("錯誤詳情:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name,
        response: error.response?.data,
      });

      // 更新節點狀態為錯誤
      const instance = currentInstance.value;
      if (instance) {
        const updatedNodeStates = {
          ...instance.nodeStates,
          [nodeId]: {
            ...instance.nodeStates?.[nodeId],
            status: "error",
            error: error.message || "執行節點時發生未知錯誤",
            endTime: new Date().toISOString(),
            errorDetails: {
              message: error.message,
              stack: error.stack,
              code: error.code,
              name: error.name,
              response: error.response?.data,
            },
          },
        };

        currentInstance.value = {
          ...instance,
          nodeStates: updatedNodeStates,
        };
      }

      throw error;
    } finally {
      executing.value = false;
    }
  };

  // 獲取實例日誌
  async function fetchInstanceLogs(instanceId) {
    if (!instanceId) {
      throw new Error("未提供實例ID");
    }

    try {
      loading.value = true;
      const response = await getInstanceLogs(instanceId);
      instanceLogs.value = response.data;
      return response.data;
    } catch (error) {
      console.error("獲取實例日誌失敗:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 獲取節點上下文
  function getNodeContext(nodeId) {
    if (!currentInstance.value || !nodeId) {
      return {};
    }

    const context = currentInstance.value.context || {};
    return context[nodeId] || {};
  }

  // 獲取節點狀態
  function getNodeState(nodeId) {
    if (!currentInstance.value || !nodeId) {
      return { status: "default" };
    }

    const nodeStates = currentInstance.value.nodeStates || {};
    return nodeStates[nodeId] || { status: "default" };
  }

  // 獲取節點日誌
  function getNodeLogs(nodeId) {
    if (!currentInstance.value || !nodeId) {
      return [];
    }

    const logs = currentInstance.value.logs || [];
    return logs.filter((log) => log.nodeId === nodeId);
  }

  // 檢查節點是否已完成
  function isNodeCompleted(nodeId) {
    const nodeState = getNodeState(nodeId);
    return nodeState.status === "completed";
  }

  // 檢查節點是否有錯誤
  function hasNodeError(nodeId) {
    const nodeState = getNodeState(nodeId);
    return nodeState.status === "error";
  }

  /**
   * 更新節點數據
   * @param {string} instanceId - 流程實例ID
   * @param {string} nodeId - 節點ID
   * @param {object} data - 節點數據
   * @returns {Promise<object>} - 更新後的流程實例
   */
  const updateNodeData = async (instanceId, nodeId, data) => {
    if (!instanceId) {
      throw new Error("缺少流程實例ID");
    }
    if (!nodeId) {
      throw new Error("缺少節點ID");
    }

    try {
      console.log(`更新節點 ${nodeId} 數據:`, data);

      // 獲取當前實例
      const instance = currentInstance.value;
      if (!instance) {
        throw new Error("找不到當前流程實例");
      }

      // 合併現有節點數據和新數據
      const currentNodeData = instance.nodeData?.[nodeId] || {};
      const updatedNodeData = {
        ...currentNodeData,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      // 更新實例的節點數據
      const updatedInstanceNodeData = {
        ...instance.nodeData,
        [nodeId]: updatedNodeData,
      };

      // 調用API更新流程實例
      const response = await updateFlowInstance(instanceId, {
        nodeData: updatedInstanceNodeData,
      });

      // 更新當前實例
      currentInstance.value = response.data;

      console.log(`節點 ${nodeId} 數據更新成功:`, updatedNodeData);
      return response.data;
    } catch (error) {
      console.error(`更新節點 ${nodeId} 數據時發生錯誤:`, error);
      ElMessage.error(`更新節點數據失敗: ${error.message || "未知錯誤"}`);
      throw error;
    }
  };

  // 添加更新節點狀態的方法
  const updateNodeState = async (instanceId, nodeId, newState) => {
    if (!instanceId || !nodeId) {
      console.error("更新節點狀態失敗: 缺少實例ID或節點ID");
      return;
    }

    try {
      loading.value = true;

      // 獲取當前實例
      const instance = currentInstance.value;
      if (!instance || instance.id !== instanceId) {
        throw new Error("找不到指定的流程實例");
      }

      // 獲取當前節點狀態
      const nodeStates = instance.nodeStates || {};
      const currentNodeState = nodeStates[nodeId] || {};

      // 合併新狀態
      const updatedNodeStates = {
        ...nodeStates,
        [nodeId]: {
          ...currentNodeState,
          ...newState,
          lastUpdated: new Date().toISOString(),
        },
      };

      // 調用 API 更新流程實例
      const response = await updateFlowInstance(instanceId, {
        nodeStates: updatedNodeStates,
        logs: [
          ...instance.logs,
          {
            type: "SYSTEM",
            nodeId,
            message: `節點狀態已更新: ${JSON.stringify(newState)}`,
            timestamp: new Date().toISOString(),
          },
        ],
      });

      // 更新本地狀態
      currentInstance.value = response.data;

      return response.data;
    } catch (error) {
      console.error("更新節點狀態失敗:", error);
      ElMessage.error(`更新節點狀態失敗: ${error.message || "未知錯誤"}`);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 返回 store 的公共 API
  return {
    projectName,
    currentInstance,
    loading,
    executing,
    instanceLogs,
    setProjectName,
    setCurrentInstance,
    fetchInstance,
    executeNode,
    updateNodeData,
    updateNodeState,
    getNodeContext,
    getNodeState,
    getNodeLogs,
    fetchInstanceLogs,
  };
});
