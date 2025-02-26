// store/flowState.js
import { defineStore } from "pinia";
import {
  getFlowInstances,
  getFlowInstanceById,
  createFlowInstance,
  updateFlowInstance,
  startFlowInstance,
  pauseFlowInstance,
  resumeFlowInstance,
  stopFlowInstance,
  executeNode,
  getInstanceLogs,
  getNodeLogs,
} from "@/api/modules/flow";

export const useFlowStore = defineStore("flow", {
  state: () => ({
    currentInstance: null,
    instances: [],
    loading: false,
    error: null,
    nodeStates: new Map(),
    executionLogs: [],
  }),

  getters: {
    // 獲取特定節點的狀態
    getNodeState: (state) => (nodeId) => {
      return state.currentInstance?.nodeStates?.[nodeId] || { status: "idle" };
    },

    // 獲取特定節點的上下文數據
    getNodeContext: (state) => (nodeId) => {
      return state.currentInstance?.context?.[nodeId] || {};
    },

    // 獲取節點的日誌
    getNodeLogs: (state) => (nodeId) => {
      return (
        state.currentInstance?.logs?.filter((log) => log.nodeId === nodeId) ||
        []
      );
    },

    // 檢查實例是否可以開始執行
    canStart: (state) => {
      return state.currentInstance?.status === "draft";
    },

    // 檢查實例是否可以暫停
    canPause: (state) => {
      return state.currentInstance?.status === "running";
    },

    // 檢查實例是否可以繼續執行
    canResume: (state) => {
      return state.currentInstance?.status === "paused";
    },

    // 檢查實例是否可以停止
    canStop: (state) => {
      return ["running", "paused"].includes(state.currentInstance?.status);
    },
  },

  actions: {
    // 載入所有實例
    async loadInstances(projectId) {
      try {
        this.loading = true;
        const response = await getFlowInstances({ projectId });
        this.instances = response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 載入單個實例
    async loadInstance(instanceId) {
      try {
        this.loading = true;
        const response = await getFlowInstanceById(instanceId);
        this.currentInstance = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 創建新實例
    async createInstance(data) {
      try {
        this.loading = true;
        const response = await createFlowInstance(data);
        this.instances.unshift(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 更新實例
    async updateInstance(instanceId, data) {
      try {
        this.loading = true;
        const response = await updateFlowInstance(instanceId, data);
        if (this.currentInstance?.id === instanceId) {
          this.currentInstance = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 開始執行實例
    async startInstance(instanceId) {
      try {
        this.loading = true;
        const response = await startFlowInstance(instanceId);
        if (this.currentInstance?.id === instanceId) {
          this.currentInstance = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 暫停實例
    async pauseInstance(instanceId) {
      try {
        this.loading = true;
        const response = await pauseFlowInstance(instanceId);
        if (this.currentInstance?.id === instanceId) {
          this.currentInstance = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 繼續執行實例
    async resumeInstance(instanceId) {
      try {
        this.loading = true;
        const response = await resumeFlowInstance(instanceId);
        if (this.currentInstance?.id === instanceId) {
          this.currentInstance = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 停止實例
    async stopInstance(instanceId) {
      try {
        this.loading = true;
        const response = await stopFlowInstance(instanceId);
        if (this.currentInstance?.id === instanceId) {
          this.currentInstance = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 執行節點
    async executeNode(instanceId, nodeId, input) {
      try {
        this.loading = true;
        const response = await executeNode(instanceId, nodeId, { input });

        if (this.currentInstance?.id === instanceId) {
          // 更新節點狀態
          this.currentInstance = response.data;
        }

        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 獲取實例日誌
    async loadInstanceLogs(instanceId) {
      try {
        const response = await getInstanceLogs(instanceId);
        if (this.currentInstance?.id === instanceId) {
          this.executionLogs = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    // 獲取節點日誌
    async loadNodeLogs(instanceId, nodeId) {
      try {
        const response = await getNodeLogs(instanceId, nodeId);
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    // 清除當前實例
    clearCurrentInstance() {
      this.currentInstance = null;
      this.nodeStates.clear();
      this.executionLogs = [];
    },

    // 清除錯誤
    clearError() {
      this.error = null;
    },
  },
});
