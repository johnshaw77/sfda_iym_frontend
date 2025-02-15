<template>
  <div class="user-role-management">
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索用戶名或郵箱"
        clearable
        @clear="handleSearch"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <el-table :data="filteredUsers" style="width: 100%" v-loading="loading">
      <el-table-column prop="username" label="用戶名" />
      <el-table-column prop="email" label="郵箱" />
      <el-table-column label="當前角色" min-width="300">
        <template #default="{ row }">
          <el-tag
            v-for="userRole in row.userRoles"
            :key="userRole.role.id"
            class="role-tag"
            :type="getRoleTagType(userRole.role.name)"
            size="small"
          >
            {{ userRole.role.name }}
          </el-tag>
          <el-tag v-if="!row.userRoles.length" type="info" size="small">
            暫無角色
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="handleEditUserRoles(row)"
          >
            分配角色
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 角色分配對話框 -->
    <el-dialog v-model="dialogVisible" title="分配角色" width="500px">
      <template v-if="selectedUser">
        <p class="user-info">
          用戶：{{ selectedUser.username }}
          <el-tag size="small" type="info">{{ selectedUser.email }}</el-tag>
        </p>

        <el-form :model="roleForm" label-width="80px">
          <el-form-item label="角色">
            <el-checkbox-group v-model="roleForm.roles">
              <el-checkbox
                v-for="role in availableRoles"
                :key="role.id"
                :label="role.id"
                :disabled="role.name === 'SUPER_ADMIN' && !isSuperAdmin"
              >
                {{ role.name }}
                <el-tooltip
                  :content="role.description"
                  placement="top"
                  effect="light"
                >
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </template>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit"> 確認 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Search, InfoFilled } from "@element-plus/icons-vue";
import axios from "axios";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const isSuperAdmin = computed(() => {
  return userStore.user?.role === "SUPER_ADMIN";
});

const users = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const dialogVisible = ref(false);
const selectedUser = ref(null);
const availableRoles = ref([]);

const roleForm = ref({
  roles: [],
});

// 過濾用戶列表
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;

  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
  );
});

// 獲取用戶列表
const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await axios.get("/api/users");
    users.value = response.data;
  } catch (error) {
    ElMessage.error("獲取用戶列表失敗");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 獲取角色列表
const fetchRoles = async () => {
  try {
    const response = await axios.get("/api/rbac/roles");
    availableRoles.value = response.data;
  } catch (error) {
    ElMessage.error("獲取角色列表失敗");
    console.error(error);
  }
};

// 處理搜索
const handleSearch = () => {
  // 已通過計算屬性實現
};

// 獲取角色標籤類型
const getRoleTagType = (roleName) => {
  switch (roleName) {
    case "SUPER_ADMIN":
      return "danger";
    case "ADMIN":
      return "warning";
    default:
      return "success";
  }
};

// 編輯用戶角色
const handleEditUserRoles = (user) => {
  selectedUser.value = user;
  roleForm.value.roles = user.userRoles.map((ur) => ur.role.id);
  dialogVisible.value = true;
};

// 提交角色分配
const handleSubmit = async () => {
  if (!selectedUser.value) return;

  try {
    // 獲取用戶當前的角色ID列表
    const currentRoleIds = selectedUser.value.userRoles.map((ur) => ur.role.id);

    // 要添加的角色
    const rolesToAdd = roleForm.value.roles.filter(
      (roleId) => !currentRoleIds.includes(roleId)
    );

    // 要移除的角色
    const rolesToRemove = currentRoleIds.filter(
      (roleId) => !roleForm.value.roles.includes(roleId)
    );

    // 添加新角色
    for (const roleId of rolesToAdd) {
      await axios.post("/api/rbac/user-roles", {
        userId: selectedUser.value.id,
        roleId,
      });
    }

    // 移除舊角色
    for (const roleId of rolesToRemove) {
      await axios.delete(
        `/api/rbac/user-roles/${selectedUser.value.id}/${roleId}`
      );
    }

    ElMessage.success("角色分配成功");
    dialogVisible.value = false;
    await fetchUsers();
  } catch (error) {
    ElMessage.error("角色分配失敗");
    console.error(error);
  }
};

// 初始化
fetchUsers();
fetchRoles();
</script>

<style scoped>
.user-role-management {
  padding: 20px 0;
}

.search-bar {
  margin-bottom: 20px;
  max-width: 300px;
}

.role-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.user-info {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-icon {
  margin-left: 4px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  cursor: help;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
