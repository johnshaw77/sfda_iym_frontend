<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- 頂部導航欄 -->
    <AppHeader />

    <!-- 主要內容區 - 考慮頂部導航欄的高度 !TODO: 需要固定? -->
    <div class="flex flex-1 pt-12 overflow-hidden">
      <!-- 左側導航欄 -->
      <AppSidebar ref="sidebarRef" />

      <!-- 右側內容區 - 考慮左側導航欄的寬度 -->
      <el-container
        class="content-container overflow-hidden"
        :class="sidebarCollapsed ? 'collapsed' : ''"
      >
        <el-header
          v-if="showContentHeader"
          class="content-header bg-white border-b !h-10 flex items-center justify-between px-6"
        >
          <div class="flex items-center">
            <!-- <h2 class="text-lg font-medium">{{ pageTitle }}</h2> -->
            <!-- 麵包屑 -->
            <el-breadcrumb
              v-if="breadcrumbs.length > 0"
              class="ml-0"
              :separator-icon="ArrowRight"
            >
              <el-breadcrumb-item
                v-for="item in breadcrumbs"
                :key="item.path"
                :to="item.path"
              >
                <h3 class="text-md font-medium text-gray-700">
                  {{ item.title }}
                </h3>
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div id="header-actions" class="flex items-center space-x-2"></div>
        </el-header>

        <el-main
          class="!p-0 bg-gray-100 main-content"
          :class="{ 'has-header': showContentHeader }"
        >
          <router-view v-slot="{ Component }">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="$route.fullPath" />
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppSidebar from "@/components/AppSidebar.vue";
import AppHeader from "@/components/AppHeader.vue";
import { ArrowRight } from "@element-plus/icons-vue";

import { useFlowTemplateStore } from "@/stores/flowTemplate";

const route = useRoute();
const router = useRouter();
const sidebarRef = ref(null);
const flowTemplateStore = useFlowTemplateStore();
const templateName = ref("");

const sidebarCollapsed = computed(() => sidebarRef.value?.isCollapse || false);

// 根據路由 meta 決定是否顯示內容區的 header
const showContentHeader = computed(() => {
  return route.meta.showContentHeader === true;
});

// 根據當前路由設置頁面標題
const pageTitle = computed(() => {
  return route.meta.title || "";
});

// 需要被緩存的視圖
const cachedViews = computed(() => {
  return router
    .getRoutes()
    .filter((route) => route.meta?.keepAlive)
    .map((route) => route.name);
});

// 生成麵包屑
const breadcrumbs = computed(() => {
  const matched = route.matched;

  const result = [];

  matched.forEach((route) => {
    // 優先處理工作流程範本設計頁面
    if (route.name === "FlowTemplateDesign") {
      result.push({
        path: "/flow-templates",
        title: "工作流程範本",
      });
      result.push({
        path: route.path,
        title: flowTemplateStore.templateName || "載入中...",
      });
    }
    // 其他一般路由的處理
    else if (!route.meta?.hidden) {
      result.push({
        path: route.path,
        title: route.meta?.title || route.name,
      });
    }
  });
  return result;
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
  @apply fixed right-0;
  z-index: 8;
  width: calc(100% - 12rem); /* 48px * 3 = 12rem，對應左側導航欄寬度 */
  transition: width 0.2s ease-in-out;
}

.collapsed .content-header {
  width: calc(100% - 4rem); /* 16px * 4 = 4rem，對應收合後的左側導航欄寬度 */
}

.main-content {
  height: calc(100vh - 3.3rem);
  overflow-y: auto;
  transition: padding-top 0.2s ease-in-out;
  padding-top: 0 !important;
}

.main-content.has-header {
  padding-top: 2.5rem !important;
}

/* 麵包屑樣式 */
.el-breadcrumb {
  @apply text-sm;
}

.el-breadcrumb__item {
  @apply flex items-center;
}

.el-breadcrumb__inner {
  @apply text-gray-500;
}

.el-breadcrumb__inner.is-link {
  @apply text-gray-600 hover:text-blue-500;
}

.el-breadcrumb__separator {
  @apply text-gray-400;
}

/* 載入中的動畫效果 */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}

.el-breadcrumb__inner:empty::after {
  content: "載入中...";
  @apply text-gray-400;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
