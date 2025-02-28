<template>
  <div
    class="bg-white border-r border-gray-200 flex flex-col transition-all duration-300"
    :class="[isCollapsed ? 'w-12' : 'w-64']">
    <!-- 工具欄標題 -->
    <div
      class="p-2.5 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
      <h3
        v-show="!isCollapsed"
        class="text-md font-medium text-gray-900">
        節點類型
      </h3>
      <div class="flex items-center">
        <el-tooltip
          :content="isCollapsed ? '展開面板' : '收合面板'"
          placement="right">
          <div
            class="p-1 rounded hover:bg-gray-100 cursor-pointer"
            @click="handleTogglePanel">
            <component
              :is="isCollapsed ? 'PanelLeftOpen' : 'PanelLeftClose'"
              class="text-gray-500"
              :size="16" />
          </div>
        </el-tooltip>
      </div>
    </div>

    <!-- 節點類型列表 -->
    <div
      v-show="!isCollapsed"
      class="flex-1 overflow-y-auto p-4">
      <div class="space-y-4">
        <!-- 資料輸入節點 -->
        <div class="space-y-2">
          <div class="text-xs font-medium text-gray-500">資料輸入</div>
          <div
            v-for="node in inputNodes"
            :key="node.type"
            class="p-3 bg-blue-50 rounded-lg border border-blue-100 cursor-move hover:shadow-md transition-shadow"
            :class="{ 'opacity-50 cursor-not-allowed': node.disabled }"
            draggable="true"
            @dragstart="!node.disabled && handleDragStart($event, node)"
            :title="node.disabled ? '此節點已停用' : ''">
            <div class="flex items-center space-x-2">
              <component
                :is="node.icon"
                class="text-blue-500"
                :size="16" />
              <span class="text-sm text-gray-700">{{ node.label }}</span>
            </div>
          </div>
        </div>

        <!-- 資料處理節點 -->
        <div class="space-y-2">
          <div class="text-xs font-medium text-gray-500">資料處理</div>
          <div
            v-for="node in processNodes"
            :key="node.type"
            class="p-3 bg-green-50 rounded-lg border border-green-100 cursor-move hover:shadow-md transition-shadow"
            :class="{ 'opacity-50 cursor-not-allowed': node.disabled }"
            draggable="true"
            @dragstart="!node.disabled && handleDragStart($event, node)"
            :title="node.disabled ? '此節點已停用' : ''">
            <div class="flex items-center space-x-2">
              <component
                :is="node.icon"
                class="text-green-500"
                :size="16" />
              <span class="text-sm text-gray-700">{{ node.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 收合時的圖示列表 -->
    <div
      v-show="isCollapsed"
      class="flex-1 overflow-y-auto py-4">
      <div class="space-y-4">
        <!-- 資料輸入節點 -->
        <div class="space-y-2">
          <div
            v-for="node in inputNodes"
            :key="node.type"
            class="px-2">
            <el-tooltip
              :content="node.label"
              placement="right">
              <div
                class="p-2 rounded-lg cursor-move hover:bg-blue-50 transition-colors"
                :class="{ 'opacity-50 cursor-not-allowed': node.disabled }"
                draggable="true"
                @dragstart="!node.disabled && handleDragStart($event, node)">
                <component
                  :is="node.icon"
                  class="text-blue-500"
                  :size="16" />
              </div>
            </el-tooltip>
          </div>
        </div>

        <!-- 資料處理節點 -->
        <div class="space-y-2">
          <div
            v-for="node in processNodes"
            :key="node.type"
            class="px-2">
            <el-tooltip
              :content="node.label"
              placement="right">
              <div
                class="p-2 rounded-lg cursor-move hover:bg-green-50 transition-colors"
                :class="{ 'opacity-50 cursor-not-allowed': node.disabled }"
                draggable="true"
                @dragstart="!node.disabled && handleDragStart($event, node)">
                <component
                  :is="node.icon"
                  class="text-green-500"
                  :size="16" />
              </div>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  inputNodes: {
    type: Array,
    default: () => [],
  },
  processNodes: {
    type: Array,
    default: () => [],
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle-panel", "drag-start"]);

// 處理面板摺疊
const handleTogglePanel = () => {
  emit("toggle-panel");
};

// 處理節點拖拽開始
const handleDragStart = (event, node) => {
  emit("drag-start", event, node);
};
</script>
