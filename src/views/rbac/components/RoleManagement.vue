<template>
  <div class="role-management">
    <div class="action-bar">
      <div class="flex items-center gap-2">
        <!-- 重整按鈕 -->
        <el-button
          type="default"
          class="flex items-center"
          :loading="loading"
          @click="handleRefresh"
        >
          <el-icon><RefreshCw class="mr-1" :size="16" /></el-icon>
          重整
        </el-button>

        <el-button type="primary" @click="handleCreateRole">
          <el-icon><Plus /></el-icon>
          新增角色
        </el-button>
      </div>
    </div>

    <el-table
      :data="loading ? Array(5).fill({}) : roles"
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column type="index" label="序號" width="80" align="center">
        <template #default="scope">
          <template v-if="loading">
            <el-skeleton-item variant="text" style="width: 100%" />
          </template>
          <template v-else>
            {{ scope.$index + 1 }}
          </template>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="角色名稱" sortable="custom">
        <template #default="{ row }">
          <template v-if="loading">
            <el-skeleton-item variant="text" style="width: 80%" />
          </template>
          <template v-else>
            {{ row.name }}
          </template>
        </template>
      </el-table-column>

      <el-table-column prop="description" label="描述" sortable="custom">
        <template #default="{ row }">
          <template v-if="loading">
            <el-skeleton-item variant="text" style="width: 90%" />
          </template>
          <template v-else>
            {{ row.description }}
          </template>
        </template>
      </el-table-column>

      <el-table-column label="權限" min-width="300">
        <template #default="{ row }">
          <template v-if="loading">
            <div class="flex flex-wrap gap-2">
              <el-skeleton-item
                v-for="n in 4"
                :key="n"
                variant="text"
                style="width: 80px"
              />
            </div>
          </template>
          <template v-else>
            <el-tag
              v-for="permission in row.rolePermissions"
              :key="permission.permission.id"
              class="permission-tag"
              size="small"
            >
              <el-tooltip
                :content="permission.permission.description"
                placement="top"
                effect="light"
              >
                <span>{{ permission.permission.name }}</span>
              </el-tooltip>
            </el-tag>
          </template>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <template v-if="loading">
            <div class="flex gap-2">
              <el-skeleton-item variant="button" style="width: 60px" />
              <el-skeleton-item variant="button" style="width: 60px" />
            </div>
          </template>
          <template v-else>
            <el-button-group>
              <el-button
                type="primary"
                size="small"
                @click="handleEditRole(row)"
                :disabled="row.name === 'SUPER_ADMIN'"
              >
                <Pencil :size="14" class="mr-1" />
                編輯
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteRole(row)"
                :disabled="row.name === 'SUPER_ADMIN'"
              >
                <Trash :size="14" class="mr-1" />
                刪除
              </el-button>
            </el-button-group>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 角色編輯對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯角色' : '新增角色'"
      width="600px"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="角色名稱" prop="name">
          <el-input
            v-model="roleForm.name"
            @input="handleNameInput"
            @keydown="handleNameKeydown"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="權限" prop="permissions">
          <el-checkbox-group v-model="roleForm.permissions">
            <el-checkbox
              v-for="permission in availablePermissions"
              :key="permission.id"
              :label="permission.id"
            >
              {{ permission.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
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
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Pencil, Trash, RefreshCw } from "lucide-vue-next";
import { useRbacStore } from "@/stores/rbac";
import {
  formatName,
  isValidKeyInput,
  nameValidationRules,
  descriptionValidationRules,
} from "@/utils/validators";

const rbacStore = useRbacStore();
const sortConfig = ref({ prop: "", order: "" });

const roles = computed(() => {
  let sortedRoles = [...rbacStore.roles];
  if (sortConfig.value.prop && sortConfig.value.order) {
    sortedRoles.sort((a, b) => {
      const isAsc = sortConfig.value.order === "ascending";
      if (a[sortConfig.value.prop] < b[sortConfig.value.prop])
        return isAsc ? -1 : 1;
      if (a[sortConfig.value.prop] > b[sortConfig.value.prop])
        return isAsc ? 1 : -1;
      return 0;
    });
  }
  return sortedRoles;
});

const loading = computed(() => rbacStore.loading);
const availablePermissions = computed(() => rbacStore.permissions);

const dialogVisible = ref(false);
const isEdit = ref(false);

const roleFormRef = ref(null);
const roleForm = ref({
  name: "",
  description: "",
  permissions: [],
});

const rules = {
  name: nameValidationRules,
  description: descriptionValidationRules,
  permissions: [
    {
      type: "array",
      required: true,
      message: "請至少選擇一個權限",
      trigger: "change",
    },
  ],
};

// 處理排序變更
const handleSortChange = ({ prop, order }) => {
  sortConfig.value = { prop, order };
};

// 創建角色
const handleCreateRole = () => {
  isEdit.value = false;
  roleForm.value = {
    name: "",
    description: "",
    permissions: [],
  };
  dialogVisible.value = true;
};

// 編輯角色
const handleEditRole = (role) => {
  isEdit.value = true;
  roleForm.value = {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.rolePermissions.map((rp) => rp.permission.id),
  };
  dialogVisible.value = true;
};

// 刪除角色
const handleDeleteRole = async (role) => {
  try {
    await ElMessageBox.confirm("確定要刪除該角色嗎？此操作不可恢復。", "警告", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await rbacStore.deleteRole(role.id);
    ElMessage.success("角色刪除成功");
  } catch (error) {
    if (error !== "cancel") {
      console.error("刪除角色失敗:", error);
      ElMessage.error("刪除角色失敗");
    }
  }
};

// 處理角色名稱輸入，自動轉換為大寫並將空格轉換為底線
const handleNameInput = (value) => {
  if (value) {
    roleForm.value.name = formatName(value);
  }
};

// 處理鍵盤輸入，防止輸入非法字符
const handleNameKeydown = (event) => {
  if (!isValidKeyInput(event)) {
    event.preventDefault();
  }
};

// 提交表單
const handleSubmit = async () => {
  if (!roleFormRef.value) return;

  try {
    await roleFormRef.value.validate();

    if (isEdit.value) {
      await rbacStore.updateRole(roleForm.value.id, {
        name: roleForm.value.name,
        description: roleForm.value.description,
      });

      // 更新角色權限
      for (const permissionId of roleForm.value.permissions) {
        await rbacStore.assignPermissionToRole(roleForm.value.id, permissionId);
      }
    } else {
      // 創建新角色
      const newRole = await rbacStore.createRole({
        name: roleForm.value.name,
        description: roleForm.value.description,
      });

      // 為新角色分配權限
      for (const permissionId of roleForm.value.permissions) {
        await rbacStore.assignPermissionToRole(newRole.id, permissionId);
      }
    }

    ElMessage.success(isEdit.value ? "角色更新成功" : "角色創建成功");
    dialogVisible.value = false;
  } catch (error) {
    console.error("操作失敗:", error);
    ElMessage.error(isEdit.value ? "更新角色失敗" : "創建角色失敗");
  }
};

// 處理重整
const handleRefresh = async () => {
  loading.value = true;
  try {
    await rbacStore.initialize();
    ElMessage.success("資料已更新");
  } catch (error) {
    ElMessage.error("更新失敗");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.role-management {
  padding: 5px 0;
}

.action-bar {
  margin-bottom: 20px;
}

.permission-tag {
  margin-right: 5px;
  margin-bottom: 5px;
  cursor: help;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.permission-tag:hover {
  transform: translateY(-1px);
  filter: brightness(0.95);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.permission-tag:hover :deep(.el-tag) {
  border-color: var(--el-color-primary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
