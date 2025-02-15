<template>
  <div class="permission-list">
    <el-table
      :data="permissions"
      style="width: 100%"
      v-loading="loading"
      @sort-change="handleSortChange"
    >
      <el-table-column type="index" label="序號" width="80" align="center" />
      <el-table-column prop="name" label="權限名稱" sortable="custom" />
      <el-table-column prop="description" label="描述" sortable="custom" />
      <el-table-column
        label="使用該權限的角色"
        min-width="300"
        sortable="custom"
        :sort-method="sortByRolesCount"
      >
        <template #default="{ row }">
          <el-tag
            v-for="role in row.roles"
            :key="role.id"
            class="role-tag"
            type="success"
            size="small"
          >
            {{ role.name }}
          </el-tag>
          <el-tag v-if="!row.roles.length" type="info" size="small">
            暫無角色使用
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { useRbacStore } from "@/stores/rbac";

const rbacStore = useRbacStore();
const sortConfig = ref({ prop: "", order: "" });

const loading = computed(() => rbacStore.loading);

const permissions = computed(() => {
  const allPermissions = rbacStore.permissions;
  const allRoles = rbacStore.roles;

  // 先處理權限和角色的關聯
  let processedPermissions = allPermissions.map((permission) => {
    const roles = allRoles.filter((role) =>
      role.rolePermissions.some((rp) => rp.permission.id === permission.id)
    );
    return {
      ...permission,
      roles,
    };
  });

  // 處理排序
  if (sortConfig.value.prop && sortConfig.value.order) {
    processedPermissions.sort((a, b) => {
      const isAsc = sortConfig.value.order === "ascending";
      if (sortConfig.value.prop === "roles") {
        return isAsc
          ? a.roles.length - b.roles.length
          : b.roles.length - a.roles.length;
      }
      if (a[sortConfig.value.prop] < b[sortConfig.value.prop])
        return isAsc ? -1 : 1;
      if (a[sortConfig.value.prop] > b[sortConfig.value.prop])
        return isAsc ? 1 : -1;
      return 0;
    });
  }

  return processedPermissions;
});

// 處理排序變更
const handleSortChange = ({ prop, order }) => {
  sortConfig.value = { prop, order };
};

// 角色數量排序方法
const sortByRolesCount = (a, b) => {
  return a.roles.length - b.roles.length;
};
</script>

<style scoped>
.permission-list {
  padding: 20px 0;
}

.role-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>
