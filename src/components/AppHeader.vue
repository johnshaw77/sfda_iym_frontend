<template>
  <el-header
    class="!px-0 !h-12 fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200"
  >
    <div class="flex justify-between items-center h-full px-4">
      <!-- Logo 區域 -->
      <div class="flex items-center space-x-0">
        <img src="/logo.png" class="w-10 h-10" />
        <h1 class="text-xl font-semibold text-gray-800">良率分析平台</h1>
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
        <el-dropdown trigger="click">
          <div class="flex items-center space-x-2 cursor-pointer">
            <div class="relative">
              <el-avatar
                :size="48"
                :src="userInfo.avatar"
                :alt="userInfo.nickname"
                class="!bg-blue-100"
              >
                <span class="text-sm font-medium text-blue-600">{{
                  userInfo.nickname.slice(0, 1)
                }}</span>
              </el-avatar>
              <div
                class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"
              ></div>
            </div>
          </div>

          <template #dropdown>
            <el-dropdown-menu>
              <div class="px-4 py-2">
                <div class="font-medium text-gray-900">
                  {{ userInfo.name }}
                </div>
                <div class="text-sm text-gray-500">{{ userInfo.email }}</div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ userInfo.role }}
                </div>
              </div>
              <el-divider class="!my-1" />
              <el-dropdown-item>
                <User :size="14" class="mr-2" />個人資料
              </el-dropdown-item>
              <el-dropdown-item>
                <Settings :size="14" class="mr-2" />偏好設定
              </el-dropdown-item>
              <el-divider class="!my-1" />
              <el-dropdown-item>
                <Bell :size="14" class="mr-2" />通知設定
              </el-dropdown-item>
              <el-dropdown-item>
                <Shield :size="14" class="mr-2" />隱私權設定
              </el-dropdown-item>
              <el-divider class="!my-1" />
              <el-dropdown-item class="!text-red-500">
                <LogOut :size="14" class="mr-2" />登出
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { Bell, Settings, User, Shield, LogOut } from "lucide-vue-next";

// 模擬用戶資訊
const userList = [
  {
    nickname: "王小明",
    name: "王小明 (Ming Wang)",
    email: "ming.wang@example.com",
    role: "系統管理員",
    avatar: "/Avatar/avatar1.png",
  },
  {
    nickname: "陳美玲",
    name: "陳美玲 (Mei-Ling Chen)",
    email: "meiling.chen@example.com",
    role: "資深工程師",
    avatar: "/avatar/avatar2.png",
  },
  {
    nickname: "林志偉",
    name: "林志偉 (Zhi-Wei Lin)",
    email: "zhiwei.lin@example.com",
    role: "品質主管",
    avatar: "/avatar/avatar3.png",
  },
  {
    nickname: "張雅婷",
    name: "張雅婷 (Ya-Ting Chang)",
    email: "yating.chang@example.com",
    role: "數據分析師",
    avatar: "/avatar/avatar4.png",
  },
  {
    nickname: "黃建志",
    name: "黃建志 (Jian-Zhi Huang)",
    email: "jianzhi.huang@example.com",
    role: "製程工程師",
    avatar: "/avatar/avatar5.png",
  },
  {
    nickname: "李佳穎",
    name: "李佳穎 (Jia-Ying Li)",
    email: "jiaying.li@example.com",
    role: "研發工程師",
    avatar: "/avatar/avatar6.png",
  },
  {
    nickname: "吳俊宏",
    name: "吳俊宏 (Jun-Hong Wu)",
    email: "junhong.wu@example.com",
    role: "專案經理",
    avatar: "/avatar/avatar7.png",
  },
  {
    nickname: "蔡雨涵",
    name: "蔡雨涵 (Yu-Han Tsai)",
    email: "yuhan.tsai@example.com",
    role: "測試工程師",
    avatar: "/avatar/avatar8.png",
  },
  {
    nickname: "楊承翰",
    name: "楊承翰 (Cheng-Han Yang)",
    email: "chenghan.yang@example.com",
    role: "維護工程師",
    avatar: "/avatar/avatar9.png",
  },
  {
    nickname: "周詩涵",
    name: "周詩涵 (Shi-Han Zhou)",
    email: "shihan.zhou@example.com",
    role: "品保工程師",
    avatar: "/avatar/avatar10.png",
  },
  {
    nickname: "劉冠宏",
    name: "劉冠宏 (Guan-Hong Liu)",
    email: "guanhong.liu@example.com",
    role: "自動化工程師",
    avatar: "/avatar/avatar11.png",
  },
];

// 隨機選擇一個用戶
const userInfo = userList[Math.floor(Math.random() * userList.length)];
</script>

<style scoped>
.el-dropdown-menu {
  @apply min-w-[240px];
}
</style>
