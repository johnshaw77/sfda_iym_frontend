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
  const breadcrumbInstance = ref(null); // 專門用於麵包屑顯示的實例
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

  // 麵包屑路徑管理 (新增)
  const breadcrumbPath = ref([]);

  // 專案資訊緩存
  const projectCache = ref({});
  // 正在載入的專案 ID 集合，用於防止並發請求
  const loadingProjects = ref(new Set());

  // 設置麵包屑路徑
  function setBreadcrumbPath(path) {
    console.log("設置麵包屑路徑", path);
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
    console.log("setProjectName", name);
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

      console.log("instance", instance);
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
      console.log("使用緩存的專案資訊:", projectId);
      setProjectName(projectCache.value[projectId].name);
      return;
    }

    // 如果正在載入，則不重複請求
    if (loadingProjects.value.has(projectId)) {
      console.log("專案資訊正在載入中，跳過重複請求:", projectId);
      return;
    }

    try {
      // 標記為正在載入
      loadingProjects.value.add(projectId);
      console.log("開始載入專案資訊:", projectId);

      const response = await getProjectById(projectId);
      if (response && response.data) {
        // 保存到緩存
        projectCache.value[projectId] = response.data;
        setProjectName(response.data.name);
        console.log("專案資訊載入成功並緩存:", projectId);
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

    // console.log(`準備執行節點 - 實例ID: ${instanceId}, 節點ID: ${nodeId}`);
    // console.log("輸入數據:", JSON.stringify(input, null, 2));

    try {
      executing.value = true;

      // 獲取當前實例
      const instance = currentInstance.value;
      if (!instance) {
        throw new Error(`找不到流程實例 ${instanceId}`);
      }

      // 獲取節點數據
      const nodeData = instance.nodeData?.[nodeId] || {};
      // console.log("節點數據:", JSON.stringify(nodeData, null, 2));

      // 合併節點數據和輸入數據
      const mergedInput = {
        ...nodeData,
        ...input,
      };
      // console.log("合併後的輸入數據:", JSON.stringify(mergedInput, null, 2));

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

      // 確保只傳遞節點數據，不修改流程結構
      // 如果流程實例狀態為 running，則只更新節點數據和狀態
      const apiPayload = {
        ...mergedInput,
        // 明確標記這是數據更新，而不是結構更新
        _isDataUpdate: true,
      };

      const response = await executeNodeAPI(instanceId, nodeId, apiPayload);
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
  };
});
