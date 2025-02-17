<template>
  <div class="permission-list">
    <div class="header-actions">
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

        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增權限
        </el-button>
      </div>
    </div>

    <el-table
      :data="loading ? Array(5).fill({}) : permissions"
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
          <el-tooltip
            v-for="role in row.roles"
            :key="role.id"
            :content="role.description || '暫無描述'"
            placement="top"
            effect="light"
          >
            <el-tag class="role-tag" type="success" size="small">
              {{ role.name }}
            </el-tag>
          </el-tooltip>
          <el-tag v-if="!row.roles.length" type="info" size="small">
            暫無角色使用
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              type="primary"
              :icon="Edit"
              size="small"
              @click="handleEdit(row)"
            >
              編輯
            </el-button>
            <el-button
              type="danger"
              :icon="Delete"
              size="small"
              @click="handleDelete(row)"
            >
              刪除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/編輯權限對話框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增權限' : '編輯權限'"
      v-model="dialogVisible"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="權限名稱" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="請輸入權限名稱（僅限英文字母、數字）"
            @input="handleNameInput"
            @keydown="handleNameKeydown"
          />
          <div class="form-item-tip">
            權限名稱將自動轉為大寫，空格將轉換為下底線
          </div>
        </el-form-item>
        <el-form-item label="權限描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="請輸入權限描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          確定
        </el-button>
      </template>
    </el-dialog>

    <!-- 刪除確認對話框 -->
    <el-dialog v-model="deleteDialogVisible" title="確認刪除" width="400px">
      <p>確定要刪除此權限嗎？此操作不可恢復。</p>
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
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete, RefreshCw } from "lucide-vue-next";
import { useRbacStore } from "@/stores/rbac";
import {
  createPermission,
  updatePermission,
  deletePermission,
} from "@/api/modules/rbac";
import {
  formatName,
  isValidKeyInput,
  nameValidationRules,
  descriptionValidationRules,
} from "@/utils/validators";

const rbacStore = useRbacStore();
const sortConfig = ref({ prop: "", order: "" });
const dialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const dialogType = ref("add"); // "add" 或 "edit"
const submitting = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const currentPermission = ref(null);

const formData = ref({
  name: "",
  description: "",
});

const formRules = {
  name: nameValidationRules,
  description: descriptionValidationRules,
};

const loading = computed(() => rbacStore.loading);

const permissions = computed(() => {
  const allPermissions = rbacStore.permissions;
  const allRoles = rbacStore.roles;

  let processedPermissions = allPermissions.map((permission) => {
    const roles = allRoles.filter((role) =>
      role.rolePermissions.some((rp) => rp.permission.id === permission.id)
    );
    return {
      ...permission,
      roles,
    };
  });

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

// 處理新增權限
const handleAdd = () => {
  dialogType.value = "add";
  formData.value = {
    name: "",
    description: "",
  };
  dialogVisible.value = true;
};

// 處理編輯權限
const handleEdit = (row) => {
  dialogType.value = "edit";
  currentPermission.value = row;
  formData.value = {
    name: row.name,
    description: row.description,
  };
  dialogVisible.value = true;
};

// 處理刪除權限
const handleDelete = (row) => {
  currentPermission.value = row;
  deleteDialogVisible.value = true;
};

// 確認刪除
const handleDeleteConfirm = async () => {
  if (!currentPermission.value) return;

  deleting.value = true;
  try {
    await deletePermission(currentPermission.value.id);
    await rbacStore.fetchPermissions();
    ElMessage.success("權限刪除成功");
    deleteDialogVisible.value = false;
  } catch (error) {
    ElMessage.error(error.message || "刪除失敗");
  } finally {
    deleting.value = false;
  }
};

// 處理對話框關閉
const handleDialogClose = () => {
  formRef.value?.resetFields();
  currentPermission.value = null;
};

// 處理表單提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    submitting.value = true;
    try {
      if (dialogType.value === "add") {
        await createPermission(formData.value);
        ElMessage.success("權限創建成功");
      } else {
        await updatePermission(currentPermission.value.id, formData.value);
        ElMessage.success("權限更新成功");
      }
      await rbacStore.fetchPermissions();
      dialogVisible.value = false;
    } catch (error) {
      ElMessage.error(error.message || "操作失敗");
    } finally {
      submitting.value = false;
    }
  });
};

// 處理權限名稱輸入格式化
const handleNameInput = (value) => {
  formData.value.name = formatName(value);
};

// 處理鍵盤輸入，防止輸入非法字符
const handleNameKeydown = (event) => {
  if (!isValidKeyInput(event)) {
    event.preventDefault();
  }
};

// 處理重整
const handleRefresh = async () => {
  loading.value = true;
  try {
    await rbacStore.fetchPermissions();
    ElMessage.success("資料已更新");
  } catch (error) {
    ElMessage.error("更新失敗");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.permission-list {
  padding: 5px 0;
}

.header-actions {
  margin-bottom: 20px;
}

.role-tag {
  margin-right: 5px;
  margin-bottom: 5px;
  cursor: help;
}

.form-item-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.2;
}
</style>
