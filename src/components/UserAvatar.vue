<template>
  <div class="flex items-center">
    <el-avatar
      :size="size"
      :shape="shape"
      :alt="user.username"
      :src="`http://localhost:3001/uploads/avatars/${user?.avatar}`">
      {{ user.username.charAt(0).toUpperCase() }}
    </el-avatar>
    <span
      v-if="showName"
      class="ml-2 text-xs"
      >{{ user.username }}</span
    >
  </div>
</template>
<script setup>
defineProps({
  shape: {
    type: String,
    default: "circle", // 圓形或方形 circle/square
  },
  user: {
    type: Object,
    required: true,
  },
  size: {
    type: Number,
    default: 24,
  },
  showName: {
    type: Boolean,
    default: false,
  },
});
</script>
