import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getFlowInstances,
  getFlowInstanceById,
  createFlowInstance,
  updateFlowInstance,
  startFlowInstance,
  pauseFlowInstance,
  resumeFlowInstance,
  stopFlowInstance,
  executeNode as executeNodeAPI,
  getInstanceLogs,
  getNodeLogs,
  updateNodeContext,
  getNodeState,
  getNodeContext,
  resetInstance,
} from "@/api/modules/flow";
import { getProjectById } from "@/api/modules/project";
import { ElMessage } from "element-plus";

// 合併後的工作流程 store
export const useFlowStore = defineStore("flow", () => {
  // 狀態
  const currentInstance = ref(null);
  const instances = ref([]);
  const loading = ref(false);
  const executing = ref(false);
  const error = ref(null);
  const executionLogs = ref([]);

  // 給麵包屑使用
  const projectName = ref("");
  const projectId = ref("");
  const templateId = ref("");
  const fromProject = ref(false); // 是否從專案詳情頁進入

  // 設置是否從專案詳情頁進入
  function setFromProject(value) {
    fromProject.value = value;
  }

  // 設置專案名稱
  function setProjectName(name) {
    console.log("設置專案名稱", name);
    projectName.value = name;
  }

  // 設置專案 ID
  function setProjectId(id) {
    projectId.value = id;
  }

  // 設置模板 ID
  function setTemplateId(id) {
    templateId.value = id;
  }

  // 設置當前流程實例
  function setCurrentInstance(instance) {
    console.log("設置當前流程實例:", instance);
    currentInstance.value = instance;

    // 初始化節點狀態和數據
    if (instance) {
      if (!instance.nodeStates) {
        instance.nodeStates = {};
      }

      if (!instance.nodeData) {
        instance.nodeData = {};
      }

      if (instance.projectId) {
        setProjectId(instance.projectId);
        // 嘗試獲取專案名稱
        loadProjectInfo(instance.projectId);
      }

      if (instance.templateId) {
        setTemplateId(instance.templateId);
      }
    }

    return instance;
  }

  // 載入專案資訊
  async function loadProjectInfo(projectId) {
    if (!projectId) return;

    try {
      const response = await getProjectById(projectId);
      if (response && response.data) {
        setProjectName(response.data.name);
      }
    } catch (error) {
      console.error("載入專案資訊失敗:", error);
    }
  }

  // Getters
  const getNodeStateById = computed(() => (nodeId) => {
    if (!currentInstance.value || !nodeId) {
      return { status: "default" };
    }

    const nodeStates = currentInstance.value.nodeStates || {};
    return nodeStates[nodeId] || { status: "default" };
  });

  const getNodeContextById = computed(() => (nodeId) => {
    if (!currentInstance.value || !nodeId) {
      return {};
    }

    const context = currentInstance.value.context || {};
    return context[nodeId] || {};
  });

  const getNodeLogsById = computed(() => (nodeId) => {
    if (!currentInstance.value || !nodeId) {
      return [];
    }

    const logs = currentInstance.value.logs || [];
    return logs.filter((log) => log.nodeId === nodeId);
  });

  const canStart = computed(() => {
    return currentInstance.value?.status === "draft";
  });

  const canPause = computed(() => {
    return currentInstance.value?.status === "running";
  });

  const canResume = computed(() => {
    return currentInstance.value?.status === "paused";
  });

  const canStop = computed(() => {
    return ["running", "paused"].includes(currentInstance.value?.status);
  });

  // 檢查節點是否已完成
  const isNodeCompleted = computed(() => (nodeId) => {
    const nodeState = getNodeStateById.value(nodeId);
    return nodeState.status === "completed";
  });

  // 檢查節點是否有錯誤
  const hasNodeError = computed(() => (nodeId) => {
    const nodeState = getNodeStateById.value(nodeId);
    return nodeState.status === "error" || nodeState.status === "failed";
  });

  // Actions
  const loadInstances = async (projectId) => {
    try {
      loading.value = true;
      const response = await getFlowInstances({ projectId });
      instances.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error("載入流程實例列表失敗:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadInstance = async (instanceId) => {
    if (!instanceId) {
      throw new Error("未提供實例ID");
    }

    try {
      loading.value = true;
      const response = await getFlowInstanceById(instanceId);
      setCurrentInstance(response.data);
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error("載入流程實例失敗:", err);
      ElMessage.error(`載入流程實例失敗: ${err.message || "未知錯誤"}`);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createInstance = async (data) => {
    try {
      loading.value = true;
      const response = await createFlowInstance(data);
      instances.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error("創建流程實例失敗:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateInstance = async (instanceId, data) => {
    try {
      loading.value = true;
      const response = await updateFlowInstance(instanceId, data);
      if (currentInstance.value?.id === instanceId) {
        setCurrentInstance(response.data);
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error("更新流程實例失敗:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const startInstance = async (instanceId) => {
    try {
      loading.value = true;
      const response = await startFlowInstance(instanceId);
      if (currentInstance.value?.id === instanceId) {
        setCurrentInstance(response.data);
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error("啟動流程實例失敗:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const pauseInstance = async (instanceId) => {
    try {
      loading.value = true;
      const response = await pauseFlowInstance(instanceId);
      if (currentInstance.value?.id === instanceId) {
        setCurrentInstance(response.data);
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error("暫停流程實例失敗:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const resumeInstance = async (instanceId) => {
    try {
      loading.value = true;
      const response = await resumeFlowInstance(instanceId);
      if (currentInstance.value?.id === instanceId) {
        setCurrentInstance(response.data);
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error("恢復流程實例失敗:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const stopInstance = async (instanceId) => {
    try {
      loading.value = true;
      const response = await stopFlowInstance(instanceId);
      if (currentInstance.value?.id === instanceId) {
        setCurrentInstance(response.data);
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error("停止流程實例失敗:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

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

  // 更新節點數據
  const updateNodeData = async (instanceId, nodeId, data) => {
    if (!instanceId || !nodeId) {
      throw new Error("更新節點數據需要提供 instanceId 和 nodeId");
    }

    try {
      const instance = currentInstance.value;
      if (!instance) {
        throw new Error(`找不到流程實例 ${instanceId}`);
      }

      // 更新本地節點數據
      currentInstance.value = {
        ...instance,
        nodeData: {
          ...instance.nodeData,
          [nodeId]: {
            ...instance.nodeData?.[nodeId],
            ...data,
          },
        },
      };

      // 這裡可以選擇是否同步到後端
      // 如果需要同步到後端，可以調用 API
      return currentInstance.value.nodeData[nodeId];
    } catch (error) {
      console.error("更新節點數據失敗:", error);
      throw error;
    }
  };

  // 更新節點狀態
  const updateNodeState = async (instanceId, nodeId, state) => {
    if (!instanceId || !nodeId) {
      throw new Error("更新節點狀態需要提供 instanceId 和 nodeId");
    }

    try {
      const instance = currentInstance.value;
      if (!instance) {
        throw new Error(`找不到流程實例 ${instanceId}`);
      }

      // 更新本地節點狀態
      currentInstance.value = {
        ...instance,
        nodeStates: {
          ...instance.nodeStates,
          [nodeId]: {
            ...instance.nodeStates?.[nodeId],
            ...state,
          },
        },
      };

      // 這裡可以選擇是否同步到後端
      // 如果需要同步到後端，可以調用 API
      return currentInstance.value.nodeStates[nodeId];
    } catch (error) {
      console.error("更新節點狀態失敗:", error);
      throw error;
    }
  };

  const loadInstanceLogs = async (instanceId) => {
    try {
      const response = await getInstanceLogs(instanceId);
      if (currentInstance.value?.id === instanceId) {
        executionLogs.value = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error("載入實例日誌失敗:", err);
      throw err;
    }
  };

  const loadNodeLogsById = async (instanceId, nodeId) => {
    try {
      const response = await getNodeLogs(instanceId, nodeId);
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error("載入節點日誌失敗:", err);
      throw err;
    }
  };

  return {
    // 狀態
    currentInstance,
    instances,
    loading,
    executing,
    error,
    executionLogs,
    projectName,
    projectId,
    templateId,
    fromProject,

    // Getters
    getNodeStateById,
    getNodeContextById,
    getNodeLogsById,
    canStart,
    canPause,
    canResume,
    canStop,
    isNodeCompleted,
    hasNodeError,

    // Actions
    setFromProject,
    setProjectName,
    setProjectId,
    setTemplateId,
    setCurrentInstance,
    loadProjectInfo,
    loadInstances,
    loadInstance,
    createInstance,
    updateInstance,
    startInstance,
    pauseInstance,
    resumeInstance,
    stopInstance,
    executeNode,
    updateNodeData,
    updateNodeState,
    loadInstanceLogs,
    loadNodeLogsById,
  };
});
