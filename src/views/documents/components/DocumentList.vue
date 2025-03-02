<template>
  <div class="document-list">
    <!-- 文件列表表格 -->
    <el-table
      v-loading="loading"
      :data="documents"
      style="width: 100%"
      border>
      <el-table-column
        type="index"
        label="序號"
        width="80" />
      <el-table-column
        prop="name"
        label="文檔名稱"
        min-width="200" />
      <el-table-column
        prop="docType"
        label="類型"
        width="120">
        <template #default="{ row }">
          <el-tag :type="getDocTypeTag(row.docType)">
            {{ getDocTypeLabel(row.docType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="project.name"
        label="所屬專案"
        width="180"
        v-if="showProjectColumn" />

      <el-table-column
        label="上傳者"
        width="200"
        align="center">
        <template #default="{ row }">
          <div class="flex items-center justify-center">
            <el-avatar
              :size="24"
              :src="`http://localhost:3001/uploads/avatars/${row.creator.avatar}`">
              {{ row.creator.username.charAt(0) }}
            </el-avatar>
            <span class="ml-2">{{ row.creator.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="createdAt"
        label="上傳時間"
        width="180">
        <template #default="{ row }">
          {{ formatTimestamp(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="240"
        fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              v-if="isImage(row.docType)"
              type="primary"
              :icon="Search"
              @click="handlePreview(row)">
              <Eye
                :size="14"
                class="mr-1" />
              預覽
            </el-button>
            <el-button
              type="primary"
              :icon="Download"
              @click="handleDownload(row)">
              <Download
                :size="14"
                class="mr-1" />
              下載
            </el-button>
            <el-button
              v-if="showDeleteButton"
              type="danger"
              @click="handleDelete(row)">
              <Trash
                :size="14"
                class="mr-1" />
              刪除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @update:current-page="currentPage = $event"
        @update:page-size="pageSize = $event" />
    </div>

    <!-- 預覽對話框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="文檔預覽"
      width="800px"
      destroy-on-close>
      <div class="preview-content">
        <img
          v-if="previewDocument && isImage(previewDocument.docType)"
          :src="previewDocument.url"
          style="max-width: 100%; max-height: 600px" />
        <div v-else>此文檔類型不支援預覽</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { Search, Download, Delete } from "@element-plus/icons-vue";
import { deleteDocument } from "@/api/modules/flowDocument";
import { formatTimestamp } from "@/utils/dateUtils";

const props = defineProps({
  documents: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showProjectColumn: {
    type: Boolean,
    default: true,
  },
  showDeleteButton: {
    type: Boolean,
    default: true,
  },
  projectId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["refresh", "size-change", "current-change"]);

// 狀態
const total = computed(() => props.documents.length);
const currentPage = ref(1);
const pageSize = ref(10);

// 預覽相關
const previewDialogVisible = ref(false);
const previewDocument = ref(null);

// 工具方法
const getDocTypeLabel = (type) => {
  const types = {
    report: "報告",
    image: "圖片",
    attachment: "附件",
  };
  return types[type] || type;
};

const getDocTypeTag = (type) => {
  const types = {
    report: "success",
    image: "warning",
    attachment: "info",
  };
  return types[type] || "";
};

const isImage = (type) => type === "image";

// 處理方法
const handlePreview = (row) => {
  previewDocument.value = row;
  previewDialogVisible.value = true;
};

const handleDownload = (row) => {
  window.open(row.url, "_blank");
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("確定要刪除此文檔嗎？", "警告", {
      type: "warning",
    });

    await deleteDocument(row.id);
    ElMessage.success("刪除成功");
    emit("refresh");
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("刪除失敗");
    }
  }
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  emit("size-change", val);
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  emit("current-change", val);
};
</script>

<style scoped>
.document-list {
  width: 100%;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
</style>
