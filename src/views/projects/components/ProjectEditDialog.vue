<template>
  <el-dialog
    :title="isEdit ? '編輯專案' : '新增專案'"
    v-model="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="top">
      <el-form-item
        label="專案名稱"
        prop="name">
        <el-input
          v-model="formData.name"
          placeholder="請輸入專案名稱" />
      </el-form-item>
      <el-form-item
        label="專案描述"
        prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="請輸入專案描述" />
      </el-form-item>
      <el-form-item
        label="專案狀態"
        prop="status">
        <el-select
          v-model="formData.status"
          placeholder="請選擇專案狀態"
          style="width: 100%">
          <el-option
            label="草稿"
            value="draft" />
          <el-option
            label="進行中"
            value="active" />
          <el-option
            label="已完成"
            value="completed" />
          <el-option
            label="已取消"
            value="cancelled" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit">
          確定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
// 定義 props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  project: {
    type: Object,
    default: () => ({
      id: "",
      name: "",
      description: "",
      status: "draft",
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

// 定義 emits
const emit = defineEmits(["update:modelValue", "submit", "cancel"]);

// 表單相關
const formRef = ref(null);
const formData = ref({
  id: "",
  name: "",
  description: "",
  status: "draft",
});

// 表單驗證規則
const rules = {
  name: [{ required: true, message: "請輸入專案名稱", trigger: "blur" }],
  description: [{ required: true, message: "請輸入專案描述", trigger: "blur" }],
  status: [{ required: true, message: "請選擇專案狀態", trigger: "change" }],
};

// 對話框可見性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// 初始化表單數據
const initFormData = () => {
  if (props.isEdit && props.project && Object.keys(props.project).length > 0) {
    // 編輯模式，填充表單數據
    formData.value = {
      id: props.project.id || "",
      name: props.project.name || "",
      description: props.project.description || "",
      status: props.project.status || "draft",
    };
  } else {
    // 新增模式，重置表單
    formData.value = {
      id: "",
      name: "",
      description: "",
      status: "draft",
    };
  }
};

// 監聽 project 變化
watch(
  () => props.project,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      formData.value = {
        id: newVal.id || "",
        name: newVal.name || "",
        description: newVal.description || "",
        status: newVal.status || "draft",
      };
    }
  },
  { immediate: true, deep: true }
);

// 監聽 modelValue 變化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      // 當對話框打開時，初始化表單數據
      initFormData();
    }
  },
  { immediate: true }
);

// 處理取消
const handleCancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};

// 處理提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    emit("submit", { ...formData.value });
  } catch (error) {
    console.error("表單驗證失敗:", error);
  }
};
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
