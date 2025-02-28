<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">節點列表</h3>
      <el-input
        v-model="searchQuery"
        placeholder="搜尋節點"
        class="w-48"
        clearable>
        <template #prefix>
          <Search :size="16" />
        </template>
      </el-input>
    </div>

    <el-table
      :data="filteredNodes"
      style="width: 100%"
      size="small"
      :max-height="500"
      @row-click="handleNodeClick">
      <el-table-column
        prop="id"
        label="ID"
        width="80">
        <template #default="{ row }">
          <span class="text-xs font-mono">{{ row.id.substring(0, 8) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        label="類型"
        width="100">
        <template #default="{ row }">
          <el-tag
            size="small"
            :type="getNodeTypeTag(row.type)">
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="data.label"
        label="名稱">
        <template #default="{ row }">
          {{ row.data?.label || "未命名節點" }}
        </template>
      </el-table-column>
      <el-table-column
        width="60"
        align="center">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            @click.stop="handleLocateNode(row)">
            <Target :size="16" />
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-4">
      <el-button
        type="primary"
        @click="$emit('layout')">
        <Layout
          class="mr-1"
          :size="14" />
        重新布局
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  nodes: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["node-click", "locate-node", "layout"]);

const searchQuery = ref("");

const filteredNodes = computed(() => {
  if (!searchQuery.value) {
    return props.nodes;
  }

  const query = searchQuery.value.toLowerCase();
  return props.nodes.filter(
    (node) =>
      node.id.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query) ||
      (node.data?.label || "").toLowerCase().includes(query)
  );
});

const getNodeTypeTag = (type) => {
  const typeMap = {
    input: "success",
    process: "warning",
    output: "danger",
    default: "info",
  };

  // 檢查類型是否包含特定關鍵字
  if (type.includes("input")) return "success";
  if (type.includes("process")) return "warning";
  if (type.includes("output")) return "danger";

  return typeMap[type] || typeMap.default;
};

const handleNodeClick = (row) => {
  emit("node-click", row);
};

const handleLocateNode = (node) => {
  emit("locate-node", node);
};
</script>

<style scoped>
.optimized-node-list {
  width: 100%;
}

.node-item {
  cursor: pointer;
}
</style>
