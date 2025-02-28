<template>
  <div class="flex items-center space-x-2">
    <el-button-group>
      <el-tooltip content="清空畫布">
        <el-button
          :icon="LayoutGrid"
          @click="$emit('reset')" />
      </el-tooltip>
      <el-tooltip content="縮圖預覽">
        <el-button
          :icon="Camera"
          @click="$emit('preview-thumbnail')" />
      </el-tooltip>
      <el-tooltip content="儲存">
        <el-button
          :icon="Save"
          :type="hasUnsavedChanges ? 'warning' : 'default'"
          @click="$emit('save')" />
      </el-tooltip>
      <el-tooltip content="JSON 輸出">
        <el-button
          :icon="Code2"
          @click="$emit('show-json')" />
      </el-tooltip>
      <el-tooltip content="重新布局">
        <el-button
          :icon="Layout"
          @click="$emit('layout')" />
      </el-tooltip>
    </el-button-group>

    <el-dropdown @command="handleLayoutDirectionChange">
      <el-button>
        {{ layoutDirections[layoutDirection].label }}
        <el-icon class="el-icon--right">
          <ChevronDown />
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
      @click="$emit('publish')">
      <Send
        class="mr-1"
        :size="14" />
      發布範本
    </el-button>
  </div>
</template>

<script setup>
import {
  LayoutGrid,
  Camera,
  Save,
  Code2,
  Layout,
  ChevronDown,
  Send,
} from "lucide-vue-next";

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

const handleLayoutDirectionChange = (direction) => {
  emit("layout-direction-change", direction);
};
</script>
