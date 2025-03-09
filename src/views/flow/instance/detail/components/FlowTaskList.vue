<!-- 開發測試用 -->
<template>
  <div class="flow-task-list">
    <el-table
      :data="taskList"
      border
      stripe>
      <el-table-column
        type="index"
        width="60"
        align="center" />
      <el-table-column
        prop="id"
        label="ID"
        width="220"
        align="center">
        <template #default="{ row }">
          {{ row.id }}
          <!-- <el-tooltip
            :content="row.id"
            effect="light"
            placement="top">
            編號
          </el-tooltip> -->
        </template>
      </el-table-column>
      <el-table-column
        prop="label"
        label="節點名稱"
        min-width="180">
        <template #default="{ row }">
          {{ row.data.name }}<br />
          {{ row.data.description }}
          <!-- <json-viewer :value="row" /> -->
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        label="節點類型"
        width="200">
        <template #default="{ row }">
          <el-tag>{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="狀態"
        align="center"
        width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="executionTime"
        label="執行時間"
        align="center"
        width="180" />
      <!-- <el-table-column
        prop="dependencies"
        align="center"
        label="依賴節點"
        min-width="150">
        <template #default="{ row }">
          <el-tag
            v-for="dep in row.dependencies"
            :key="dep.id"
            size="small"
            class="mr-1">
            {{ dep.data.name }}
          </el-tag>
        </template>
      </el-table-column> -->
      <el-table-column
        label="操作"
        width="200"
        fixed="right"
        align="center">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            @click="handleViewDetail(row)">
            查看詳情
          </el-button>
          <el-button
            type="success"
            link
            @click="handleHighlightNode(row)">
            定位節點
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 節點詳情對話框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="節點詳情"
      width="60%">
      <node-detail-view
        v-if="selectedNode"
        :node="selectedNode"
        :incoming-edges="getIncomingEdges(selectedNode.id)"
        :outgoing-edges="getOutgoingEdges(selectedNode.id)"
        :all-nodes="props.nodes" />
    </el-dialog>
  </div>
</template>

<script setup>
import NodeDetailView from "./NodeDetailView.vue";

// import JsonViewer from "vue-json-viewer";
// import "vue-json-viewer/style.css";

const props = defineProps({
  nodes: {
    type: Array,
    default: () => [],
  },
  edges: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["highlight-node"]);

// 選中的節點
const selectedNode = ref(null);
const detailDialogVisible = ref(false);

// 計算任務列表
const taskList2 = computed(() => {
  const taskNodes = props.nodes.filter((node) => node.type !== "file");
  return taskNodes.map((node) => {
    // 找出所有指向該節點的邊
    const incomingEdges = props.edges.filter((edge) => edge.target === node.id);

    // 找出所有依賴節點
    const dependencies = incomingEdges
      .map((edge) => {
        return props.nodes.find((n) => n.id === edge.source);
      })
      .filter(Boolean);

    // 計算節點狀態（這裡可以根據您的業務邏輯調整）
    const status = node.data?.status || "pending";

    return {
      ...node,
      dependencies,
      status,
      executionTime: node.data?.executionTime || "-",
    };
  });
});

const taskList = computed(() => {
  return topologicalSort(props.nodes, props.edges);
});

// 拓撲排序函數
const topologicalSort = (nodes, edges) => {
  // 創建鄰接表
  const graph = {};
  nodes.forEach((node) => {
    graph[node.id] = [];
  });

  // 填充鄰接表
  edges.forEach((edge) => {
    if (graph[edge.source]) {
      graph[edge.source].push(edge.target);
    }
  });

  // 計算入度
  const inDegree = {};
  nodes.forEach((node) => {
    inDegree[node.id] = 0;
  });

  edges.forEach((edge) => {
    inDegree[edge.target]++;
  });

  // 找出所有入度為0的節點
  const queue = [];
  Object.keys(inDegree).forEach((nodeId) => {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId);
    }
  });

  // 拓撲排序結果
  const result = [];

  // 執行拓撲排序
  while (queue.length > 0) {
    const nodeId = queue.shift();
    result.push(nodeId);

    graph[nodeId].forEach((neighbor) => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  // 檢查是否有環
  if (result.length !== nodes.length) {
    console.warn("工作流中存在環路，無法確定明確的執行順序");
  }

  // 返回排序後的節點
  return result.map((nodeId) => nodes.find((node) => node.id === nodeId));
};

// 獲取入邊
const getIncomingEdges = (nodeId) => {
  return props.edges.filter((edge) => edge.target === nodeId);
};

// 獲取出邊
const getOutgoingEdges = (nodeId) => {
  return props.edges.filter((edge) => edge.source === nodeId);
};

// 根據狀態獲取標籤類型 TODO: 抽離& 確認
const getStatusType = (status) => {
  const statusMap = {
    pending: "info",
    running: "warning",
    completed: "success",
    failed: "danger",
    idle: "info",
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
    idle: "閒置",
  };
  return statusTextMap[status] || "未知";
};

// 查看節點詳情
const handleViewDetail = (node) => {
  console.log("node", node);
  selectedNode.value = node;
  detailDialogVisible.value = true;
};

// 高亮顯示節點
const handleHighlightNode = (node) => {
  emit("highlight-node", node.id);
};
</script>
