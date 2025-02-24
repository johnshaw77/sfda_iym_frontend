<template>
  <div class="p-0">
    <Teleport to="#header-actions" v-if="showHeaderContent">
      <el-select
        v-model="queryParams.projectId"
        class="w-64"
        placeholder="選擇專案"
        clearable
        :fit-input-width="true"
        @change="handleSearch"
      >
        <el-option
          v-for="project in projects"
          :key="project.id"
          :label="project.name"
          :value="project.id"
        />
      </el-select>
      <el-select
        v-model="queryParams.status"
        class="w-32"
        placeholder="選擇狀態"
        clearable
        @change="handleSearch"
      >
        <el-option
          v-for="status in statusOptions"
          :key="status.value"
          :label="status.label"
          :value="status.value"
        >
          <el-tag :type="status.tagType" size="small">{{
            status.label
          }}</el-tag>
        </el-option>
      </el-select>
      <el-button
        plain
        @click="handleRefresh"
        :loading="loading"
        title="重新整理"
      >
        <RotateCw class="mr-1" :size="14" />
        重整
      </el-button>
      <el-button type="primary" @click="handleCreate">
        <Plus class="mr-1" /> 新建流程實例
      </el-button>
    </Teleport>

    <!-- {{ instances }} -->
    <el-table :data="instances" v-loading="loading">
      <el-table-column type="index" label="序號" width="80" />
      <el-table-column prop="project.name" label="專案名稱" min-width="150" />
      <el-table-column prop="template.name" label="模板名稱" min-width="150" />
      <el-table-column label="狀態" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="創建者" width="150">
        <template #default="{ row }">
          <div class="flex items-center">
            <el-avatar :size="24" :src="row.creator.avatar">
              {{ row.creator.username.charAt(0) }}
            </el-avatar>
            <span class="ml-2">{{ row.creator.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="創建時間" width="180">
        <template #default="{ row }">
          {{ formatTimestamp(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              v-if="row.status === 'draft'"
              type="primary"
              @click="handleStart(row)"
              :loading="row.loading"
            >
              <Play class="mr-1" />
              啟動
            </el-button>
            <el-button
              v-if="row.status === 'running'"
              type="danger"
              @click="handleStop(row)"
              :loading="row.loading"
            >
              <StopCircle class="mr-1" />
              停止
            </el-button>
            <el-button type="info" @click="handleView(row)">
              <Eye class="mr-1" />
              查看
            </el-button>
            <el-button
              v-if="row.status === 'draft'"
              type="danger"
              @click="handleDelete(row)"
              :loading="row.loading"
            >
              <Trash2 class="mr-1" />
              刪除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 創建流程實例對話框 -->
    <el-dialog
      v-model="dialogVisible"
      title="創建流程實例"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent
      >
        <el-form-item label="專案" prop="projectId">
          <el-select
            v-model="form.projectId"
            placeholder="選擇專案"
            style="width: 100%"
          >
            <el-option
              v-for="project in projects"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="流程模板" prop="templateId">
          <el-select
            v-model="form.templateId"
            placeholder="選擇流程模板"
            style="width: 100%"
          >
            <el-option
              v-for="template in templates"
              :key="template.id"
              :label="template.name"
              :value="template.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          確定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { formatTimestamp } from "@/utils/dateUtils";
import {
  getFlowInstances,
  createFlowInstance,
  startFlowInstance,
  stopFlowInstance,
  deleteFlowInstance,
} from "@/api/modules/flow";
import { getAllProjects } from "@/api/modules/project";
import { getFlowTemplates } from "@/api/modules/flow";

const router = useRouter();
const loading = ref(false);
const instances = ref([]);
const projects = ref([]);
const templates = ref([]);
const dialogVisible = ref(false);
const submitting = ref(false);
const showHeaderContent = ref(true);

// KeepAlive 生命週期鉤子
onActivated(() => {
  showHeaderContent.value = true;
});

onDeactivated(() => {
  showHeaderContent.value = false;
});

// 查詢參數
const queryParams = ref({
  projectId: "",
  status: "",
});

// 表單數據
const formRef = ref(null);
const form = ref({
  projectId: "",
  templateId: "",
});

// 表單驗證規則
const rules = {
  projectId: [{ required: true, message: "請選擇專案", trigger: "change" }],
  templateId: [
    { required: true, message: "請選擇流程模板", trigger: "change" },
  ],
};

// 狀態選項
const statusOptions = [
  { value: "draft", label: "草稿", tagType: "info" },
  { value: "running", label: "執行中", tagType: "warning" },
  { value: "completed", label: "已完成", tagType: "success" },
  { value: "failed", label: "失敗", tagType: "danger" },
];

// 獲取狀態標籤類型
const getStatusTagType = (status) => {
  const option = statusOptions.find((opt) => opt.value === status);
  return option ? option.tagType : "info";
};

// 獲取狀態標籤文字
const getStatusLabel = (status) => {
  const option = statusOptions.find((opt) => opt.value === status);
  return option ? option.label : status;
};

// 載入數據
const loadData = async () => {
  try {
    loading.value = true;
    const [instancesRes, projectsRes, templatesRes] = await Promise.all([
      getFlowInstances(queryParams.value),
      getAllProjects(),
      getFlowTemplates(),
    ]);
    console.log(instancesRes);
    instances.value = instancesRes.data;
    projects.value = projectsRes.data;
    templates.value = templatesRes.data;
  } catch (error) {
    console.error("載入數據失敗:", error);
    ElMessage.error("載入數據失敗");
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  loadData();
};

// 刷新
const handleRefresh = () => {
  loadData();
};

// 創建流程實例
const handleCreate = () => {
  form.value = {
    projectId: "",
    templateId: "",
  };
  dialogVisible.value = true;
};

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    await createFlowInstance(form.value);
    ElMessage.success("創建成功");
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    console.error("創建失敗:", error);
    ElMessage.error("創建失敗");
  } finally {
    submitting.value = false;
  }
};

// 啟動流程實例
const handleStart = async (row) => {
  try {
    row.loading = true;
    await startFlowInstance(row.id);
    ElMessage.success("啟動成功");
    loadData();
  } catch (error) {
    console.error("啟動失敗:", error);
    ElMessage.error("啟動失敗");
  } finally {
    row.loading = false;
  }
};

// 停止流程實例
const handleStop = async (row) => {
  try {
    await ElMessageBox.confirm("確定要停止該流程實例嗎？", "提示", {
      type: "warning",
    });

    row.loading = true;
    await stopFlowInstance(row.id);
    ElMessage.success("停止成功");
    loadData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("停止失敗:", error);
      ElMessage.error("停止失敗");
    }
  } finally {
    row.loading = false;
  }
};

// 查看流程實例
const handleView = (row) => {
  router.push(`/flow-instances/${row.id}`);
};

// 刪除流程實例
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("確定要刪除該流程實例嗎？", "提示", {
      type: "warning",
    });

    row.loading = true;
    await deleteFlowInstance(row.id);
    ElMessage.success("刪除成功");
    loadData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("刪除失敗:", error);
      ElMessage.error("刪除失敗");
    }
  } finally {
    row.loading = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.flow-instance-list {
  padding: 20px;
}

.el-tag {
  width: 100%;
  text-align: center;
}
</style>
