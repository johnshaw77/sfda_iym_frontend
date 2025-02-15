<template>
  <div class="user-management">
    <!-- 用戶列表區域 -->
    <div class="user-list-section">
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用戶..."
          class="search-input"
          clearable
          @clear="handleSearch"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleAddUser">
          <el-icon><Plus /></el-icon>新增用戶
        </el-button>
      </div>

      <el-table
        :data="filteredUsers"
        style="width: 100%"
        v-loading="loading"
        @row-click="handleUserSelect"
        :highlight-current-row="true"
      >
        <el-table-column type="index" label="序號" width="80" align="center" />
        <el-table-column prop="username" label="用戶名" sortable />
        <el-table-column prop="email" label="郵箱" sortable />
        <el-table-column prop="status" label="狀態" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === "active" ? "啟用" : "停用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已分配角色" min-width="200">
          <template #default="{ row }">
            <div
              class="role-display"
              @dblclick="handleRoleEditStart(row)"
              v-if="!row.isEditingRoles"
            >
              <template v-if="row.userRoles && row.userRoles.length">
                <el-tag
                  v-for="roleId in row.userRoles"
                  :key="roleId"
                  class="role-tag"
                  size="small"
                  :type="getRoleTagType(getRoleName(roleId))"
                >
                  {{ getRoleName(roleId) }}
                </el-tag>
              </template>
              <span v-else class="no-roles">未分配角色</span>
            </div>
            <div
              v-else
              class="role-edit-container"
              tabindex="0"
              @blur="handleRoleEditBlur($event, row)"
              @mousedown.stop="handleContainerMouseDown"
            >
              <el-select
                v-model="row.tempRoles"
                multiple
                tag-effect="plain"
                :loading="row.rolesLoading"
                placeholder="選擇角色"
                class="role-select"
              >
                <el-option
                  v-for="role in allRoles"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
                >
                  <span>{{ role.name }}</span>
                  <el-tooltip
                    :content="role.description"
                    placement="right"
                    effect="light"
                  >
                    <el-icon class="role-info-icon"><InfoFilled /></el-icon>
                  </el-tooltip>
                </el-option>
              </el-select>
              <div class="role-edit-actions">
                <el-button
                  type="primary"
                  size="small"
                  :loading="row.rolesLoading"
                  @click="handleRoleUpdate(row)"
                >
                  更新
                </el-button>
                <el-button size="small" @click="handleRoleEditCancel(row)">
                  取消
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                :icon="Edit"
                size="small"
                @click.stop="handleEditUser(row)"
              >
                編輯
              </el-button>
              <el-button
                type="danger"
                :icon="Delete"
                size="small"
                @click.stop="handleDeleteUser(row)"
              >
                刪除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 用戶表單對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯用戶' : '新增用戶'"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="用戶名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="郵箱" prop="email">
          <el-input v-model="userForm.email" :disabled="isEdit" />
          <div class="form-item-tip" v-if="isEdit">
            <el-icon><InfoFilled /></el-icon>
            <span>郵箱是用戶的唯一標識，不可更改</span>
          </div>
        </el-form-item>
        <el-form-item label="密碼" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="狀態" prop="status">
          <el-switch
            v-model="userForm.status"
            :active-value="'active'"
            :inactive-value="'inactive'"
            active-text="啟用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmitUser"
          :loading="submitting"
        >
          確定
        </el-button>
      </template>
    </el-dialog>

    <!-- 刪除確認對話框 -->
    <el-dialog v-model="deleteDialogVisible" title="確認刪除" width="400px">
      <p>確定要刪除此用戶嗎？此操作不可恢復。</p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          @click="handleDeleteConfirm"
          :loading="deleting"
        >
          確定刪除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  Plus,
  Edit,
  Delete,
  Search,
  InfoFilled,
} from "@element-plus/icons-vue";
import { useRbacStore } from "@/stores/rbac";

// Store
const rbacStore = useRbacStore();

// 狀態
const loading = ref(false);
const rolesLoading = ref(false);
const searchQuery = ref("");
const selectedUser = ref(null);
const dialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const deleting = ref(false);

// 表單相關
const userFormRef = ref(null);
const userForm = ref({
  username: "",
  email: "",
  password: "",
  status: "active",
});

// 表單驗證規則
const userFormRules = {
  username: [
    { required: true, message: "請輸入用戶名", trigger: "blur" },
    { min: 2, max: 20, message: "長度在 2 到 20 個字符", trigger: "blur" },
  ],
  email: [
    { required: !isEdit, message: "請輸入郵箱", trigger: "blur" },
    { type: "email", message: "請輸入正確的郵箱格式", trigger: "blur" },
  ],
  password: [
    { required: true, message: "請輸入密碼", trigger: "blur" },
    { min: 6, message: "密碼長度不能小於 6 個字符", trigger: "blur" },
  ],
};

// 計算屬性
const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return rbacStore.users
    .map((user) => ({
      ...user,
      rolesLoading: false,
      isEditingRoles: false,
      userRoles: user.userRoles.map((ur) => ur.role.id),
      tempRoles: user.userRoles.map((ur) => ur.role.id),
    }))
    .filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
});

