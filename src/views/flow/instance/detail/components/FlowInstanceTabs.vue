<template>
  <el-tabs
    v-model="activeTab"
    class="flow-tabs">
    <el-tab-pane
      label="文件"
      name="documents">
      <el-card>
        <el-table
          :data="flowInstance?.documents"
          border
          stripe>
          <el-table-column
            prop="name"
            label="文件名稱"
            min-width="200" />
          <el-table-column
            prop="docType"
            label="類型"
            width="120">
            <template #default="{ row }">
              <el-tag>{{ row.docType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="createdAt"
            label="上傳時間"
            width="180">
            <template #default="{ row }">
              {{ formatTimestamp(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="120"
            fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="handleDownload(row)">
                <Download class="mr-1" />
                下載
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-tab-pane>

    <el-tab-pane
      label="上下文"
      name="context">
      <el-card>
        <vue-json-pretty
          :data="flowInstance?.context"
          :deep="2"
          :show-double-quotes="true"
          :show-length="true"
          :show-line="true" />
      </el-card>
    </el-tab-pane>

    <el-tab-pane
      label="測試"
      name="logs">
      <el-card class="overflow-auto">
        <json-viewer
          :value="flowInstance"
          :expand-depth="5"
          expandIconStyle="circle"
          sort
          boxed
          :expand-on-click="true"
          class="custom-json-viewer" />
      </el-card>
    </el-tab-pane>

    <el-tab-pane
      label="任務列表"
      name="tasks">
      <el-card>
        <flow-task-list
          :nodes="flowInstance?.nodes"
          :edges="flowInstance?.edges" />
      </el-card>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { formatTimestamp } from "@/utils/dateUtils";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import JsonViewer from "vue-json-viewer";
import "vue-json-viewer/style.css";
import FlowTaskList from "./FlowTaskList.vue";
const props = defineProps({
  flowInstance: {
    type: Object,
    required: true,
  },
});

const activeTab = ref("documents");

// 下載文件
const handleDownload = (document) => {
  window.open(document.url, "_blank");
};
</script>

<style scoped>
.flow-tabs :deep(.el-tabs__content) {
  padding: 20px 0;
}
</style>
