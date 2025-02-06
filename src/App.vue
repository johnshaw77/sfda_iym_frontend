<script setup>
import WorkflowCanvas from "./components/WorkflowCanvas.vue";
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>良率分析平台</h1>
    </header>
    <main class="app-main">
      <WorkflowCanvas class="workflow-container" />
    </main>
  </div>
</template>

<style>
.app-container {
  @apply h-screen flex flex-col bg-gray-100;
}

.app-header {
  @apply bg-blue-600 text-white p-4 shadow-md;
}

.app-header h1 {
  @apply text-2xl font-bold;
}

.app-main {
  @apply flex-1 p-4;
}

.workflow-container {
  @apply w-full h-full bg-white rounded-lg shadow-lg;
  height: calc(100vh - 120px);
}
</style>
