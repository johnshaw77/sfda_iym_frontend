<template>
  <div class="rbac-management">
    <el-card class="rbac-card">
      <template #header>
        <div class="card-header">
          <h2>權限管理系統</h2>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="demo-tabs">
        <el-tab-pane label="角色管理" name="roles">
          <role-management />
        </el-tab-pane>
        <el-tab-pane label="權限列表" name="permissions">
          <permission-list />
        </el-tab-pane>
        <el-tab-pane label="用戶角色" name="user-roles">
          <user-role-management />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import RoleManagement from "./components/RoleManagement.vue";
import PermissionList from "./components/PermissionList.vue";
import UserRoleManagement from "./components/UserRoleManagement.vue";

const activeTab = ref("roles");
</script>

<style scoped>
.rbac-management {
  padding: 20px;
}

.rbac-card {
  margin: 0 auto;
  max-width: 1200px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--el-text-color-primary);
}
</style>
