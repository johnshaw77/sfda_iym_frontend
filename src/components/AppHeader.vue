<template>
  <el-header
    class="!px-0 !h-12 fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200"
  >
    <div class="flex justify-between items-center h-full px-4">
      <!-- Logo 區域 -->
      <div class="flex items-center space-x-0">
        <img src="/logo_flowchart.svg" class="w-6 h-6 mr-2" />
        <h1 class="text-xl font-semibold text-gray-800">IYM 良率分析平台</h1>
      </div>

      <!-- 右側工具列 -->
      <div class="flex items-center space-x-4">
        <!-- 通知圖標 -->
        <el-badge :value="3" :max="99" class="cursor-pointer">
          <el-tooltip content="通知" placement="bottom">
            <Bell :size="18" class="text-gray-600 hover:text-blue-500" />
          </el-tooltip>
        </el-badge>

        <!-- 設置圖標 -->
        <el-tooltip content="設置" placement="bottom">
          <Settings :size="18" class="cursor-pointer hover:text-blue-500" />
        </el-tooltip>

        <!-- 用戶選單 -->
        <el-dropdown trigger="hover" @command="handleCommand">
          <div class="flex items-center space-x-2 cursor-pointer">
            <div class="relative" @click.stop="handleAvatarClick">
              <el-avatar
                :size="36"
                :src="userInfo.avatar"
                :alt="userInfo.username"
                class="!bg-blue-100 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <span class="text-sm font-medium text-blue-600">{{
                  userInfo.username?.slice(0, 1)
                }}</span>
              </el-avatar>
              <div
                class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"
              ></div>
              <!-- 懸停提示 -->
              <div
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
              >
                點擊更換頭像
              </div>
            </div>
          </div>
          <!-- 用戶下拉選單 -->
          <template #dropdown>
            <el-dropdown-menu>
              <div class="px-4 py-2">
                <div class="text-base font-semibold text-gray-900">
                  {{ userInfo.username }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ userInfo.email }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ userInfo.role }}
                </div>
              </div>
              <el-divider class="!my-1" />
              <el-dropdown-item command="profile">
                <User :size="14" class="mr-2" />個人資料
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <Settings :size="14" class="mr-2" />偏好設定
              </el-dropdown-item>
              <el-divider class="!my-1" />
              <el-dropdown-item command="notifications">
                <Bell :size="14" class="mr-2" />通知設定
              </el-dropdown-item>
              <el-dropdown-item command="privacy">
                <Shield :size="14" class="mr-2" />隱私權設定
              </el-dropdown-item>
              <el-divider class="!my-1" />
              <el-dropdown-item command="logout" class="!text-red-500">
                <LogOut :size="14" class="mr-2" />登出
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 頭像上傳對話框 -->
    <el-dialog
      v-model="dialogVisible"
      title="更換頭像"
      width="420px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="flex flex-col items-center">
        <!-- 預覽區域 -->
        <div class="mb-4 relative group">
          <el-upload
            ref="avatarUploadRef"
            class="avatar-preview-uploader"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept="image/jpeg,image/png,image/gif"
            drag
          >
            <el-avatar
              :size="120"
              :src="previewUrl || userInfo.avatar"
              class="!bg-blue-100 hover:opacity-80 transition-all duration-300"
            >
              <span class="text-2xl font-medium text-blue-600">{{
                userInfo.username?.slice(0, 1)
              }}</span>
            </el-avatar>
            <!-- 懸停提示 -->
            <div
              class="absolute inset-0 bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <div class="text-white text-sm">
                <Upload class="mx-auto mb-1" :size="20" />
                <div class="text-xs">點擊或拖拉</div>
              </div>
            </div>
          </el-upload>
        </div>

        <!-- 提示文字 -->
        <p class="text-xs text-gray-500 mt-2">
          支援 JPG、PNG、GIF 格式，檔案大小不超過 2MB
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            :loading="uploading"
            :disabled="!selectedFile"
            @click="handleUpload"
          >
            確認上傳
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-header>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();
const userInfo = ref({
  username: "",
  email: "",
  role: "",
  avatar: "",
});

// 上傳相關狀態
const dialogVisible = ref(false);
const uploadRef = ref(null);
const selectedFile = ref(null);
const previewUrl = ref("");
const uploading = ref(false);

// 獲取用戶資訊
const fetchUserInfo = async () => {
  try {
    await userStore.fetchUser();
    userInfo.value = userStore.user;
  } catch (error) {
    console.error("獲取用戶資訊失敗:", error);
    ElMessage.error("獲取用戶資訊失敗，請重新整理頁面");
  }
};

