<template>
  <div class="node-detail-view">
    <el-descriptions
      :column="2"
      border>
      <el-descriptions-item label="節點 ID">{{ node.id }}</el-descriptions-item>
      <el-descriptions-item label="節點名稱">{{
        node.label
      }}</el-descriptions-item>
      <el-descriptions-item label="節點類型">{{
        node.type
      }}</el-descriptions-item>
      <el-descriptions-item label="狀態">
        <el-tag :type="getStatusType(node.status)">
          {{ getStatusText(node.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="執行時間">{{
        node.executionTime || "-"
      }}</el-descriptions-item>
      <el-descriptions-item label="位置">
        X: {{ node.position.x }}, Y: {{ node.position.y }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="mt-4">
      <h4>依賴節點</h4>
      <el-empty
        v-if="incomingEdges.length === 0"
        description="無依賴節點" />
      <el-tag
        v-for="edge in incomingEdges"
        :key="edge.id"
        class="mr-2 mb-2">
        {{ getNodeLabel(edge.source) }}
      </el-tag>
    </div>

    <div class="mt-4">
      <h4>後續節點</h4>

      <el-empty
        v-if="outgoingEdges.length === 0"
        description="無後續節點" />
      <el-tag
        v-for="edge in outgoingEdges"
        :key="edge.id"
        class="mr-2 mb-2">
        {{ getNodeLabel(edge.target) }}
      </el-tag>
    </div>

    <div class="mt-4">
      <el-tabs>
        <el-tab-pane label="節點配置">
          <json-viewer
            :value="node.data || {}"
            :expand-depth="2"
            expandIconStyle="circle"
            sort
            boxed
            :expand-on-click="true"
            class="custom-json-viewer" />
        </el-tab-pane>
        <el-tab-pane label="節點上下文">
          <json-viewer
            :value="nodeContext || {}"
            :expand-depth="2"
            expandIconStyle="circle"
            sort
            boxed
            :expand-on-click="true"
            class="custom-json-viewer" />
        </el-tab-pane>
        <el-tab-pane label="全域上下文">
          <div v-if="filteredFlowContext.message">
            <el-empty description="未找到與該節點相關的全域上下文數據" />
          </div>
          <json-viewer
            v-else
            :value="filteredFlowContext"
            :expand-depth="2"
            expandIconStyle="circle"
            sort
            boxed
            :expand-on-click="true"
            class="custom-json-viewer" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import JsonViewer from "vue-json-viewer";
import "vue-json-viewer/style.css";
import { computed } from "vue";
import { useFlowStore } from "@/stores/flowStore";

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  incomingEdges: {
    type: Array,
    default: () => [],
  },
  outgoingEdges: {
    type: Array,
    default: () => [],
  },
  allNodes: {
    type: Array,
    default: () => [],
  },
});

// 使用 flowStore 獲取節點上下文
const flowStore = useFlowStore();

// 計算節點上下文
const nodeContext = computed(() => {
  // 從 flowStore 獲取節點上下文
  const baseContext = flowStore.getNodeContextById(props.node.id) || {};

  // 從 sharedData 中獲取以節點 ID 為鍵的數據
  const flowContext = flowStore.currentInstance?.context || {};
  const nodeId = props.node.id;

  // 檢查 sharedData 中是否有該節點的數據
  if (flowContext.sharedData && flowContext.sharedData[nodeId]) {
    return {
      ...baseContext,
      sharedData: flowContext.sharedData[nodeId],
    };
  }

  return baseContext;
});

// 從整個流程的 context 中過濾出該節點相關的內容
const filteredFlowContext = computed(() => {
  const flowContext = flowStore.currentInstance?.context || {};
  const nodeId = props.node.id;
  const result = {};
  console.log("flowContext", props.node.id);
  // 過濾 sharedData 中與該節點相關的數據
  if (flowContext.sharedData) {
    result.sharedData = {};
    Object.entries(flowContext.sharedData).forEach(([key, value]) => {
      // 直接檢查鍵值是否等於節點 ID（新的數據結構）
      console.log("key", key, nodeId);
      if (key === nodeId) {
        result.sharedData[key] = value;
      }
      // 保留原有邏輯，檢查 nodeId 欄位
      else if (value && typeof value === "object" && value.nodeId === nodeId) {
        result.sharedData[key] = value;
      }
      // 保留原有邏輯，檢查鍵值是否包含節點 ID
      else if (key.includes(nodeId)) {
        result.sharedData[key] = value;
      }
    });
    // 如果沒有相關數據，則不顯示該部分
    if (Object.keys(result.sharedData).length === 0) {
      delete result.sharedData;
    }
  }

  // 過濾 globalVariables 中與該節點相關的數據
  if (flowContext.globalVariables) {
    // 對於全域變數，我們顯示所有變數，因為它們對所有節點都可能有用
    result.globalVariables = { ...flowContext.globalVariables };

    // 如果需要，可以在這裡添加特定的過濾邏輯
    // 但基本上全域變數應該對所有節點都可見
  }

  // 過濾 executionHistory 中與該節點相關的數據
  if (flowContext.executionHistory) {
    result.executionHistory = flowContext.executionHistory.filter(
      (item) => item.nodeId === nodeId
    );
    // 如果沒有相關數據，則不顯示該部分
    if (result.executionHistory.length === 0) {
      delete result.executionHistory;
    }
  }

  // 過濾 nodeData 中與該節點相關的數據
  if (flowContext.nodeData && flowContext.nodeData[nodeId]) {
    result.nodeData = {
      [nodeId]: flowContext.nodeData[nodeId],
    };
  }
  console.log("result", result);
  // 如果沒有找到任何相關數據，返回一個提示信息
  if (Object.keys(result).length === 0) {
    return { message: "未找到與該節點相關的全域上下文數據" };
  }

  return result;
});

// 根據狀態獲取標籤類型
const getStatusType = (status) => {
  const statusMap = {
    pending: "info",
    running: "warning",
    completed: "success",
    failed: "danger",
  };
  return statusMap[status] || "info";
};

// 根據狀態獲取顯示文字
const getStatusText = (status) => {
  const statusTextMap = {
    pending: "待執行",
    running: "執行中",
    completed: "已完成",
    failed: "失敗",
  };
  return statusTextMap[status] || "未知";
};

// 根據節點 ID 獲取節點標籤
const getNodeLabel = (nodeId) => {
  // 從 allNodes 中查找對應的節點
  const foundNode = props.allNodes.find((n) => n.id === nodeId);
  return foundNode ? foundNode.label || nodeId : nodeId;
};
</script>

<style scoped>
.custom-json-viewer {
  max-height: 400px;
  overflow: auto;
}
</style>
