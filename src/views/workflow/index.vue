<template>
  <div class="h-full relative">
    <WorkflowCanvas />
  </div>
</template>

<script setup>
import WorkflowCanvas from "./components/WorkflowCanvas.vue";

defineOptions({
  name: "Workflow",
});
</script>

<style scoped>
.workflow-fit-button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.workflow-fit-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
</style>
