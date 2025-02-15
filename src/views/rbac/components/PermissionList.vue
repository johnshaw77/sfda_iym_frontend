<template>
  <div class="permission-list">
    <el-table :data="permissions" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="權限名稱" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="使用該權限的角色" min-width="300">
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
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";

const permissions = ref([]);
const loading = ref(false);

// 獲取權限列表
const fetchPermissions = async () => {
  try {
    loading.value = true;
    const [permissionsResponse, rolesResponse] = await Promise.all([
      axios.get("/api/rbac/permissions"),
      axios.get("/api/rbac/roles"),
    ]);

    // 處理權限和角色的關聯關係
    const permissionsWithRoles = permissionsResponse.data.map((permission) => {
      const roles = rolesResponse.data.filter((role) =>
        role.rolePermissions.some((rp) => rp.permission.id === permission.id)
      );
      return {
        ...permission,
        roles,
      };
    });

    permissions.value = permissionsWithRoles;
  } catch (error) {
    ElMessage.error("獲取權限列表失敗");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPermissions);
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
