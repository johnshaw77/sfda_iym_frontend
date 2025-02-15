<template>
  <div
    :class="[
      'min-w-[180px] bg-white rounded-lg border shadow-md transition-shadow hover:shadow-lg relative',
      selected ? 'ring-0 ring-blue-500' : '',
      data.disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]"
    :style="{ width: '100%', height: '100%' }"
  >
    <NodeResizer
      :minWidth="180"
      :minHeight="100"
      :isVisible="selected"
      class="!border-blue-400"
      :lineStyle="{ borderWidth: '1px' }"
      :handleStyle="{
        width: '16px',
        height: '16px',
        border: '2px solid white',
        transition: 'all 0.2s ease',
        zIndex: '1',
      }"
    />
    <!-- 頂部標題欄 -->
    <div
      :class="[
        'px-4 py-2 rounded-t-lg border-b flex items-center space-x-2',
        headerClasses[data.type] || '',
      ]"
    >
      <component
        :is="data.icon"
        :class="iconClasses[data.type] || ''"
        :size="18"
      />
      <span class="font-medium text-sm">{{ data.label }}</span>
    </div>

    <!-- 內容區域 -->
    <div class="p-3 space-y-2">
      <!-- 這裡可以添加節點的配置項 -->
      <div class="text-xs text-gray-500">
        {{ data.description }}
        狀態：{{ getStatusText(data.status) }}
      </div>
    </div>

    <!-- 連接點 -->
    <!-- 頂部連接點 (target) -->
    <Handle
      type="target"
      position="top"
      :class="['!absolute', 'target-handle', handleClasses[data.type] || '']"
      :style="{
        left: 'calc(50% - 6px)',
        top: '-6px',
      }"
    />
    <!-- 底部連接點 (source) -->
    <Handle
      type="source"
      position="bottom"
      :class="['!absolute', 'source-handle', handleClasses[data.type] || '']"
      data-handlepos="bottom"
    />
    <!-- 左側連接點 (target) -->
    <Handle
      type="target"
      position="left"
      id="left-target"
      :class="['!absolute', 'target-handle', handleClasses[data.type] || '']"
      :style="{
        left: '-6px',
        top: 'calc(50% - 6px)',
      }"
    />
    <!-- 右側連接點 (source) -->
    <Handle
      type="source"
      position="right"
      id="right-source"
      :class="['!absolute', 'source-handle', handleClasses[data.type] || '']"
      data-handlepos="right"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Handle } from "@vue-flow/core";
import { NodeResizer } from "@vue-flow/node-resizer";
import "@vue-flow/node-resizer/dist/style.css";
import {
  FileInput,
  Database,
  Filter,
  Calculator,
  BarChart,
  FileOutput,
  Table,
} from "lucide-vue-next";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

// 頂部標題欄樣式
const headerClasses = {
  dataInput: "bg-blue-50 border-blue-100",
  dataProcess: "bg-green-50 border-green-100",
  dataOutput: "bg-purple-50 border-purple-100",
  apiRequest: "bg-orange-50 border-orange-100",
};

// 圖標顏色
const iconClasses = {
  dataInput: "text-blue-600",
  dataProcess: "text-green-600",
  dataOutput: "text-purple-600",
  apiRequest: "text-orange-600",
};

// 連接點樣式
const handleClasses = {
  dataInput: "!bg-blue-500 hover:!bg-blue-600",
  dataProcess: "!bg-green-500 hover:!bg-green-600",
  dataOutput: "!bg-purple-500 hover:!bg-purple-600",
  apiRequest: "!bg-orange-500 hover:!bg-orange-600",
};

// 獲取狀態文字
const getStatusText = (status) => {
  const statusMap = {
    idle: "待執行",
    running: "執行中",
    completed: "已完成",
    error: "錯誤",
  };
  return statusMap[status] || status;
};

// 處理節點點擊
const handleNodeClick = () => {
  // 觸發節點選中事件
  // 這裡可以通過 emit 事件或其他方式通知父組件
};
</script>

<style scoped>
/* 連接點基本樣式 */
:deep(.vue-flow__handle) {
  width: 12px;
  height: 12px;
  border: 2px solid white;
  transition: all 0.2s ease;
  z-index: 1;
}

/* Source 連接點樣式（箭頭形狀） */
:deep(.source-handle) {
  background-color: #0eba44 !important;
  border-radius: 2px !important;
  border: none !important;
  cursor: crosshair;
  transition: all 0.2s ease;
}

/* 右側箭頭 */
:deep(.source-handle[data-handlepos="right"]) {
  transform: rotate(0deg);
  right: -4px !important;
  top: calc(50% - 6px);
  clip-path: polygon(0 0, 100% 50%, 0 100%);
}

:deep(.source-handle[data-handlepos="right"]:hover) {
  transform: scale(1.2) translateX(5px) !important;
  background-color: #f05e1c !important;
  z-index: 10;
}

/* 底部箭頭 */
:deep(.source-handle[data-handlepos="bottom"]) {
  transform: rotate(0deg);
  bottom: -4px !important;
  left: calc(50% - 6px);
  clip-path: polygon(50% 100%, 0 0, 100% 0);
}

:deep(.source-handle[data-handlepos="bottom"]:hover) {
  transform: scale(1.2) translatey(5px) !important;
  background-color: #f05e1c !important;
  z-index: 10;
}

/* Target 連接點樣式（圓形） */
:deep(.target-handle) {
  background-color: #3b82f6 !important;
  border-radius: 50% !important;
  cursor: crosshair;
  transition: all 0.2s ease;
}

/* 為連接線添加箭頭 */
:deep(.vue-flow__edge-path) {
  stroke-width: 2;
  marker-end: url(#vue-flow__arrowhead);
}

/* 定義箭頭樣式 */
:deep(.vue-flow__edge) {
  path {
    stroke: #b1b1b7;
  }
  &.selected {
    path {
      stroke: #1976d2;
    }
  }
  &:hover {
    path {
      stroke: #1976d2;
    }
  }
}

/* 添加箭頭定義 */
:deep(#vue-flow__arrowhead) {
  fill: #b1b1b7;
}

:deep(.vue-flow__edge.selected #vue-flow__arrowhead),
:deep(.vue-flow__edge:hover #vue-flow__arrowhead) {
  fill: #1976d2;
}
</style>
