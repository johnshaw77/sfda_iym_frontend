<template>
  <el-dialog
    :title="isEdit ? '編輯節點定義' : '新增節點定義'"
    v-model="dialogVisible"
    top="5vh"
    draggable
    width="800px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      class="mt-4">
      <el-form-item
        label="名稱"
        prop="name">
        <el-input
          v-model="formData.name"
          placeholder="請輸入名稱" />
      </el-form-item>
      <el-form-item
        label="分類"
        prop="category">
        <el-select
          v-model="formData.category"
          placeholder="請選擇分類"
          style="width: 100%">
          <el-option
            label="資料輸入"
            value="data-input" />
          <el-option
            label="資料處理"
            value="data-process" />
          <el-option
            label="資料輸出"
            value="data-output" />
        </el-select>
      </el-form-item>
      <el-form-item
        label="描述"
        prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="請輸入描述" />
      </el-form-item>
      <el-form-item
        label="圖示"
        prop="icon">
        <IconPicker
          :modelValue="formData.icon"
          @update:modelValue="formData.icon = $event" />
      </el-form-item>
      <el-form-item
        label="組件路徑"
        prop="componentPath">
        <div class="flex items-center space-x-1">
          <div
            class="px-1 bg-gray-100 rounded-sm text-gray-500 whitespace-nowrap">
            @/components/flow-nodes/
          </div>
          <el-select
            v-model="formData.componentPath"
            class="!w-[100px]"
            placeholder="請選擇組件路徑"
            filterable>
            <el-option
              label="base"
              value="base" />
            <el-option
              label="business"
              value="business" />
          </el-select>

          <el-autocomplete
            v-model="formData.componentName"
            :fetch-suggestions="queryComponentSearch"
            placeholder="組件名稱，例如：TopDefectsNode"
            clearable
            style="width: 340px"
            @select="handleComponentNameSelect">
            <template #default="{ item }">
              <div class="flex flex-col">
                <span>{{ item.value }}</span>
                <span class="text-xs text-gray-500">{{ item.path }}</span>
              </div>
            </template>
          </el-autocomplete>
        </div>
        <div class="form-item-tip w-full mt-2">
          <el-alert
            type="warning"
            show-icon
            :closable="false"
            class="mt-0">
            組件的相對路徑，系統會自動添加 @/components/flow-nodes/ 前綴
            <br />※※系統裡要有對應的 Vue 組件※※</el-alert
          >
        </div>
      </el-form-item>
      <el-divider><ArrowBigDownDash /></el-divider>
      <div
        v-if="fullComponentPath"
        class="text-white bg-blue-700 p-2 rounded-md flex items-center justify-between">
        <div>
          完整組件路徑:
          {{ fullComponentPath }}
        </div>
        <el-button
          type="primary"
          plain
          size="small"
          @click="handlePreview">
          預覽節點
        </el-button>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          >確定</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import { ArrowBigDownDash } from "lucide-vue-next";
import IconPicker from "@/components/IconPicker.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Object,
    required: true,
  },
  rules: {
    type: Object,
    required: true,
  },
  componentOptions: {
    type: Array,
    default: () => [],
  },
  flowNodeComponents: {
    type: Object,
    default: () => ({}),
  },
  fullComponentPath: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "update:modelValue",
  "submit",
  "preview",
  "query-components",
]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const formRef = ref(null);

// 計算屬性
const fullComponentPath = computed(() => {
  if (!props.formData.componentPath || !props.formData.componentName) return "";
  // 確保組件名稱包含 .vue 副檔名
  const componentName = props.formData.componentName.endsWith(".vue")
    ? props.formData.componentName
    : `${props.formData.componentName}.vue`;
  return `@/components/flow-nodes/${props.formData.componentPath}/${componentName}`;
});

// 監聽表單數據變化
watch(
  () => props.formData,
  (newVal) => {
    Object.assign(props.formData, newVal);
  },
  { deep: true }
);

// 處理組件名稱選擇
const handleComponentNameSelect = (item) => {
  props.formData.componentName = item.value;
};

// 處理組件搜尋
const queryComponentSearch = (queryString, cb) => {
  const results = props.componentOptions
    .filter((option) => {
      // 如果有選擇 componentPath，則只顯示對應路徑下的組件
      if (props.formData.componentPath) {
        return (
          option.path.includes(`/${props.formData.componentPath}/`) &&
          option.label.toLowerCase().includes(queryString.toLowerCase())
        );
      }
      // 否則顯示所有符合搜尋條件的組件
      return option.label.toLowerCase().includes(queryString.toLowerCase());
    })
    .map((option) => ({
      value: option.label.replace(".vue", ""),
      path: option.path,
      fullPath: option.value,
    }));

  cb(results);
};

// 處理預覽
const handlePreview = () => {
  emit("preview");
};

// 處理提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      emit("submit", props.formData, valid);
    }
  });
};
</script>

<style scoped>
.form-item-tip {
  font-size: 12px;
  color: #909399;
}
</style>
