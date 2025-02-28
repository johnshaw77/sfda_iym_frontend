<template>
  <div
    class="border-l border-gray-200 h-full flex flex-col bg-white transition-all duration-300"
    :class="[isCollapsed ? 'w-12' : 'w-96']">
    <div
      class="p-2.5 border-b border-gray-200 bg-slate-50 flex items-center space-x-1">
      <div class="flex items-center">
        <el-tooltip
          :content="isCollapsed ? '展開面板' : '收合面板'"
          placement="left">
          <div
            class="p-1 rounded hover:bg-gray-100 cursor-pointer"
            @click="handleTogglePanel">
            <component
              :is="isCollapsed ? 'PanelRightOpen' : 'PanelRightClose'"
              class="text-gray-500"
              :size="16" />
          </div>
        </el-tooltip>
      </div>
      <h3
        v-show="!isCollapsed"
        class="text-sm font-medium text-gray-700">
        基本屬性
      </h3>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div
        v-show="!isCollapsed"
        class="p-2 space-y-4">
        <!-- 基本屬性 -->
        <div class="space-y-2">
          <!-- 表單 -->
          <div v-loading="!flowTemplate" />

          <el-form
            v-if="flowTemplate"
            ref="formRef"
            :model="flowTemplate"
            :rules="formRules"
            label-width="80px"
            label-position="left">
            <!-- // 如何判斷範本名稱是否已存在-->
            <el-form-item
              label="範本類型"
              prop="type">
              <el-select
                v-model="flowTemplate.type"
                placeholder="請選擇範本類型"
                :fit-input-width="true">
                <el-option
                  label="business"
                  value="business" />
              </el-select>
              <el-tag type="info"
                >先暫時固定 business (未來會有流程類型)</el-tag
              >
            </el-form-item>

            <el-form-item
              label="範本名稱"
              prop="name">
              <el-input v-model="flowTemplate.name" />
            </el-form-item>
            <el-form-item
              label="範本描述"
              prop="description">
              <el-input
                v-model="flowTemplate.description"
                type="textarea"
                :rows="5" />
            </el-form-item>
            <el-form-item
              label="狀態"
              prop="status">
              <el-radio-group v-model="flowTemplate.status">
                <el-radio-button
                  label="active"
                  value="active"
                  >啟用</el-radio-button
                >
                <el-radio-button
                  label="inactive"
                  value="inactive"
                  >停用</el-radio-button
                >
                <el-radio-button
                  label="draft"
                  value="draft"
                  >草稿</el-radio-button
                >
              </el-radio-group>
            </el-form-item>

            <el-form-item label="元數據">
              <el-input
                v-model="flowTemplate.metadata"
                type="textarea"
                :rows="5" />
              <el-tag type="info"> 暫時沒使用，備著 </el-tag>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div
        v-show="isCollapsed"
        class="p-4 text-sm writing-vertical-lr text-gray-700">
        基本屬性
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  flowTemplate: {
    type: Object,
    default: () => ({}),
  },
  formRules: {
    type: Object,
    default: () => ({}),
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle-panel"]);

// 處理面板摺疊
const handleTogglePanel = () => {
  emit("toggle-panel");
};
</script>

<style scoped>
.writing-vertical-lr {
  writing-mode: vertical-lr;
  text-orientation: upright;
}
</style>
