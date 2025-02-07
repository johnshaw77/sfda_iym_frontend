<template>
  <div class="h-screen flex flex-col">
    <!-- 頂部導航欄 - 固定在頂部 -->
    <el-header class="!px-0 !h-12 fixed top-0 left-0 right-0 z-10 bg-blue-500">
      <div class="flex justify-between items-center h-full px-4 text-white">
        <h1 class="text-xl font-semibold">良率分析平台</h1>
        <div class="flex items-center space-x-4">
          <el-tooltip content="通知" placement="bottom">
            <el-button circle class="!w-10 !h-10">
              <Bell :size="24" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="設置" placement="bottom">
            <el-button circle class="!w-10 !h-10">
              <Settings :size="24" />
            </el-button>
          </el-tooltip>
          <el-dropdown trigger="click">
            <div class="flex items-center space-x-2 cursor-pointer">
              <UserCircle :size="24" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>個人資料</el-dropdown-item>
                <el-dropdown-item>修改密碼</el-dropdown-item>
                <el-dropdown-item divided>登出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 主要內容區 - 考慮頂部導航欄的高度 -->
    <div class="flex flex-1 pt-14">
      <!-- 左側導航欄 - 固定在左側 -->
      <el-menu
        class="!w-auto fixed left-0 top-12 bottom-0 border-r border-slate-200"
        :default-active="route.path"
        :collapse="isCollapse"
        background-color="#ffffff"
        text-color="#333333"
        active-text-color="#409EFF"
      >
        <el-button
          type="text"
          class="!w-full !px-2 !py-1 text-white hover:text-blue-400 text-right"
          @click="toggleCollapse"
        >
          <component :is="isCollapse ? ChevronRight : ChevronLeft" :size="24" />
        </el-button>

        <el-menu-item index="/workflow" @click="$router.push('/workflow')">
          <GitGraph :size="24" />
          <template #title>工作流程</template>
        </el-menu-item>
        <el-menu-item index="/files" @click="$router.push('/files')">
          <FileText :size="24" />
          <template #title>文件管理</template>
        </el-menu-item>
        <el-menu-item index="/analysis" @click="$router.push('/analysis')">
          <LineChart :size="24" />
          <template #title>數據分析</template>
        </el-menu-item>
        <el-menu-item index="/settings" @click="$router.push('/settings')">
          <Settings :size="24" />
          <template #title>系統設置</template>
        </el-menu-item>
      </el-menu>

      <!-- 右側內容區 - 考慮左側導航欄的寬度 -->
      <el-container :class="['flex-1', isCollapse ? 'ml-16' : 'ml-48']">
        <el-header
          class="bg-white border-b !h-10 flex items-center justify-between px-6"
        >
          <h2 class="text-lg font-medium">{{ pageTitle }}</h2>
          <div class="flex items-center space-x-2">
            <el-button
              type="primary"
              v-if="showNewButton"
              @click="handleNewAction"
            >
              <component :is="newButtonIcon" class="mr-2" :size="16" />
              {{ newButtonText }}
            </el-button>
          </div>
        </el-header>

        <el-main class="!p-0 bg-gray-100">
          <slot></slot>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Bell,
  Settings,
  User,
  GitGraph,
  FileText,
  LineChart,
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  UserCircle,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const isCollapse = ref(false);

// 根據當前路由設置頁面標題和按鈕
const pageTitle = computed(() => {
  const titles = {
    "/workflow": "工作流程",
    "/files": "文件管理",
    "/analysis": "數據分析",
    "/settings": "系統設置",
  };
  return titles[route.path] || "";
});

const showNewButton = computed(() => {
  return ["/workflow", "/files", "/analysis"].includes(route.path);
});

const newButtonText = computed(() => {
  const texts = {
    "/workflow": "新建工作流",
    "/files": "上傳文件",
    "/analysis": "新建分析",
  };
  return texts[route.path] || "";
});

const newButtonIcon = computed(() => {
  const icons = {
    "/workflow": Plus,
    "/files": Upload,
    "/analysis": LineChart,
  };
  return icons[route.path] || Plus;
});

const handleNewAction = () => {
  // 根據不同頁面觸發不同的操作
  const actions = {
    "/workflow": () => {
      // TODO: 處理新建工作流
    },
    "/files": () => {
      // TODO: 處理文件上傳
    },
    "/analysis": () => {
      // TODO: 處理新建分析
    },
  };

  const action = actions[route.path];
  if (action) {
    action();
  }
};

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};
</script>

<style>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.el-menu.el-menu--horizontal {
  @apply border-0;
}

.el-button.is-circle {
  @apply !bg-transparent !border-0 !text-white hover:!bg-blue-700 !flex !items-center !justify-center;
}

.el-menu--vertical:not(.el-menu--collapse) {
  @apply !w-48;
}

.el-menu--collapse {
  @apply !w-16;
}

/* 確保內容區域不會被固定元素遮擋 */
.el-main {
  height: calc(100vh - 3.5rem);
  overflow-y: auto;
}

.el-menu-item {
  @apply !border-l-4 !border-transparent;
}

.el-menu-item.is-active {
  @apply !border-l-4 !border-blue-500 !bg-blue-50;
}

.el-menu-item:hover {
  @apply !bg-gray-50;
}
</style>
