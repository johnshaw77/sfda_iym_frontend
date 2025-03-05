<template>
  <div class="bg-white p-2 pb-4 border-b border-gray-200">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">📍 專案統計資訊</h3>
    </div>

    <div
      v-if="loading"
      class="py-4">
      <el-skeleton
        animated
        :rows="3" />
    </div>
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-blue-50 p-4 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">流程實例總數</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ statistics.totalInstances }}
            </p>
          </div>
          <div class="bg-blue-100 p-2 rounded-full">
            <GitBranch
              :size="24"
              class="text-blue-500" />
          </div>
        </div>
      </div>
      <div class="bg-green-50 p-4 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">已完成實例</p>
            <p class="text-2xl font-bold text-green-600">
              {{ statistics.completedInstances }}
            </p>
          </div>
          <div class="bg-green-100 p-2 rounded-full">
            <CheckCircle
              :size="24"
              class="text-green-500" />
          </div>
        </div>
      </div>
      <div class="bg-yellow-50 p-4 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">進行中實例</p>
            <p class="text-2xl font-bold text-yellow-600">
              {{ statistics.activeInstances }}
            </p>
          </div>
          <div class="bg-yellow-100 p-2 rounded-full">
            <Clock
              :size="24"
              class="text-yellow-500" />
          </div>
        </div>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">文檔總數</p>
            <p class="text-2xl font-bold text-purple-600">
              {{ statistics.totalDocuments }}
            </p>
          </div>
          <div class="bg-purple-100 p-2 rounded-full">
            <FileText
              :size="24"
              class="text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  statistics: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>
