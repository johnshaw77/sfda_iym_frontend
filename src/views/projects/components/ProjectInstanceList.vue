<template>
  <div class="bg-white p-2 border-b border-gray-200">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">流程實例列表</h3>
      <div class="flex items-center space-x-2">
        <el-select
          v-model="filterStatus"
          placeholder="篩選狀態"
          clearable
          size="small"
          class="!w-24">
          <el-option
            v-for="status in statusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value">
            <el-tag
              :type="status.tagType"
              size="small">
              {{ status.label }}
            </el-tag>
          </el-option>
        </el-select>
      </div>
    </div>

    <el-table
      :data="filteredInstances"
      v-loading="loading"
      style="width: 100%">
      <el-table-column
        type="index"
        label="序號"
        width="80" />
      <el-table-column
        prop="template.name"
        label="模板名稱"
        min-width="120" />
      <el-table-column
        label="狀態"
        width="120"
        align="center">
        <template #default="{ row }">
          <el-tag :type="getInstanceStatusType(row.status)">
            {{ getInstanceStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="建立者"
        width="150"
        align="center">
        <template #default="{ row }">
          <div class="flex items-center justify-center">
            <UserAvatar
              :user="row.creator"
              :size="24"
              :show-name="true"
              shape="square"
              class="mr-1" />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="createdAt"
        label="建立時間"
        width="180">
        <template #default="{ row }">
          {{ formatTimestamp(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="updatedAt"
        label="更新時間"
        width="180">
        <template #default="{ row }">
          {{ formatTimestamp(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="200"
        fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            @click="handleView(row)">
            查看
          </el-button>
          <el-button
            type="danger"
            link
            @click="handleDelete(row)">
            刪除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div
      v-if="!loading && instances.length === 0"
      class="text-center py-8 text-gray-500">
      <FileX
        :size="48"
        class="mx-auto mb-4 text-gray-300" />
      <p>此專案尚未建立流程實例</p>
      <el-button
        type="primary"
        class="mt-4"
        @click="handleCreate">
        新增流程實例
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { formatTimestamp } from "@/utils/dateUtils";

const props = defineProps({
  instances: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  statusOptions: {
    type: Array,
    default: () => [
      { label: "草稿", value: "draft", tagType: "info" },
      { label: "進行中", value: "active", tagType: "warning" },
      { label: "已完成", value: "completed", tagType: "success" },
      { label: "已取消", value: "cancelled", tagType: "danger" },
    ],
  },
});

const emit = defineEmits(["view", "delete", "create"]);

const filterStatus = ref("");

// 過濾後的實例列表
const filteredInstances = computed(() => {
  if (!filterStatus.value) return props.instances;
  return props.instances.filter(
    (instance) => instance.status === filterStatus.value
  );
});

// 獲取實例狀態標籤類型
const getInstanceStatusType = (status) => {
  const types = {
    draft: "info",
    active: "warning",
    completed: "success",
    cancelled: "danger",
  };
  return types[status] || "info";
};

// 獲取實例狀態文字
const getInstanceStatusText = (status) => {
  const texts = {
    draft: "草稿",
    active: "進行中",
    completed: "已完成",
    cancelled: "已取消",
  };
  return texts[status] || status;
};

const handleView = (instance) => {
  emit("view", instance);
};

const handleDelete = (instance) => {
  emit("delete", instance);
};

const handleCreate = () => {
  emit("create");
};
</script>
