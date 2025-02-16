<template>
  <div class="sidebar-wrapper">
    <el-menu
      class="sidebar-menu"
      :default-active="route.path"
      :collapse="isCollapse"
      background-color="#ffffff"
      text-color="#333333"
      active-text-color="#409EFF"
      popper-effect="light"
    >
      <div class="menu-scroll-container">
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
          @click="$router.push(item.path)"
        >
          <component :is="item.icon" :size="24" />
          <template #title>
            <span class="menu-title">{{ item.title }}</span>
          </template>
        </el-menu-item>
      </div>
    </el-menu>

    <!-- 版本信息 -->
    <div v-show="!isCollapse" class="version-info">
      <span class="version-text">v{{ version }}</span>
    </div>

    <!-- 折疊按鈕 -->
    <el-button type="text" class="collapse-button" @click="toggleCollapse">
      <component :is="isCollapse ? ChevronRight : ChevronLeft" :size="16" />
    </el-button>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import pkg from "../../package.json";

const version = pkg.version;
const route = useRoute();
const router = useRouter();
const isCollapse = ref(false);

// 從路由配置生成選單項目
const menuItems = computed(() => {
  return router.options.routes
    .filter(
      (route) =>
        !route.redirect &&
        route.name &&
        !route.meta?.guest &&
        !route.meta?.hidden
    )
    .map((route) => ({
      path: route.path,
      name: route.name,
      icon: route.meta?.icon || Settings,
      title: route.meta?.title || route.name,
    }));
});

// 折疊切換
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 暴露 isCollapse 屬性
defineExpose({
  isCollapse,
});
</script>

<style>
/* 全局樣式，不使用 scoped */
.el-popper.is-light {
  @apply !text-xs !font-medium;
  padding: 8px 12px !important;
}
</style>

<style scoped>
.sidebar-wrapper {
  @apply relative;
  height: 100vh;
}

.sidebar-menu {
  @apply fixed left-0 top-12 bottom-0 border-r border-slate-200;
  transition: width 0.2s ease-in-out;
}

.collapse-button {
  @apply fixed z-20 !w-4 !h-4 !p-0 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-blue-500;
  left: 220px;
  top: 72px;
  transform: translateX(50%);
  transition: left 0.2s ease-in-out;
}

/* 當選單收合時，按鈕也要跟著移動 */
:deep(.el-menu.el-menu--collapse) ~ .collapse-button {
  left: 60px;
}

/* 移除按鈕 focus 效果 */
.collapse-button:focus {
  @apply !outline-none !text-inherit;
  box-shadow: none !important;
}

.el-menu--vertical:not(.el-menu--collapse) {
  @apply !w-48;
}

.el-menu--collapse {
  @apply !w-16;
}

/* 為選單項目添加過渡效果 */
:deep(.el-menu-item) {
  @apply !border-l-4 !border-transparent;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
}

:deep(.el-menu-item.is-active) {
  @apply !border-l-4 !border-blue-500 !bg-blue-50;
}

:deep(.el-menu-item:hover) {
  @apply !bg-gray-50;
}

/* 為選單文字添加過渡效果 */
:deep(.menu-title) {
  display: inline-block;
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

:deep(.el-menu--collapse .menu-title) {
  opacity: 0;
  width: 0;
  display: inline-block;
}

/* 為圖標添加過渡效果 */
:deep(.el-menu-item svg) {
  transition: margin 0.2s ease-in-out;
}

.menu-scroll-container {
  height: calc(100vh - 48px);
  @apply overflow-y-auto;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

/* 自定義捲動條樣式 */
.menu-scroll-container::-webkit-scrollbar {
  @apply w-1;
}

.menu-scroll-container::-webkit-scrollbar-track {
  @apply bg-transparent;
}

.menu-scroll-container::-webkit-scrollbar-thumb {
  @apply bg-gray-200 rounded-full;
}

.menu-scroll-container::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-300;
}

.version-info {
  @apply fixed left-0 bottom-0 w-48 py-2 px-4 text-xs text-gray-400 border-t border-slate-200 bg-white text-center;
  transition: all 0.2s ease-in-out;
}

.version-text {
  @apply opacity-100 transition-opacity duration-200 inline-block;
}
</style>
