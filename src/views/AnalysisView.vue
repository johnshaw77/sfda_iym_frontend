<template>
  <el-card class="h-full" shadow="never">
    <template #header>
      <div class="flex justify-between items-center">
        <span>分析列表</span>
        <el-button type="primary" @click="handleNewAnalysis">
          <font-awesome-icon icon="chart-line" class="mr-2" />
          新建分析
        </el-button>
      </div>
    </template>

    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="進行中" name="processing">
        <el-table
          :data="processingData"
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="name" label="分析名稱" />
          <el-table-column prop="type" label="分析類型" width="180" />
          <el-table-column prop="progress" label="進度" width="200">
            <template #default="scope">
              <el-progress :percentage="scope.row.progress" />
            </template>
          </el-table-column>
          <el-table-column prop="date" label="創建時間" width="180" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button-group>
                <el-button type="primary" link>
                  <font-awesome-icon icon="eye" />
                </el-button>
                <el-button type="danger" link>
                  <font-awesome-icon icon="trash" />
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="已完成" name="completed">
        <el-table :data="completedData" style="width: 100%" v-loading="loading">
          <el-table-column prop="name" label="分析名稱" />
          <el-table-column prop="type" label="分析類型" width="180" />
          <el-table-column prop="result" label="結果" width="180" />
          <el-table-column prop="date" label="完成時間" width="180" />
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="scope">
              <el-button-group>
                <el-button type="primary" link>
                  <font-awesome-icon icon="eye" />
                </el-button>
                <el-button type="success" link>
                  <font-awesome-icon icon="download" />
                </el-button>
                <el-button type="danger" link>
                  <font-awesome-icon icon="trash" />
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <div class="flex justify-center mt-4" v-if="noData">
      <el-empty description="暫無分析數據" />
    </div>

    <template #footer>
      <el-pagination
        v-if="!noData"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
        class="mt-4 flex justify-end"
      />
    </template>
  </el-card>

  <!-- 新建分析對話框 -->
  <el-dialog v-model="dialogVisible" title="新建分析" width="500px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="分析名稱">
        <el-input v-model="form.name" placeholder="請輸入分析名稱" />
      </el-form-item>
      <el-form-item label="分析類型">
        <el-select
          v-model="form.type"
          placeholder="請選擇分析類型"
          class="w-full"
        >
          <el-option label="相關性分析" value="correlation" />
          <el-option label="回歸分析" value="regression" />
          <el-option label="分類分析" value="classification" />
          <el-option label="聚類分析" value="clustering" />
        </el-select>
      </el-form-item>
      <el-form-item label="數據來源">
        <el-select
          v-model="form.dataSource"
          placeholder="請選擇數據來源"
          class="w-full"
        >
          <el-option label="製程數據A" value="process_a" />
          <el-option label="製程數據B" value="process_b" />
          <el-option label="檢驗數據" value="inspection" />
        </el-select>
      </el-form-item>
      <el-form-item label="備註">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="請輸入備註"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">確定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from "vue";

const loading = ref(false);
const activeTab = ref("processing");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);

// 表單數據
const form = ref({
  name: "",
  type: "",
  dataSource: "",
  description: "",
});

// 模擬數據
const processingData = ref([
  {
    name: "製程A良率分析",
    type: "相關性分析",
    progress: 45,
    date: "2024-02-06 10:30",
  },
]);

const completedData = ref([
  {
    name: "製程B良率分析",
    type: "回歸分析",
    result: "已完成",
    date: "2024-02-05 15:20",
  },
]);

const noData = computed(() => {
  return activeTab.value === "processing"
    ? processingData.value.length === 0
    : completedData.value.length === 0;
});

// 處理函數
const handleNewAnalysis = () => {
  dialogVisible.value = true;
};

const handlePageChange = (page) => {
  currentPage.value = page;
  // TODO: 加載對應頁面的數據
};

const handleSubmit = () => {
  // TODO: 提交表單數據
  console.log("Form data:", form.value);
  dialogVisible.value = false;
};
</script>

<style scoped>
.el-card {
  @apply !border-none;
}

.el-tabs {
  @apply -mx-5;
}
</style>
