<template>
  <div
    :class="[
      'custom-node',
      `node-type-${data.type}`,
      { 'is-selected': selected },
    ]"
  >
    <div class="custom-node-header">
      <font-awesome-icon :icon="nodeIcon" class="mr-2" />
      {{ data.label }}
    </div>
    <div class="custom-node-content" v-if="data.content">
      {{ data.content }}
    </div>
    <div class="custom-node-ports">
      <Handle
        v-if="!isOutput"
        type="source"
        position="bottom"
        class="custom-handle"
      />
      <Handle
        v-if="!isInput"
        type="target"
        position="top"
        class="custom-handle"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Handle } from "@vue-flow/core";
import {
  faFileUpload,
  faGears,
  faChartLine,
  faTable,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const nodeTypes = {
  input: {
    icon: faFileUpload,
    color: "blue",
  },
  process: {
    icon: faGears,
    color: "green",
  },
  analysis: {
    icon: faChartLine,
    color: "purple",
  },
  visualization: {
    icon: faTable,
    color: "orange",
  },
  output: {
    icon: faClipboardCheck,
    color: "red",
  },
};

const nodeIcon = computed(() => {
  return nodeTypes[props.data.type]?.icon || faGears;
});

const isInput = computed(() => props.data.type === "input");
const isOutput = computed(() => props.data.type === "output");
</script>

<style scoped>
.custom-node {
  @apply bg-white rounded-lg shadow-md p-4 min-w-[200px] border-l-4 transition-all duration-200;
}

.custom-node.is-selected {
  @apply shadow-lg ring-2 ring-blue-500 ring-opacity-50;
}

.node-type-input {
  @apply border-l-blue-500;
}

.node-type-process {
  @apply border-l-green-500;
}

.node-type-analysis {
  @apply border-l-purple-500;
}

.node-type-visualization {
  @apply border-l-orange-500;
}

.node-type-output {
  @apply border-l-red-500;
}

.custom-node-header {
  @apply text-lg font-semibold mb-2 flex items-center;
}

.custom-node-content {
  @apply text-sm text-gray-600 mt-2;
}

.custom-handle {
  @apply w-3 h-3 bg-gray-400 rounded-full border-2 border-white;
}

.custom-handle:hover {
  @apply bg-blue-500;
}
</style>
