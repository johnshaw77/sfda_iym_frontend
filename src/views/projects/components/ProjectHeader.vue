<template>
  <Teleport
    to="#header-actions"
    v-if="showHeaderContent">
    <div class="flex items-center space-x-4">
      <!-- 返回按鈕 -->
      <el-button
        plain
        class="flex items-center"
        @click="handleBack">
        <ArrowLeft
          class="mr-1"
          :size="16" />
        返回專案列表
      </el-button>

      <!-- 重整按鈕 -->
      <el-button
        type="default"
        class="flex items-center"
        :loading="loading"
        @click="handleRefresh">
        <RefreshCw
          class="mr-1"
          :size="16" />
        重整
      </el-button>

      <!-- 新增流程實例按鈕 -->
      <el-button
        type="primary"
        class="flex items-center"
        @click="handleCreateInstance">
        <Plus
          class="mr-1"
          :size="16" />
        新增流程實例
      </el-button>
    </div>
  </Teleport>
</template>

<script setup>
import { ArrowLeft, RefreshCw, Plus } from "lucide-vue-next";

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  showHeaderContent: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["back", "refresh", "createInstance"]);

const handleBack = () => {
  emit("back");
};

const handleRefresh = () => {
  emit("refresh");
};

const handleCreateInstance = () => {
  emit("createInstance");
};
</script>
