<template>
  <el-container class="h-screen">
    <el-aside width="240px" class="bg-white border-r">
      <div class="flex items-center justify-center h-[60px] border-b">
        <h1 class="text-xl font-bold text-gray-800">SFDA IYM</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="h-[calc(100%-60px)]"
        @select="handleSelect"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首頁</span>
        </el-menu-item>
        <el-menu-item index="/projects">
          <el-icon><Folder /></el-icon>
          <span>專案管理</span>
        </el-menu-item>
        <el-menu-item index="/workflow">
          <el-icon><Connection /></el-icon>
          <span>工作流程</span>
        </el-menu-item>
        <el-menu-item index="/files">
          <el-icon><Document /></el-icon>
          <span>檔案管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <AppHeader />
      <el-main class="bg-gray-50">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  HomeFilled,
  Folder,
  Connection,
  Document,
} from "@element-plus/icons-vue";
import AppHeader from "@/components/AppHeader.vue";

const route = useRoute();
const router = useRouter();

// 當前選中的菜單項
const activeMenu = computed(() => route.path);

// 處理菜單選擇
const handleSelect = (index) => {
  router.push(index);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
