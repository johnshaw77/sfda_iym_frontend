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
} from "@/api/modules/flow";

// 工作流程實例 store (用於設置實例所屬專案名稱，並在麵包屑中顯示)
export const useFlowStateStore = defineStore("flowState", () => {
  // 狀態
  const currentInstance = ref(null);
  const instances = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const executionLogs = ref([]);

  // Getters
  const setCurrentInstance = (instance) => {
    currentInstance.value = instance;
  };

  const getNodeState = computed(() => (nodeId) => {
    return currentInstance.value?.nodeStates?.[nodeId] || { status: "idle" };
  });

  const getNodeContext = computed(() => (nodeId) => {
    return currentInstance.value?.context?.[nodeId] || {};
  });

  const getNodeLogs = computed(() => (nodeId) => {
    return (
      currentInstance.value?.logs?.filter((log) => log.nodeId === nodeId) || []
    );
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

  // Actions
  const loadInstances = async (projectId) => {
    try {
      loading.value = true;
      const response = await getFlowInstances({ projectId });
      instances.value = response.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadInstance = async (instanceId) => {
    try {
      loading.value = true;
      const response = await getFlowInstanceById(instanceId);
      currentInstance.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.message;
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
        currentInstance.value = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
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
        currentInstance.value = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
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
        currentInstance.value = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
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
        currentInstance.value = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
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
        currentInstance.value = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const executeNode = async (instanceId, nodeId, input) => {
    if (!instanceId || !nodeId) {
      throw new Error("執行節點時需要提供 instanceId 和 nodeId");
    }
    try {
      loading.value = true;

      // 更新節點狀態為執行中
      if (currentInstance.value?.id === instanceId) {
        const nodeStates = currentInstance.value.nodeStates || {};
        currentInstance.value = {
          ...currentInstance.value,
          nodeStates: {
            ...nodeStates,
            [nodeId]: { status: "running" },
          },
        };
      }

      const response = await executeNodeAPI(instanceId, nodeId, { input });
      if (currentInstance.value?.id === instanceId) {
        currentInstance.value = response.data;
      }
      return response.data;
    } catch (err) {
      // 更新節點狀態為錯誤
      if (currentInstance.value?.id === instanceId) {
        const nodeStates = currentInstance.value.nodeStates || {};
        currentInstance.value = {
          ...currentInstance.value,
          nodeStates: {
            ...nodeStates,
            [nodeId]: {
              status: "error",
              error: err.message,
            },
          },
        };
      }
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
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
      throw err;
    }
  };

  const loadNodeLogs = async (instanceId, nodeId) => {
    try {
      const response = await getNodeLogs(instanceId, nodeId);
      return response.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const clearCurrentInstance = () => {
    currentInstance.value = null;
    executionLogs.value = [];
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // 狀態
    currentInstance,
    instances,
    loading,
    error,
    executionLogs,

    // Getters
    setCurrentInstance,
    getNodeState,
    getNodeContext,
    getNodeLogs,
    canStart,
    canPause,
    canResume,
    canStop,

    // Actions
    loadInstances,
    loadInstance,
    createInstance,
    updateInstance,
    startInstance,
    pauseInstance,
    resumeInstance,
    stopInstance,
    executeNode,
    loadInstanceLogs,
    loadNodeLogs,
    clearCurrentInstance,
    clearError,
  };
});
