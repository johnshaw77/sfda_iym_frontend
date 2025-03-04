<template>
  <Teleport
    to="#header-actions"
    v-if="showHeaderContent">
    <el-select
      v-model="queryParams.projectId"
      class="w-64"
      placeholder="選擇專案"
      clearable
      :fit-input-width="true"
      @change="handleSearch">
      <el-option
        v-for="project in projects"
        :key="project.id"
        :label="project.name"
        :value="project.id" />
    </el-select>
    <el-select
      v-model="queryParams.status"
      class="w-32"
      placeholder="選擇狀態"
      clearable
      @change="handleSearch">
      <el-option
        v-for="status in statusOptions"
        :key="status.value"
        :label="status.label"
        :value="status.value">
        <el-tag
          :type="status.tagType"
          size="small"
          >{{ status.label }}</el-tag
        >
      </el-option>
    </el-select>
    <el-button
      plain
      @click="handleRefresh"
      :loading="loading"
      title="重新整理">
      <RotateCw
        class="mr-1"
        :size="14" />
      重整
    </el-button>
    <el-button
      type="primary"
      @click="handleCreate">
      <Plus class="mr-1" /> 新建流程實例
    </el-button>
    <el-button
      type="danger"
      :disabled="selectedInstances.length === 0"
      @click="handleBatchDelete"
      :title="
        isAdmin
          ? '管理員可以強制刪除任何狀態的流程實例'
          : '只能刪除草稿或失敗狀態的流程實例'
      ">
      <Trash2 class="mr-1" /> 批次刪除 ({{ selectedInstances.length }})
    </el-button>
  </Teleport>
</template>

<script setup>
//import { RotateCw, Plus, Trash2 } from "lucide-vue-next";

const props = defineProps({
  queryParams: {
    type: Object,
    required: true,
  },
  projects: {
    type: Array,
    required: true,
  },
  statusOptions: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showHeaderContent: {
    type: Boolean,
    default: true,
  },
  selectedInstances: {
    type: Array,
    default: () => [],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["search", "refresh", "create", "batch-delete"]);

// 搜索
const handleSearch = () => {
  emit("search");
};

// 刷新
const handleRefresh = () => {
  emit("refresh");
};

// 創建流程實例
const handleCreate = () => {
  emit("create");
};

// 批次刪除
const handleBatchDelete = () => {
  emit("batch-delete");
};
</script>
