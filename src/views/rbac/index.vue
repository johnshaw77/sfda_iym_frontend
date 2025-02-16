<template>
  <div class="rbac-management">
    <el-tabs v-model="activeTab" class="demo-tabs" v-loading="loading">
      <el-tab-pane label="用戶管理" name="users">
        <user-management />
      </el-tab-pane>
      <el-tab-pane label="角色管理" name="roles">
        <role-management />
      </el-tab-pane>
      <el-tab-pane label="權限列表" name="permissions">
        <permission-list />
      </el-tab-pane>
      <!-- <el-tab-pane label="用戶角色" name="user-roles">
        <user-role-management />
      </el-tab-pane> -->
    </el-tabs>
    <!-- 使用 Teleport 將按鈕傳送到主佈局 -->
    <Teleport to="#header-actions"> </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, Teleport } from "vue";
import UserManagement from "./components/UserManagement.vue";
import RoleManagement from "./components/RoleManagement.vue";
import PermissionList from "./components/PermissionList.vue";
import UserRoleManagement from "./components/UserRoleManagement.vue";
import { useRbacStore } from "@/stores/rbac";

const activeTab = ref("users");
const rbacStore = useRbacStore();
const loading = computed(() => rbacStore.loading);

onMounted(async () => {
  await rbacStore.initialize();
});
</script>

<style scoped>
.rbac-management {
  @apply h-full w-full;
}

:deep(.el-tabs) {
  @apply h-full p-2 bg-white;
}

:deep(.el-tabs__content) {
  @apply h-[calc(100%-40px)] overflow-auto;
}

:deep(.el-tab-pane) {
  @apply h-full;
}
</style>
