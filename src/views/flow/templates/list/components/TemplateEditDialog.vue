<template>
  <el-dialog
    :title="isEdit ? '編輯流程模板' : '新增流程模板'"
    :modelValue="visible"
    @update:modelValue="$emit('update:visible', $event)"
    width="50%"
    top="5vh"
    draggable
    destroy-on-close>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
      @submit.prevent>
      <el-form-item
        label="名稱"
        prop="name">
        <el-input
          v-model="formData.name"
          placeholder="請輸入流程模板名稱" />
      </el-form-item>

      <el-form-item
        label="類型"
        prop="type">
        <el-select
          v-model="formData.type"
          placeholder="請選擇類型"
          class="w-full">
          <el-option
            label="業務流程"
            value="business" />
          <el-option
            label="系統流程"
            value="system" />
        </el-select>
      </el-form-item>

      <el-form-item
        label="描述"
        prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="請輸入流程模板描述" />
      </el-form-item>

      <el-form-item
        label="版本"
        prop="version">
        <el-input
          v-model="formData.version"
          placeholder="請輸入版本號，例如：1.0.0" />
      </el-form-item>

      <el-form-item
        label="狀態"
        prop="status">
        <el-select
          v-model="formData.status"
          placeholder="請選擇狀態"
          class="w-full">
          <el-option
            label="草稿"
            value="draft" />
          <el-option
            label="啟用"
            value="active" />
          <el-option
            label="停用"
            value="inactive" />
        </el-select>
      </el-form-item>

      <el-collapse
        v-model="activeNames"
        class="mb-4">
        <el-collapse-item
          title="進階設定"
          name="advanced">
          <el-form-item
            label="節點"
            prop="nodes">
            <el-input
              v-model="formData.nodes"
              type="textarea"
              :rows="5"
              placeholder="請輸入節點 JSON 數據" />
          </el-form-item>

          <el-form-item
            label="連線"
            prop="edges">
            <el-input
              v-model="formData.edges"
              type="textarea"
              :rows="5"
              placeholder="請輸入連線 JSON 數據" />
          </el-form-item>

          <el-form-item
            label="元數據"
            prop="metadata">
            <el-input
              v-model="formData.metadata"
              type="textarea"
              :rows="5"
              placeholder="請輸入元數據 JSON 數據" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="loading">
          {{ isEdit ? "更新" : "創建" }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  form: {
    type: Object,
    required: true,
  },
  rules: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:visible", "submit", "cancel"]);

const formRef = ref(null);
const loading = ref(false);
const activeNames = ref([]);
const formData = reactive({ ...props.form });

// 監聽表單數據變化
watch(
  () => props.form,
  (newVal) => {
    Object.assign(formData, newVal);
  },
  { deep: true }
);

// 處理取消
const handleCancel = () => {
  emit("cancel");
};

// 處理提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    loading.value = true;
    await formRef.value.validate();
    emit("submit", { ...formData });
  } catch (error) {
    console.error("表單驗證失敗", error);
  } finally {
    loading.value = false;
  }
};
</script>
