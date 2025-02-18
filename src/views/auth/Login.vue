<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 background"
  >
    <div class="grid"></div>
    <div class="w-[420px] bg-white p-8 rounded-xl shadow-lg z-50">
      <!-- Logo -->
      <div class="mb-8">
        <div class="flex items-center justify-center space-x-2">
          <img src="/logo_flowchart.svg" alt="logo" class="w-8 h-8" />
          <span class="text-2xl text-center text-gray-600"
            >IYM良率分析系統</span
          >
        </div>
      </div>

      <!-- 標題 -->
      <h1 class="text-xl font-semibold text-gray-900 mb-2">登入</h1>
      <p class="text-gray-500 text-sm mb-8">歡迎回來！請輸入您的帳號密碼</p>

      <!-- 測試登入按鈕 -->
      <div class="mb-2">
        <el-button
          type="info"
          size="small"
          class="w-full"
          @click="handleTestLogin"
        >
          ADMIN 測試帳號登入
        </el-button>
      </div>
      <div class="mb-4">
        <el-button
          type="success"
          size="small"
          class="w-full"
          @click="handleReaderLogin"
        >
          一般用戶測試帳號登入
        </el-button>
      </div>

      <!-- 登入表單 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        @submit.prevent="handleSubmit"
      >
        <!-- 電子郵件 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Email</label
          >
          <el-form-item prop="email" class="mb-0">
            <el-input
              v-model="formData.email"
              type="email"
              placeholder="Enter your email"
              size="large"
              class="login-input"
            />
          </el-form-item>
        </div>

        <!-- 密碼 -->
        <div class="mb-4 mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >密碼</label
          >
          <el-form-item prop="password" class="mb-0">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="••••••••"
              size="large"
              show-password
              class="login-input"
            />
          </el-form-item>
        </div>

        <!-- 記住我和忘記密碼 -->
        <div class="flex items-center justify-between mb-6">
          <el-checkbox v-model="formData.remember" class="remember-me">
            記住我一週
          </el-checkbox>
          <el-link type="primary" @click="handleForgotPassword">
            忘記密碼？
          </el-link>
        </div>

        <!-- 登入按鈕 -->
        <el-button
          type="primary"
          size="large"
          class="w-full mb-4 mt-4 text-lg"
          :loading="loading"
          @click="handleSubmit"
        >
          登 入
        </el-button>

        <!-- Google 登入 -->
        <!-- <el-button
          size="large"
          class="w-full flex items-center justify-center space-x-2 border border-gray-300 hover:border-[#1976D2] hover:text-[#1976D2] transition-colors"
        >
          <img src="@/assets/google.svg" alt="Google" class="w-5 h-5" />
          <span>Sign in with Google</span>
        </el-button> -->

        <!-- 註冊連結 -->
        <!-- <div class="text-center mt-6">
          <p class="text-gray-600 text-sm">
            Don't have an account?
            <el-button
              link
              type="primary"
              class="sign-up-link"
              @click="handleRegister"
            >
              Sign up
            </el-button>
          </p>
        </div> -->
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const route = useRoute();
const formRef = ref(null);
const loading = ref(false);
const userStore = useUserStore();

// 表單數據
const formData = reactive({
  email: "",
  password: "",
  remember: false,
});

// 表單驗證規則
const rules = {
  email: [
    { required: true, message: "請輸入電子郵件", trigger: "blur" },
    { type: "email", message: "請輸入有效的電子郵件地址", trigger: "blur" },
  ],
  password: [
    { required: true, message: "請輸入密碼", trigger: "blur" },
    { min: 6, message: "密碼長度至少為 6 個字符", trigger: "blur" },
  ],
};

// 處理登入
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    await userStore.handleLogin({
      email: formData.email,
      password: formData.password,
      remember: formData.remember,
    });

    // 如果有重定向地址，則跳轉到重定向地址
    const redirectPath = route.query.redirect || "/";
    router.push(redirectPath);

    ElMessage.success("登入成功");
  } catch (error) {
    console.error("登入錯誤:", error);
    ElMessage.error(error.message || "登入失敗");
  } finally {
    loading.value = false;
  }
};

// 處理忘記密碼
const handleForgotPassword = () => {
  ElMessage.info("忘記密碼功能開發中");
};

// 處理註冊
const handleRegister = () => {
  router.push("/register");
};

// 處理測試登入
const handleTestLogin = () => {
  formData.email = "john_hsiao@example.com";
  formData.password = "888888";
};

// 處理一般用戶測試登入
const handleReaderLogin = () => {
  formData.email = "reader001@example.com";
  formData.password = "Reader@123";
};
</script>

<style scoped>
.login-input :deep(.el-input__wrapper) {
  background-color: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: none !important;
}

.login-input :deep(.el-input__wrapper):hover {
  border-color: #1976d2;
}

.login-input :deep(.el-input__wrapper.is-focus) {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1) !important;
}

.el-button--primary {
  @apply !bg-[#1976D2] hover:!bg-[#1565C0] !border-none;
  height: 44px;
  border-radius: 8px;
}

.remember-me :deep(.el-checkbox__label) {
  @apply !text-gray-600 text-sm;
}

.sign-up-link {
  @apply !text-[#1976D2] font-medium hover:!text-[#1565C0];
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  mask-image: radial-gradient(circle at center, black, transparent 80%);
  -webkit-mask-image: radial-gradient(circle at center, black, transparent 80%);
}

.grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(rgba(30, 41, 59, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30, 41, 59, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  transform-origin: center;
  /* animation: gridAnimation 5s linear infinite; */
}

.glow {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle at center,
    rgba(120, 100, 255, 0.4) 0%,
    rgba(120, 100, 255, 0.2) 20%,
    rgba(120, 100, 255, 0.1) 40%,
    transparent 60%
  );
  transform: translate(-50%, -50%);
  pointer-events: none;
  filter: blur(20px);
}

.content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px;
  text-align: center;
}

h1 {
  font-size: 64px;
  line-height: 1.1;
  margin-bottom: 24px;
  background: linear-gradient(to right, #1e293b 20%, rgba(30, 41, 59, 0.8));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
}

p {
  font-size: 20px;
  line-height: 1.6;
  color: rgba(30, 41, 59, 0.8);
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

@keyframes gridAnimation {
  0% {
    transform: perspective(1000px) rotateX(10deg) translateY(0);
  }
  100% {
    transform: perspective(2000px) rotateX(10deg) translateY(50px);
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 40px;
  }
  p {
    font-size: 18px;
  }
  .glow {
    width: 200px;
    height: 200px;
  }
}
</style>
