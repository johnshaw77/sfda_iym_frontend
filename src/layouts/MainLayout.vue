<template>
  <div class="h-screen flex flex-col">
    <!-- 頂部導航欄 -->
    <AppHeader />

    <!-- 主要內容區 - 考慮頂部導航欄的高度 !TODO: 需要固定? -->
    <div class="flex flex-1 pt-12">
      <!-- 左側導航欄 -->
      <AppSidebar ref="sidebarRef" />

      <!-- 右側內容區 - 考慮左側導航欄的寬度 -->
      <el-container
        class="content-container"
        :class="sidebarCollapsed ? 'collapsed' : ''"
      >
        <el-header
          v-if="showContentHeader"
          class="content-header bg-white border-b !h-10 flex items-center justify-between px-6"
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

        <el-main class="!p-0 bg-gray-100 main-content">
          <router-view v-slot="{ Component }">
            <keep-alive :exclude="['Settings']">
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Plus, Upload, LineChart } from "lucide-vue-next";
import AppSidebar from "../components/AppSidebar.vue";
import AppHeader from "../components/AppHeader.vue";

const route = useRoute();
const router = useRouter();
const sidebarRef = ref(null);

const sidebarCollapsed = computed(() => sidebarRef.value?.isCollapse || false);

// 根據路由 meta 決定是否顯示內容區的 header
const showContentHeader = computed(() => {
  return route.meta.showContentHeader !== false;
});

// 根據當前路由設置頁面標題和按鈕
const pageTitle = computed(() => {
  return route.meta.title || "";
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
  height: calc(100vh - 3.3rem);
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

.content-container {
  @apply flex-1 ml-48;
  transition: margin-left 0.2s ease-in-out;
}

.content-container.collapsed {
  @apply ml-16;
}

.el-dropdown-menu {
  @apply !py-1;
}

.el-dropdown-item {
  @apply !px-4 !py-2 !text-sm flex items-center;
}

.content-header {
  @apply fixed right-0 z-10;
  width: calc(100% - 12rem); /* 48px * 3 = 12rem，對應左側導航欄寬度 */
  transition: width 0.2s ease-in-out;
}

.collapsed .content-header {
  width: calc(100% - 4rem); /* 16px * 4 = 4rem，對應收合後的左側導航欄寬度 */
}

.main-content {
  padding-top: 2.5rem !important; /* 40px，對應 header 高度 */
}
</style>
