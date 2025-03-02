<template>
  <el-dialog
    v-model="dialogVisible"
    title="創建流程實例"
    width="600px"
    :close-on-click-modal="false">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent>
      <el-form-item
        label="專案"
        prop="projectId">
        <el-select
          v-model="form.projectId"
          placeholder="選擇專案"
          style="width: 100%">
          <el-option
            v-for="project in projects"
            :key="project.id"
            :label="project.name"
            :value="project.id" />
        </el-select>
      </el-form-item>
      <el-form-item
        label="流程模板"
        prop="templateId">
        <el-select
          v-model="form.templateId"
          placeholder="選擇流程模板"
          style="width: 100%">
          <el-option
            v-for="template in templates"
            :key="template.id"
            :label="template.name"
            :value="template.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="submitting">
        確定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  projects: {
    type: Array,
    required: true,
  },
  templates: {
    type: Array,
    required: true,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:visible", "submit", "cancel"]);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const formRef = ref(null);
const form = reactive({
  projectId: "",
  templateId: "",
});

// 表單驗證規則
const rules = {
  projectId: [{ required: true, message: "請選擇專案", trigger: "change" }],
  templateId: [
    { required: true, message: "請選擇流程模板", trigger: "change" },
  ],
};

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    emit("submit", form);
  } catch (error) {
    console.error("表單驗證失敗:", error);
  }
};

// 取消
const handleCancel = () => {
  emit("cancel");
  resetForm();
};

// 重置表單
const resetForm = () => {
  form.projectId = "";
  form.templateId = "";
  formRef.value?.resetFields();
};

// 暴露方法
defineExpose({
  resetForm,
});
</script>
