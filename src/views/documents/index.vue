<template>
  <div class="p-0">
    <Teleport
      to="#header-actions"
      v-if="showHeaderContent">
      <el-select
        v-model="filters.projectId"
        class="!w-48"
        placeholder="選擇專案"
        fit-input-width
        clearable>
        <el-option
          v-for="project in projects"
          :key="project.id"
          :label="project.name"
          :value="project.id" />
      </el-select>

      <el-select
        v-model="filters.docType"
        class="!w-24"
        placeholder="選擇類型"
        clearable>
        <el-option
          label="報告"
          value="report" />
        <el-option
          label="圖片"
          value="image" />
        <el-option
          label="附件"
          value="attachment" />
      </el-select>
      <el-input
        v-model="filters.search"
        placeholder="搜尋文檔"
        class="!w-60"
        clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button
        plain
        @click="handleRefresh"
        :loading="loading"
        title="重新整理">
        <RotateCw
          class="mr-1"
          :size="14" />
        重整
      </el-button>
      <el-button
        type="primary"
        @click="handleUpload">
        <Upload
          class="mr-1"
          :size="14" />
        上傳文檔
      </el-button>
    </Teleport>

    <DocumentList
      :documents="documents"
      :loading="loading"
      @refresh="fetchDocuments"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />

    <!-- 上傳對話框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上傳文檔"
      width="500px"
      destroy-on-close>
      <el-form
        ref="uploadFormRef"
        :model="uploadForm"
        :rules="uploadRules"
        label-width="100px">
        <el-form-item
          label="選擇專案"
          prop="projectId">
          <el-select
            v-model="uploadForm.projectId"
            placeholder="請選擇專案"
            style="width: 100%">
            <el-option
              v-for="project in projects"
              :key="project.id"
              :label="project.name"
              :value="project.id" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="工作流程"
          prop="instanceId">
          <el-select
            v-model="uploadForm.instanceId"
            placeholder="請選擇工作流程實例"
            style="width: 100%"
            clearable>
            <el-option
              v-for="instance in instances"
              :key="instance.value"
              :label="instance.label"
              :value="instance.value" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="文檔類型"
          prop="docType">
          <el-select
            v-model="uploadForm.docType"
            placeholder="請選擇文檔類型"
            style="width: 100%">
            <el-option
              label="報告"
              value="report" />
            <el-option
              label="圖片"
              value="image" />
            <el-option
              label="附件"
              value="attachment" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="選擇檔案"
          prop="file">
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange">
            <template #trigger>
              <el-button type="primary">選擇檔案</el-button>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitUpload">
            確認上傳
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  computed,
  onActivated,
  onDeactivated,
  watch,
} from "vue";
import { Search, Upload, RotateCw } from "lucide-vue-next";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getAllDocuments,
  getDocumentsByProject,
  uploadDocument,
} from "@/api/modules/flowDocument";
import { getAllProjects, getProjectInstances } from "@/api/modules/project";
import DocumentList from "./components/DocumentList.vue";

// 控制 Teleport 內容顯示
const showHeaderContent = ref(true);

// KeepAlive 生命週期鉤子
onActivated(() => {
  showHeaderContent.value = true;
});

onDeactivated(() => {
  showHeaderContent.value = false;
});

// 狀態
const loading = ref(false);
const documents = ref([]);
const projects = ref([]);
const instances = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 搜尋表單
const filters = ref({
  projectId: "",
  docType: "",
  search: "",
});

// 上傳相關
const uploadDialogVisible = ref(false);
const uploadFormRef = ref(null);
const uploadRef = ref(null);
const uploadForm = ref({
  projectId: "",
  instanceId: "",
  docType: "",
  file: null,
});

const uploadRules = {
  projectId: [{ required: true, message: "請選擇專案", trigger: "change" }],
  docType: [{ required: true, message: "請選擇文檔類型", trigger: "change" }],
  file: [{ required: true, message: "請選擇檔案", trigger: "change" }],
};

// 方法
const fetchProjects = async () => {
  try {
    const response = await getAllProjects();
    projects.value = response.data || [];
  } catch (error) {
    ElMessage.error("獲取專案列表失敗");
    console.error("獲取專案列表錯誤：", error);
  }
};

// 當選擇專案時，獲取該專案的工作流程實例
const handleProjectChange = async (projectId) => {
  if (!projectId) {
    instances.value = [];
    uploadForm.value.instanceId = "";
    return;
  }

  try {
    const response = await getProjectInstances(projectId);
    const result = response.data.map((item) => ({
      label: item.template.name,
      value: item.id,
    }));
    instances.value = result;
  } catch (error) {
    ElMessage.error(error.message || "獲取工作流程實例失敗");
    instances.value = [];
    uploadForm.value.instanceId = "";
  }
};

const fetchDocuments = async () => {
  loading.value = true;
  try {
    let response;
    if (filters.value.projectId) {
      response = await getDocumentsByProject(filters.value.projectId);
    } else {
      response = await getAllDocuments();
    }
    documents.value = response.data || [];
    total.value = documents.value.length;
  } catch (error) {
    ElMessage.error("獲取文檔列表失敗");
  } finally {
    loading.value = false;
  }
};

const handleRefresh = () => {
  currentPage.value = 1;
  fetchDocuments();
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchDocuments();
};

const handleUpload = () => {
  uploadForm.value = {
    projectId: "",
    instanceId: "",
    docType: "",
    file: null,
  };
  uploadDialogVisible.value = true;
  // 確保在打開對話框時重新獲取專案列表
  fetchProjects();
};

const handleFileChange = (file) => {
  uploadForm.value.file = file.raw;
};

const submitUpload = async () => {
  if (!uploadFormRef.value) return;

  await uploadFormRef.value.validate(async (valid) => {
    if (valid) {
      const formData = new FormData();
      formData.append("file", uploadForm.value.file);
      formData.append("projectId", uploadForm.value.projectId);
      formData.append("instanceId", uploadForm.value.instanceId);
      formData.append("docType", uploadForm.value.docType);

      try {
        await uploadDocument(formData);
        ElMessage.success("上傳成功");
        uploadDialogVisible.value = false;
        fetchDocuments();
      } catch (error) {
        ElMessage.error("上傳失敗");
      }
    }
  });
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchDocuments();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchDocuments();
};

// 監聽上傳表單中的專案選擇
watch(
  () => uploadForm.value.projectId,
  (newVal) => {
    handleProjectChange(newVal);
  }
);

// 監聽過濾條件變化
watch(
  () => [filters.value.projectId, filters.value.docType, filters.value.search],
  () => {
    handleSearch();
  },
  { deep: true }
);

// 生命週期
onMounted(() => {
  fetchDocuments();
  fetchProjects(); // 獲取專案列表
});
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.upload-demo {
  width: 100%;
}
</style>