// 所有角色
const allRoles = computed(() =>
  rbacStore.roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
  }))
);

// 分配角色
const assignedRoleIds = computed({
  get: () => selectedUser.value?.userRoles?.map((ur) => ur.role.id) || [],
  set: async (newValue) => {
    if (!selectedUser.value) return;

    rolesLoading.value = true;
    try {
      // 這裡需要實現角色分配的邏輯
      await rbacStore.updateUserRoles(selectedUser.value.id, newValue);
      ElMessage.success("角色更新成功");
    } catch (error) {
      ElMessage.error("角色更新失敗");
    } finally {
      rolesLoading.value = false;
    }
  },
});

// 獲取角色名稱的方法
const getRoleName = (roleId) => {
  const role = allRoles.value.find((r) => r.id === roleId);
  return role ? role.name : "";
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

// 處理容器失去焦點
const handleRoleEditBlur = (event, row) => {
  // 檢查相關目標是否是容器內的元素
  if (
    event.relatedTarget &&
    event.currentTarget.contains(event.relatedTarget)
  ) {
    return;
  }
  handleRoleEditCancel(row);
};

// 處理容器的鼠標按下事件
const handleContainerMouseDown = (event) => {
  // 防止容器在點擊內部元素時失去焦點
  event.preventDefault();
};

// 開始編輯角色
const handleRoleEditStart = (row) => {
  row.tempRoles = [...row.userRoles];
  row.isEditingRoles = true;
  // 在下一個事件循環中設置焦點
  setTimeout(() => {
    const container = document.querySelector(".role-edit-container");
    if (container) {
      container.focus();
    }
  });
};

// 取消編輯角色
const handleRoleEditCancel = (row) => {
  row.tempRoles = [...row.userRoles];
  row.isEditingRoles = false;
};

// 更新角色
const handleRoleUpdate = async (row) => {
  row.rolesLoading = true;
  try {
    await rbacStore.updateUserRoles(row.id, row.tempRoles);
    row.userRoles = [...row.tempRoles];
    ElMessage.success("角色更新成功");
    row.isEditingRoles = false;
  } catch (error) {
    ElMessage.error("角色更新失敗");
    row.tempRoles = [...row.userRoles];
  } finally {
    row.rolesLoading = false;
  }
};

// 方法
const handleSearch = () => {
  // 搜索邏輯已通過 computed 屬性實現
};

// 選擇用戶
const handleUserSelect = (row) => {
  selectedUser.value = row;
};

// 新增用戶
const handleAddUser = () => {
  isEdit.value = false;
  userForm.value = {
    username: "",
    email: "",
    password: "",
    status: "active",
  };
  dialogVisible.value = true;
};

// 編輯用戶
const handleEditUser = (user) => {
  isEdit.value = true;
  userForm.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    status: user.status,
  };
  dialogVisible.value = true;
};

// 刪除用戶
const handleDeleteUser = (user) => {
  deleteDialogVisible.value = true;
  selectedUser.value = user;
};

// 對話框關閉
const handleDialogClose = () => {
  userFormRef.value?.resetFields();
};

// 提交用戶
const handleSubmitUser = async () => {
  if (!userFormRef.value) return;

  await userFormRef.value.validate(async (valid) => {
    if (!valid) return;

    submitting.value = true;
    try {
      if (isEdit.value) {
        await rbacStore.updateUser(userForm.value.id, userForm.value);
        ElMessage.success("用戶更新成功");
      } else {
        await rbacStore.createUser(userForm.value);
        ElMessage.success("用戶創建成功");
      }
      dialogVisible.value = false;
    } catch (error) {
      ElMessage.error(error.message || "操作失敗");
    } finally {
      submitting.value = false;
    }
  });
};

// 刪除確認
const handleDeleteConfirm = async () => {
  if (!selectedUser.value) return;

  deleting.value = true;
  try {
    await rbacStore.deleteUser(selectedUser.value.id);
    ElMessage.success("用戶刪除成功");
    deleteDialogVisible.value = false;
    selectedUser.value = null;
  } catch (error) {
    ElMessage.error(error.message || "刪除失敗");
  } finally {
    deleting.value = false;
  }
};

// 初始化
onMounted(async () => {
  loading.value = true;
  try {
    await rbacStore.fetchUsers();
  } catch (error) {
    ElMessage.error("獲取用戶列表失敗");
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.user-management {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.role-info-icon {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  cursor: help;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-select__tags) {
  max-width: calc(100% - 30px);
}

.form-item-tip {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-item-tip .el-icon {
  font-size: 14px;
}

.role-display {
  min-height: 32px;
  padding: 4px 0;
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.role-tag {
  margin-right: 4px;
}

.no-roles {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  font-style: italic;
}

.role-edit-container {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.role-select {
  flex: 1;
  min-width: 0; /* 防止 flex 子元素溢出 */
}

.role-edit-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0; /* 防止按鈕被壓縮 */
}
</style>
