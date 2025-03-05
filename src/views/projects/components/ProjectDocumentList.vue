<template>
  <div class="bg-white p-2 border-b border-gray-200">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">📎 專案文件</h3>
      <div class="flex items-center space-x-2">
        <el-select
          v-model="docTypeFilter"
          placeholder="篩選類型"
          clearable
          size="small"
          class="!w-24">
          <el-option
            label="報告"
            value="report" />
          <el-option
            label="圖片"
            value="image" />
          <el-option
            label="附件"
            value="attachment" />
        </el-select>
      </div>
    </div>

    <DocumentList
      :documents="filteredDocuments"
      :loading="loading"
      :show-project-column="false"
      @refresh="handleRefresh" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import DocumentList from "@/views/documents/components/DocumentList.vue";

const props = defineProps({
  documents: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["refresh"]);

const docTypeFilter = ref("");

// 過濾後的文件列表
const filteredDocuments = computed(() => {
  if (!docTypeFilter.value) return props.documents;
  return props.documents.filter((doc) => doc.docType === docTypeFilter.value);
});

const handleRefresh = () => {
  emit("refresh");
};
</script>
