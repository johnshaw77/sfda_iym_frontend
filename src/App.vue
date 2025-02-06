<script setup>
import { ref } from "vue";
import WorkflowCanvas from "./components/WorkflowCanvas.vue";
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-md">
      <div class="h-16 flex items-center justify-center border-b">
        <h1 class="text-xl font-semibold text-gray-800">良率分析平台</h1>
      </div>
      <nav class="p-4">
        <ul class="space-y-2">
          <li>
            <a
              href="#"
              class="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              <i class="fas fa-chart-line mr-3"></i>
              工作流程
            </a>
          </li>
          <li>
            <a
              href="#"
              class="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              <i class="fas fa-file-alt mr-3"></i>
              文件管理
            </a>
          </li>
          <li>
            <a
              href="#"
              class="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              <i class="fas fa-cog mr-3"></i>
              設置
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header
        class="h-16 bg-white shadow-md flex items-center justify-between px-6"
      >
        <div class="flex items-center">
          <h2 class="text-lg font-medium text-gray-800">工作流程</h2>
        </div>
        <div class="flex items-center space-x-4">
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <i class="fas fa-plus mr-2"></i>新建工作流
          </button>
          <div class="relative">
            <button
              class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
            >
              <i class="fas fa-user text-gray-600"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Workflow Canvas Area -->
      <main class="flex-1 p-6 bg-gray-100">
        <WorkflowCanvas />
      </main>
    </div>
  </div>
</template>

<style>
@import "@fortawesome/fontawesome-svg-core/styles.css";
</style>
