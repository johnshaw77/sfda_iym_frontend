<template>
  <div class="api-test-container">
    <el-card class="test-card">
      <template #header>
        <div class="card-header">
          <h3>API 測試頁面</h3>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="demo-tabs">
        <!-- 用戶列表測試 Tab -->
        <el-tab-pane label="用戶列表測試" name="users">
          <div class="test-section">
            <div class="section-header">
              <el-button
                type="primary"
                @click="handleFetchUsers"
                :loading="loading"
              >
                獲取用戶列表
              </el-button>
            </div>

            <!-- 用戶列表顯示 -->
            <el-table
              v-if="userList.length > 0"
              :data="userList"
              style="width: 100%"
              border
              stripe
            >
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="email" label="電子郵件" />
              <el-table-column prop="role" label="角色" />
              <el-table-column label="頭像" width="100">
                <template #default="{ row }">
                  <el-avatar :src="row.avatar" :size="40">
                    {{ row.nickname.charAt(0) }}
                  </el-avatar>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="狀態">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                    {{ row.status === "active" ? "啟用" : "停用" }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 檔案上傳測試 Tab -->
        <el-tab-pane label="檔案上傳測試" name="upload">
          <div class="test-section">
            <el-upload
              class="upload-demo"
              drag
              action="http://localhost:3001/api/file/upload"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="handleBeforeUpload"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖曳檔案到此處或 <em>點擊上傳</em>
              </div>
            </el-upload>

            <!-- 上傳結果顯示 -->
            <div v-if="uploadResult" class="mt-4">
              <el-alert
                :title="uploadResult.success ? '上傳成功' : '上傳失敗'"
                :type="uploadResult.success ? 'success' : 'error'"
                :description="uploadResult.message"
                show-icon
              />
              <pre class="response-data" v-if="uploadResult.data">{{
                JSON.stringify(uploadResult.data, null, 2)
              }}</pre>
            </div>
          </div>
        </el-tab-pane>

        <!-- 外部 API 測試 Tab -->
        <el-tab-pane label="外部 API 測試" name="external">
          <div class="test-section">
            <div class="section-header">
              <div class="api-input-group">
                <el-input
                  v-model="externalApiEndpoint"
                  placeholder="輸入 API 端點（例如：/methods）"
                  clearable
                  class="endpoint-input"
                >
                  <template #prepend>/external/test</template>
                </el-input>
                <el-button
                  type="primary"
                  @click="handleTestExternalApi"
                  :loading="externalApiLoading"
                >
                  測試外部 API 連接
                </el-button>
              </div>
            </div>

            <!-- 外部 API 測試結果 -->
            <div v-if="externalApiResult" class="mt-4">
              <el-alert
                :title="externalApiResult.message"
                :type="externalApiResult.success ? 'success' : 'error'"
                :description="externalApiResult.error"
                show-icon
                class="mb-4"
              />

              <div v-if="externalApiResult.data">
                <h4>響應數據：</h4>
                <el-input
                  type="textarea"
                  v-model="formattedExternalResponse"
                  :rows="10"
                  readonly
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Flow Nodes 組件" name="flow-nodes">
          <!-- 組件列表 -->
          <div class="component-manager">
            <h2>組件列表</h2>
            <div class="component-list">
              <div
                v-for="(component, path) in components"
                :key="path"
                class="component-item"
              >
                <div class="component-info">
                  <h3>{{ getComponentName(path) }}</h3>
                  <p class="component-path">路徑: {{ path }}</p>
                </div>
                <!-- 可以加入預覽按鈕或其他操作 -->
                <div class="component-actions">
                  <button @click="previewComponent(path)">預覽</button>
                </div>
              </div>
            </div>

            <!-- 預覽模態框 -->
            <div v-if="showPreview" class="preview-modal">
              <div class="modal-content">
                <button @click="closePreview" class="close-btn">關閉</button>
                <component :is="currentComponent" v-if="currentComponent" />
              </div>
            </div>
          </div>
          <!-- end 組件列表 -->
        </el-tab-pane>
      </el-tabs>

      <!-- API 請求日誌 -->
      <div class="test-section">
        <div class="section-header">
          <h4>API 請求日誌</h4>
          <el-button type="info" plain size="small" @click="clearLogs">
            清除日誌
          </el-button>
        </div>
        <el-timeline>
          <el-timeline-item
            v-for="(log, index) in requestLogs"
            :key="index"
            :type="log.success ? 'success' : 'danger'"
            :timestamp="log.timestamp"
          >
            {{ log.message }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { request } from "@/api/request";
import { testExternalApi } from "@/api/modules/external";
import { useFlowComponents } from "@/composables/useFlowNodeComponents";

const activeTab = ref("users");
const uploadResult = ref(null);
const requestLogs = ref([]);
const userList = ref([]);
const userApiResult = ref(null);
const loading = ref(false);
const externalApiLoading = ref(false);
const externalApiResult = ref(null);
const formattedExternalResponse = ref("");
const externalApiEndpoint = ref("");

// 添加日誌
const addLog = (message, success = true) => {
  requestLogs.value.unshift({
    message,
    success,
    timestamp: new Date().toLocaleTimeString(),
  });
};

// 清除日誌
const clearLogs = () => {
  requestLogs.value = [];
};

// 獲取用戶列表
const handleFetchUsers = async () => {
  loading.value = true;
  userApiResult.value = null;
  addLog("開始獲取用戶列表");

  try {
    const response = await request.get("/user/list");
    console.log("API響應：", response);

    if (response.code === 200) {
      console.log("Mock 響應數據：", response.data);
      userList.value = response.data;
      userApiResult.value = {
        success: true,
        message: response.message,
        data: response.data,
      };
      addLog("獲取用戶列表成功");
    } else {
      throw new Error(response.message || "獲取用戶列表失敗");
    }
  } catch (error) {
    console.error("請求失敗：", error);
    userApiResult.value = {
      success: false,
      message: error.message || "獲取用戶列表失敗",
      data: null,
    };
    addLog(`獲取用戶列表失敗：${error.message || "未知錯誤"}`, false);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 100);
  }
};

// 上傳前處理
const handleBeforeUpload = (file) => {
  addLog(`準備上傳檔案：${file.name}`);
  return true;
};

// 上傳成功處理
const handleUploadSuccess = (response) => {
  uploadResult.value = {
    success: true,
    message: response.message,
    data: response.data,
  };
  addLog(`檔案上傳成功：${response.message}`);
};

// 上傳失敗處理
const handleUploadError = (error) => {
  uploadResult.value = {
    success: false,
    message: error.message || "上傳失敗",
    data: null,
  };
  addLog(`檔案上傳失敗：${error.message || "未知錯誤"}`, false);
};

// 測試外部 API
const handleTestExternalApi = async () => {
  externalApiLoading.value = true;
  addLog(`開始測試外部 API 連接：${externalApiEndpoint.value || "/"}`);

  try {
    const response = await testExternalApi(externalApiEndpoint.value);
    externalApiResult.value = response;
    formattedExternalResponse.value = JSON.stringify(response.data, null, 2);
    addLog("外部 API 測試成功");
  } catch (error) {
    console.error("外部 API 測試失敗:", error);
    externalApiResult.value = {
      success: false,
      message: "測試失敗",
      error: error.message,
    };
    addLog(`外部 API 測試失敗：${error.message}`, false);
  } finally {
    externalApiLoading.value = false;
  }
};

// 使用 Flow Components composable
const {
  components,
  showPreview,
  currentComponent,
  getComponentName,
  previewComponent,
  closePreview,
} = useFlowNodeComponents();
</script>

<style scoped>
.api-test-container {
  padding: 20px;
}

.test-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.test-section h4 {
  margin-bottom: 15px;
  color: var(--el-text-color-primary);
}

.response-data {
  margin-top: 15px;
  padding: 15px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.el-timeline {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.demo-tabs {
  margin-bottom: 20px;
}

.el-tab-pane {
  padding: 20px 0;
}

.api-input-group {
  display: flex;
  gap: 10px;
  width: 100%;
}

.endpoint-input {
  flex: 1;
}

.el-input-group__prepend {
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-light);
}
</style>
