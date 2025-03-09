<template>
  <div>
    <json-viewer
      :value="jsonData"
      :expand-depth="expandDepth"
      expand-icon-style="circle"
      sort
      boxed
      :expand-on-click="expandOnClick"
      class="custom-json-viewer" />
  </div>
</template>

<script setup>
import JsonViewer from "vue-json-viewer";
import "vue-json-viewer/style.css";

const props = defineProps({
  jsonData: {
    type: Object,
    required: true,
  },
  expandDepth: {
    type: Number,
    default: 2,
  },
  expandOnClick: {
    type: Boolean,
    default: true,
  },
});
</script>

<style scoped>
/* JSON Viewer 自定義樣式 */
.custom-json-viewer {
  background-color: #f9fafb !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
  border: 1px solid #e5e7eb !important;
}

.custom-json-viewer :deep(.jv-container) {
  background: none !important;
}

.custom-json-viewer :deep(.jv-container .jv-code) {
  padding: 0 !important;
  background: none !important;
}

.custom-json-viewer :deep(.jv-container .jv-key) {
  color: #2563eb !important;
}

.custom-json-viewer :deep(.jv-container .jv-item.jv-string) {
  color: #059669 !important;
}

.custom-json-viewer :deep(.jv-container .jv-item.jv-number) {
  color: #d97706 !important;
}

.custom-json-viewer :deep(.jv-container .jv-item.jv-boolean) {
  color: #7c3aed !important;
}

.custom-json-viewer :deep(.jv-container .jv-item.jv-null) {
  color: #dc2626 !important;
}
</style>
