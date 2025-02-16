<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <!-- 歡迎區塊 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h1 class="text-2xl font-semibold text-gray-800 mb-4">
        歡迎使用 IYM 良率分析平台
      </h1>
      <p class="text-gray-600 mb-4">
        本系統旨在幫助您更有效地管理和分析良率數據。透過直觀的介面和強大的分析工具，
        您可以輕鬆追蹤專案進度、管理工作流程，並獲得有價值的數據洞察。
      </p>

      <!-- 快速入門卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="bg-blue-50 rounded-lg p-4">
          <h3 class="text-lg font-medium text-blue-700 mb-2">專案管理</h3>
          <p class="text-sm text-blue-600">
            創建和管理您的分析專案，追蹤進度和成果。
          </p>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
          <h3 class="text-lg font-medium text-green-700 mb-2">工作流程</h3>
          <p class="text-sm text-green-600">
            使用預設範本或自定義工作流程進行分析。
          </p>
        </div>
        <div class="bg-purple-50 rounded-lg p-4">
          <h3 class="text-lg font-medium text-purple-700 mb-2">數據分析</h3>
          <p class="text-sm text-purple-600">
            透過視覺化圖表深入理解您的數據。
          </p>
        </div>
      </div>
    </div>

    <!-- 版本歷史 -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <History class="mr-2" :size="20" />
        版本歷史
      </h2>

      <div class="space-y-6">
        <div class="border-l-2 border-blue-500 pl-4">
          <div class="flex items-center">
            <span class="text-sm font-semibold text-blue-600">v1.1.0</span>
            <span class="text-xs text-gray-500 ml-2">2024-02-16</span>
          </div>
          <h3 class="text-lg font-medium text-gray-800 mt-1">系統代碼更新</h3>
          <ul class="mt-2 space-y-1 text-gray-600 text-sm">
            <li>• 新增系統代碼管理功能</li>
            <li>• 新增專案編號自動生成</li>
            <li>• 優化數據庫結構</li>
          </ul>
        </div>

        <div class="border-l-2 border-gray-300 pl-4">
          <div class="flex items-center">
            <span class="text-sm font-semibold text-gray-600">v1.0.0</span>
            <span class="text-xs text-gray-500 ml-2">2024-02-11</span>
          </div>
          <h3 class="text-lg font-medium text-gray-800 mt-1">初始版本發布</h3>
          <ul class="mt-2 space-y-1 text-gray-600 text-sm">
            <li>• 基礎專案管理功能</li>
            <li>• 工作流程設計工具</li>
            <li>• 用戶權限管理系統</li>
            <li>• 數據分析和視覺化</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { History } from "lucide-vue-next";
</script>
