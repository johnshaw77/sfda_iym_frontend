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
          <div id="header-actions" class="flex items-center space-x-2"></div>
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
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppSidebar from "@/components/AppSidebar.vue";
import AppHeader from "@/components/AppHeader.vue";
import { Settings } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const sidebarRef = ref(null);

const sidebarCollapsed = computed(() => sidebarRef.value?.isCollapse || false);

// 根據路由 meta 決定是否顯示內容區的 header
const showContentHeader = computed(() => {
  return route.meta.showContentHeader !== false;
});

// 根據當前路由設置頁面標題
const pageTitle = computed(() => {
  return route.meta.title || "";
});
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
