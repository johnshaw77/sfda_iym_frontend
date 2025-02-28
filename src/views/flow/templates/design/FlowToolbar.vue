<template>
  <div class="flex items-center space-x-2">
    <el-button-group>
      <el-tooltip content="清空畫布">
        <el-button
          :icon="icons.LayoutGrid"
          @click="handleReset" />
      </el-tooltip>
      <el-tooltip content="縮圖預覽">
        <el-button
          :icon="icons.Camera"
          @click="handlePreviewThumbnail" />
      </el-tooltip>
      <el-tooltip content="儲存">
        <el-button
          :icon="icons.Save"
          :type="hasUnsavedChanges ? 'warning' : 'default'"
          @click="handleSave" />
      </el-tooltip>
      <el-tooltip content="JSON 輸出">
        <el-button
          :icon="icons.Code2"
          @click="handleShowJson" />
      </el-tooltip>
      <el-tooltip content="重新布局">
        <el-button
          :icon="icons.Layout"
          @click="handleLayout" />
      </el-tooltip>
    </el-button-group>

    <el-dropdown @command="handleLayoutDirectionChange">
      <el-button>
        {{ layoutDirections[layoutDirection].label }}
        <el-icon class="el-icon--right">
          <icons.ChevronDown />
        </el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="(direction, key) in layoutDirections"
            :key="key"
            :command="key">
            {{ direction.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-button
      type="primary"
      @click="handlePublish">
      <Send
        class="mr-1"
        :size="14" />
      發布範本
    </el-button>
  </div>
</template>

<script setup>
import { Send } from "@element-plus/icons-vue";
import { useIcons } from "@/composables/useIcons";

const { icons } = useIcons();

const props = defineProps({
  layoutDirection: {
    type: String,
    default: "LR",
  },
  layoutDirections: {
    type: Object,
    required: true,
  },
  hasUnsavedChanges: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "reset",
  "preview-thumbnail",
  "save",
  "show-json",
  "layout",
  "layout-direction-change",
  "publish",
]);

// 處理重置畫布
const handleReset = () => {
  emit("reset");
};

// 處理縮圖預覽
const handlePreviewThumbnail = () => {
  emit("preview-thumbnail");
};

// 處理儲存
const handleSave = () => {
  emit("save");
};

// 處理 JSON 顯示
const handleShowJson = () => {
  emit("show-json");
};

// 處理重新布局
const handleLayout = () => {
  emit("layout");
};

// 處理布局方向變更
const handleLayoutDirectionChange = (direction) => {
  emit("layout-direction-change", direction);
};

// 處理發布範本
const handlePublish = () => {
  emit("publish");
};
</script>
