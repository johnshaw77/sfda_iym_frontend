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
import { logger } from "@/utils/logger";

// 合併後的工作流程 store
export const useFlowStore = defineStore("flow", () => {
  // 狀態
  const currentInstance = ref(null);
  const breadcrumbInstance = ref(null); // 專門用於麵包屑顯示的實例
  const instances = ref([]);
  const loading = ref(false);
  const executing = ref(false);
  const error = ref(null);
  const executionLogs = ref([]);

  // 正在執行的節點集合，用於防止重複執行
  const executingNodes = ref(new Set());

  // 給麵包屑使用
  const projectName = ref("");
  const projectId = ref("");
  const templateId = ref("");
  const fromProject = ref(false); // 是否從專案詳情頁進入

  // 麵包屑路徑管理 (新增)
  const breadcrumbPath = ref([]);

  // 專案資訊緩存
  const projectCache = ref({});
  // 正在載入的專案 ID 集合，用於防止並發請求
  const loadingProjects = ref(new Set());

  // 檢查節點是否正在執行
  function isNodeExecuting(nodeId) {
    return executingNodes.value.has(nodeId);
  }

  // 設置節點執行狀態
  function setNodeExecuting(nodeId, isExecuting) {
    if (isExecuting) {
      executingNodes.value.add(nodeId);
      logger.debug("flowStore", `節點 ${nodeId} 標記為執行中`);
    } else {
      executingNodes.value.delete(nodeId);
      logger.debug("flowStore", `節點 ${nodeId} 標記為執行完成`);
    }
  }

  // 設置麵包屑路徑
  function setBreadcrumbPath(path) {
    breadcrumbPath.value = path;
  }

  // 獲取麵包屑路徑
  const getBreadcrumbPath = computed(() => {
    return breadcrumbPath.value;
  });

  // 設置是否從專案詳情頁進入
  function setFromProject(value) {
    fromProject.value = value;
  }

  // 設置專案名稱
  function setProjectName(name) {
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
        // 嘗試獲取專案名稱，但不在這裡呼叫 loadProjectInfo
        // 避免與 setBreadcrumbInstance 重複呼叫
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

    // 如果已經有緩存，直接使用緩存
    if (projectCache.value[projectId]) {
      setProjectName(projectCache.value[projectId].name);
      return;
    }

    // 如果正在載入，則不重複請求
    if (loadingProjects.value.has(projectId)) {
      return;
    }

    try {
      // 標記為正在載入
      loadingProjects.value.add(projectId);

      const response = await getProjectById(projectId);
      if (response && response.data) {
        // 保存到緩存
        projectCache.value[projectId] = response.data;
        setProjectName(response.data.name);
      }
    } catch (error) {
      console.error("載入專案資訊失敗:", error);
    } finally {
      // 無論成功或失敗，都移除載入標記
      loadingProjects.value.delete(projectId);
    }
  }

  // 清除專案緩存
  function clearProjectCache(projectId = null) {
    if (projectId) {
      delete projectCache.value[projectId];
    } else {
      projectCache.value = {};
    }
  }

  // Getters
  const getNodeStateById = computed(() => (nodeId) => {
    if (!currentInstance.value || !nodeId) {
      console.log(
        `[flowStore] getNodeStateById: 無法獲取節點 ${nodeId} 的狀態，currentInstance 或 nodeId 不存在`
      );
      return { status: "default" };
    }

    const nodeStates = currentInstance.value.nodeStates || {};
    const state = nodeStates[nodeId] || { status: "default" };
    console.log(
      `[flowStore] getNodeStateById: 獲取節點 ${nodeId} 的狀態:`,
      state
    );
    return state;
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

      // 檢查是否有 _isDataUpdate 標記
      const isDataUpdate = data._isDataUpdate === true;

      // 創建一個新的數據對象，避免修改原始數據
      const updateData = { ...data };

      // 如果有 _isDataUpdate 標記，則從數據中移除它，避免發送到後端
      if (isDataUpdate) {
        delete updateData._isDataUpdate;
      }

      const response = await updateFlowInstance(instanceId, updateData);
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
    // 檢查節點是否已在執行中
    if (isNodeExecuting(nodeId)) {
      logger.warn("flowStore", `節點 ${nodeId} 已在執行中，忽略重複執行請求`);
      return;
    }

    // 標記節點為執行中
    setNodeExecuting(nodeId, true);
    executing.value = true;

    try {
      logger.info("flowStore", `開始執行節點 ${nodeId}`);

      // 更新節點狀態為執行中
      await updateNodeState(instanceId, nodeId, {
        status: "running",
        error: null,
        errorDetails: null,
        startedAt: new Date().toISOString(),
      });

      // 調用 API 執行節點
      const response = await executeNodeAPI(instanceId, nodeId, input);
      logger.info("flowStore", `節點 ${nodeId} 執行成功`);

      // 更新節點狀態為完成
      await updateNodeState(instanceId, nodeId, {
        status: "completed",
        data: response.data,
        error: null,
        errorDetails: null,
        completedAt: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      logger.error("flowStore", `執行節點 ${nodeId} 失敗:`, error);

      // 更新節點狀態為錯誤
      await updateNodeState(instanceId, nodeId, {
        status: "error",
        error: error.message || "執行節點時發生未知錯誤",
        errorDetails: {
          message: error.message,
          stack: error.stack,
        },
        failedAt: new Date().toISOString(),
      });

      throw error;
    } finally {
      // 標記節點為執行完成
      setNodeExecuting(nodeId, false);
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

  // 更新節點狀態 - 優化版本
  const updateNodeState = async (instanceId, nodeId, state) => {
    // 檢查參數
    if (!instanceId || !nodeId || !state) {
      logger.warn("flowStore", "updateNodeState: 缺少必要參數");
      return;
    }

    // 獲取實例
    let instance = currentInstance.value;
    if (instance?.id !== instanceId) {
      logger.warn(
        "flowStore",
        `updateNodeState: 當前實例 ID 與請求的實例 ID 不匹配`
      );
      return;
    }

    // 檢查節點狀態是否已存在
    if (!instance.nodeStates) {
      instance.nodeStates = {};
    }

    // 檢查是否需要更新（避免重複更新相同狀態）
    const currentState = instance.nodeStates[nodeId] || {};
    if (
      currentState.status === state.status &&
      JSON.stringify(currentState.data) === JSON.stringify(state.data) &&
      currentState.error === state.error
    ) {
      logger.debug("flowStore", `節點 ${nodeId} 狀態未變更，跳過更新`);
      return;
    }

    logger.debug("flowStore", `更新節點 ${nodeId} 狀態:`, state);

    // 更新本地狀態
    instance.nodeStates[nodeId] = {
      ...instance.nodeStates[nodeId],
      ...state,
      updatedAt: new Date().toISOString(),
    };

    // 如果是數據更新，則不需要調用 API
    if (state._isDataUpdate) {
      logger.debug(
        "flowStore",
        `節點 ${nodeId} 狀態更新為數據更新，不調用 API`
      );
      return;
    }

    try {
      // 構建更新數據
      const updateData = {
        nodeStates: {
          [nodeId]: instance.nodeStates[nodeId],
        },
      };

      // 調用 API 更新節點狀態
      const response = await updateFlowInstance(instanceId, updateData);
      logger.debug(
        "flowStore",
        `節點 ${nodeId} 狀態已更新:`,
        response.data.nodeStates?.[nodeId]
      );
    } catch (error) {
      logger.error("flowStore", `更新節點 ${nodeId} 狀態失敗:`, error);
      ElMessage.error(`更新節點狀態失敗: ${error.message || "未知錯誤"}`);
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

  // 設置麵包屑使用的流程實例（僅提取必要資訊）
  function setBreadcrumbInstance(instance, options = {}) {
    if (!instance) {
      breadcrumbInstance.value = null;
      breadcrumbPath.value = [];
      return null;
    }

    // 只提取麵包屑需要的資訊，避免完整實例帶來的影響
    breadcrumbInstance.value = {
      id: instance.id,
      name: instance.name,
      projectId: instance.projectId,
      templateId: instance.templateId,
      status: instance.status,
      // 添加模板和專案信息
      template: instance.template
        ? {
            id: instance.template.id,
            name: instance.template.name,
          }
        : null,
      project: instance.project
        ? {
            id: instance.project.id,
            name: instance.project.name,
          }
        : null,
    };

    // 如果需要，可以更新專案和模板 ID
    if (instance.projectId) {
      setProjectId(instance.projectId);
      // 在這裡集中呼叫 loadProjectInfo，避免重複呼叫
      // 檢查是否需要載入專案資訊
      const { noLoadProject = false } = options;
      if (!noLoadProject) {
        loadProjectInfo(instance.projectId);
      }
    }

    if (instance.templateId) {
      setTemplateId(instance.templateId);
    }

    // 根據來源設置麵包屑路徑
    const { fromProject = false } = options;
    setFromProject(fromProject);

    // 設置麵包屑路徑
    if (fromProject && instance.project) {
      // 從專案詳情頁進入，設置「專案管理」->「專案」->「實例名稱」的麵包屑
      const projectName = instance.project.name || "專案詳情";
      const instanceName = instance.template
        ? instance.template.name
        : instance.name || "流程實例";

      setBreadcrumbPath([
        { name: "專案管理", path: "/projects" },
        { name: projectName, path: `/projects/${instance.projectId}` },
        { name: instanceName, path: `/flow-instances/${instance.id}` },
      ]);
    } else {
      // 從流程實例管理頁進入，設置「流程實例」->「實例名稱」的麵包屑
      const instanceName = instance.template
        ? instance.template.name
        : instance.name || "流程實例";

      setBreadcrumbPath([
        { name: "流程實例", path: "/flow-instances" },
        { name: instanceName, path: `/flow-instances/${instance.id}` },
      ]);
    }

    return breadcrumbInstance.value;
  }

  return {
    // 狀態
    currentInstance,
    breadcrumbInstance,
    instances,
    loading,
    executing,
    error,
    executionLogs,
    projectName,
    projectId,
    templateId,
    fromProject,
    breadcrumbPath,

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
    getBreadcrumbPath,

    // Actions
    setBreadcrumbPath,
    setFromProject,
    setProjectName,
    setProjectId,
    setTemplateId,
    setCurrentInstance,
    loadProjectInfo,
    clearProjectCache,
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
    setBreadcrumbInstance,
    isNodeExecuting,
    setNodeExecuting,
  };
});
