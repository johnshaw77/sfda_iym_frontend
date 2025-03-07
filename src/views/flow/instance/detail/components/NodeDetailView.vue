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
      <h4>節點配置</h4>
      <json-viewer
        :value="node.data || {}"
        :expand-depth="2"
        expandIconStyle="circle"
        sort
        boxed
        :expand-on-click="true"
        class="custom-json-viewer" />
    </div>
  </div>
</template>

<script setup>
import JsonViewer from "vue-json-viewer";
import "vue-json-viewer/style.css";

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
  // 這裡需要從父組件傳入所有節點數據，或者通過 emit 事件讓父組件處理
  // 簡化起見，這裡直接返回 ID
  return nodeId;
};
</script>
