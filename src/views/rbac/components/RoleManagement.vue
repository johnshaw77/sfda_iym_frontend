<template>
  <div class="role-management">
    <div class="action-bar">
      <el-button type="primary" @click="handleCreateRole">
        <el-icon><Plus /></el-icon>
        創建角色
      </el-button>
    </div>

    <el-table :data="roles" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="角色名稱" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="權限" min-width="300">
        <template #default="{ row }">
          <el-tag
            v-for="permission in row.rolePermissions"
            :key="permission.permission.id"
            class="permission-tag"
            size="small"
          >
            {{ permission.permission.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              type="primary"
              size="small"
              @click="handleEditRole(row)"
              :disabled="row.name === 'SUPER_ADMIN'"
            >
              編輯
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDeleteRole(row)"
              :disabled="row.name === 'SUPER_ADMIN'"
            >
              刪除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 角色編輯對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯角色' : '創建角色'"
      width="600px"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="角色名稱" prop="name">
          <el-input v-model="roleForm.name" />
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
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import axios from "axios";

const roles = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const availablePermissions = ref([]);

const roleFormRef = ref(null);
const roleForm = ref({
  name: "",
  description: "",
  permissions: [],
});

const rules = {
  name: [
    { required: true, message: "請輸入角色名稱", trigger: "blur" },
    { min: 2, max: 50, message: "長度在 2 到 50 個字符", trigger: "blur" },
  ],
  description: [
    { max: 200, message: "描述不能超過 200 個字符", trigger: "blur" },
  ],
  permissions: [
    {
      type: "array",
      required: true,
      message: "請至少選擇一個權限",
      trigger: "change",
    },
  ],
};

// 獲取角色列表
const fetchRoles = async () => {
  try {
    loading.value = true;
    const response = await axios.get("/api/rbac/roles");
    roles.value = response.data;
  } catch (error) {
    ElMessage.error("獲取角色列表失敗");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 獲取權限列表
const fetchPermissions = async () => {
  try {
    const response = await axios.get("/api/rbac/permissions");
    availablePermissions.value = response.data;
  } catch (error) {
    ElMessage.error("獲取權限列表失敗");
    console.error(error);
  }
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

    await axios.delete(`/api/rbac/roles/${role.id}`);
    ElMessage.success("角色刪除成功");
    await fetchRoles();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("刪除角色失敗");
      console.error(error);
    }
  }
};

// 提交表單
const handleSubmit = async () => {
  if (!roleFormRef.value) return;

  try {
    await roleFormRef.value.validate();

    if (isEdit.value) {
      await axios.put(`/api/rbac/roles/${roleForm.value.id}`, {
        name: roleForm.value.name,
        description: roleForm.value.description,
      });

      // 更新角色權限
      for (const permissionId of roleForm.value.permissions) {
        await axios.post("/api/rbac/role-permissions", {
          roleId: roleForm.value.id,
          permissionId,
        });
      }
    } else {
      const response = await axios.post("/api/rbac/roles", {
        name: roleForm.value.name,
        description: roleForm.value.description,
      });

      // 為新角色分配權限
      for (const permissionId of roleForm.value.permissions) {
        await axios.post("/api/rbac/role-permissions", {
          roleId: response.data.role.id,
          permissionId,
        });
      }
    }

    ElMessage.success(isEdit.value ? "角色更新成功" : "角色創建成功");
    dialogVisible.value = false;
    await fetchRoles();
  } catch (error) {
    ElMessage.error(isEdit.value ? "更新角色失敗" : "創建角色失敗");
    console.error(error);
  }
};

onMounted(async () => {
  await Promise.all([fetchRoles(), fetchPermissions()]);
});
</script>

<style scoped>
.role-management {
  padding: 20px 0;
}

.action-bar {
  margin-bottom: 20px;
}

.permission-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
