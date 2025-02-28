<template>
  <div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <el-skeleton
      v-for="i in count"
      :key="i"
      style="width: 100%"
      animated>
      <template #template>
        <div class="border rounded-md p-4 h-[300px]">
          <div class="flex justify-between items-center mb-4">
            <el-skeleton-item
              variant="text"
              style="width: 60%" />
            <el-skeleton-item
              variant="button"
              style="width: 20%" />
          </div>
          <el-skeleton-item
            variant="p"
            style="width: 100%; height: 80px" />
          <div class="flex gap-2 my-4">
            <el-skeleton-item
              variant="button"
              style="width: 20%" />
            <el-skeleton-item
              variant="button"
              style="width: 30%" />
          </div>
          <div class="space-y-2 mb-4">
            <el-skeleton-item
              variant="text"
              style="width: 100%" />
            <el-skeleton-item
              variant="text"
              style="width: 100%" />
          </div>
          <div class="flex justify-between mt-4">
            <div class="flex gap-2">
              <el-skeleton-item
                variant="button"
                style="width: 60px" />
              <el-skeleton-item
                variant="button"
                style="width: 60px" />
            </div>
            <el-skeleton-item
              variant="button"
              style="width: 40px" />
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 4,
  },
});
</script>