// 處理頭像點擊
const handleAvatarClick = (e) => {
  e.stopPropagation();
  dialogVisible.value = true;
};

// 處理檔案選擇
const handleFileChange = (file) => {
  // 檢查檔案大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error("檔案大小不能超過 2MB");
    return false;
  }

  // 檢查檔案類型
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error("只支援 JPG、PNG、GIF 格式的圖片");
    return false;
  }

  selectedFile.value = file.raw;
  previewUrl.value = URL.createObjectURL(file.raw);
};

// 處理上傳
const handleUpload = async () => {
  if (!selectedFile.value) return;

  try {
    uploading.value = true;
    const formData = new FormData();
    formData.append("avatar", selectedFile.value);

    const { user } = await updateAvatar(formData);
    // 更新用戶資訊，確保頭像 URL 是完整的，但不包含 api 路徑

    userInfo.value = {
      ...userInfo.value,
      ...user,
    };

    // 清理預覽 URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }

    ElMessage.success("頭像更新成功");
    handleCancel();
  } catch (error) {
    console.error("上傳頭像失敗:", error);
    ElMessage.error(
      error.response?.data?.message || "上傳頭像失敗，請稍後再試"
    );
  } finally {
    uploading.value = false;
  }
};

// 處理取消
const handleCancel = () => {
  dialogVisible.value = false;
  selectedFile.value = null;
  // 清理預覽 URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = "";
  }
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// 處理下拉選單命令(!TODO: 未實作)
const handleCommand = async (command) => {
  switch (command) {
    case "profile":
      router.push("/settings/profile");
      break;
    case "settings":
      router.push("/settings");
      break;
    case "notifications":
      router.push("/settings/notifications");
      break;
    case "privacy":
      router.push("/settings/privacy");
      break;
    case "logout":
      try {
        await userStore.handleLogout();
        router.push("/login");
        ElMessage.success("登出成功");
      } catch (error) {
        console.error("登出失敗:", error);
        ElMessage.error("登出失敗");
      }
      break;
  }
};

onMounted(() => {
  if (userStore.isAuthenticated) {
    fetchUserInfo();
  }
});
</script>

<style scoped>
.el-dropdown-menu {
  @apply min-w-[240px];
}
:deep(.el-upload-dragger) {
  @apply w-full border-none p-0;
}
.avatar-uploader {
  :deep(.el-upload) {
    @apply w-full;
  }

  :deep(.el-upload-dragger) {
    @apply w-full border-none p-0;
  }

  :deep(.el-upload-dragger:hover) {
    @apply bg-transparent;
  }

  .upload-area {
    @apply w-full flex flex-col items-center;
  }
}

.avatar-preview-uploader {
  :deep(.el-upload) {
    @apply block;
  }

  :deep(.el-upload-dragger) {
    @apply w-[120px] h-[120px] border-none p-0 bg-transparent;
  }

  :deep(.el-upload-dragger:hover) {
    @apply bg-transparent;
  }
}

/* 懸停效果 */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* 移除 el-dropdown 的外框和優化互動樣式 */
.el-dropdown {
  outline: none !important;
}

.el-dropdown-link {
  outline: none !important;
  cursor: pointer;
}

:deep(.el-dropdown__popper) {
  outline: none !important;
}

:deep(.el-dropdown-menu__item:not(.is-disabled):focus) {
  background-color: var(--el-dropdown-menuItem-hover-fill);
  color: var(--el-dropdown-menuItem-hover-color);
  outline: none !important;
}

/* 保持鍵盤無障礙性，但使用更柔和的視覺效果 */
.el-dropdown:focus-visible {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
  border-radius: 4px;
}

/* 移除所有可能的外框 */
:deep(.el-dropdown-menu) {
  outline: none !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-dropdown-menu__item) {
  outline: none !important;
}

:deep(.el-dropdown *) {
  outline: none !important;
}

:deep(.el-button) {
  outline: none !important;
}

:deep(.el-avatar) {
  outline: none !important;
}

/* 移除所有元素的外框 */
* {
  outline: none !important;
}

/* 優化懸停效果 */
:deep(.el-dropdown-menu__item:hover) {
  background-color: var(--el-dropdown-menuItem-hover-fill);
  color: var(--el-dropdown-menuItem-hover-color);
}

:deep(.el-dropdown-menu__item:active) {
  background-color: var(--el-dropdown-menuItem-hover-fill);
  color: var(--el-dropdown-menuItem-hover-color);
}
</style>
