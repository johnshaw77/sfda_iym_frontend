<template>
  <BaseEdge
    :id="id"
    :source-node="sourceNode"
    :target-node="targetNode"
    :source-handle="sourceHandle"
    :target-handle="targetHandle"
    :marker-end="markerEnd"
    :style="style"
    :animated="animated"
    :label="label"
    :updatable="updatable"
    :interactionWidth="interactionWidth"
    :selected="selected"
    :path-options="pathOptions"
    :data="data"
    :path="path"
    :context="context"
    :events="events"
    :class="['vue-flow__edge-button', { selected }]">
    <template #default>
      <path
        :d="path"
        class="vue-flow__edge-path"
        :style="style" />
      <text
        v-if="label"
        :x="labelX"
        :y="labelY"
        text-anchor="middle"
        dominant-baseline="middle"
        class="vue-flow__edge-text">
        {{ label }}
      </text>
      <g
        v-if="selected"
        :transform="`translate(${centerX}, ${centerY})`">
        <circle
          class="vue-flow__edge-button-circle"
          r="10"
          stroke="#1a192b"
          fill="white"
          @click="onEdgeClick" />
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="vue-flow__edge-button-icon">
          <path
            stroke="none"
            d="M0 0h24v24H0z"
            fill="none" />
          <path d="M4 7h16" />
          <path d="M10 11l0 6" />
          <path d="M14 11l0 6" />
          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
          <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
        </svg>
      </g>
    </template>
  </BaseEdge>
</template>

<script setup>
import { computed } from "vue";
import { BaseEdge, useVueFlow } from "@vue-flow/core";

const props = defineProps({
  id: { type: String, required: true },
  sourceNode: { type: Object, required: true },
  targetNode: { type: Object, required: true },
  sourceHandle: { type: String, default: null },
  targetHandle: { type: String, default: null },
  markerEnd: { type: [String, Object], default: null },
  style: { type: Object, default: () => ({}) },
  animated: { type: Boolean, default: false },
  label: { type: [String, Number], default: null },
  updatable: { type: Boolean, default: false },
  interactionWidth: { type: Number, default: 20 },
  selected: { type: Boolean, default: false },
  pathOptions: { type: Object, default: () => ({}) },
  data: { type: Object, default: () => ({}) },
  path: { type: String, required: true },
  context: { type: Object, required: true },
  events: { type: Object, required: true },
});

const { removeEdges } = useVueFlow();

// 計算邊線中心點
const centerX = computed(() => {
  const pathLength = props.path.length;
  const center = Math.floor(pathLength / 2);
  const match = props.path.match(/[0-9]+(\.[0-9]+)? [0-9]+(\.[0-9]+)?/g);

  if (match && match.length > 1) {
    const [x1, y1] = match[0].split(" ").map(Number);
    const [x2, y2] = match[match.length - 1].split(" ").map(Number);
    return (x1 + x2) / 2;
  }

  return 0;
});

const centerY = computed(() => {
  const pathLength = props.path.length;
  const center = Math.floor(pathLength / 2);
  const match = props.path.match(/[0-9]+(\.[0-9]+)? [0-9]+(\.[0-9]+)?/g);

  if (match && match.length > 1) {
    const [x1, y1] = match[0].split(" ").map(Number);
    const [x2, y2] = match[match.length - 1].split(" ").map(Number);
    return (y1 + y2) / 2;
  }

  return 0;
});

// 計算標籤位置
const labelX = computed(() => centerX.value);
const labelY = computed(() => centerY.value - 10);

// 處理邊線點擊
const onEdgeClick = (event) => {
  event.stopPropagation();
  removeEdges([props.id]);
};
</script>

<style>
.vue-flow__edge-button {
  cursor: pointer;
}

.vue-flow__edge-button-circle {
  cursor: pointer;
  stroke-width: 1.5;
  transition: all 0.2s ease;
}

.vue-flow__edge-button-icon {
  transform: translate(-10px, -10px);
  color: #1a192b;
  pointer-events: none;
}

.vue-flow__edge-button:hover .vue-flow__edge-button-circle {
  stroke: #ff0072;
  fill: #f8f8f8;
}
</style>
