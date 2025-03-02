<template>
  <el-dialog
    v-model="dialogVisible"
    title="節點預覽"
    width="1200px"
    top="5vh"
    :fullscreen="false"
    :draggable="true"
    destroy-on-close
    :close-on-click-modal="false">
    <div
      class="w-full h-[800px] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
      <VueFlow
        v-if="dialogVisible"
        :modelValue="nodes"
        @update:modelValue="handleNodesUpdate"
        :default-viewport="{ x: 0, y: 0, zoom: 1 }"
        :min-zoom="1"
        :max-zoom="1"
        :pannable="false"
        :zoomable="false"
        :selectable="false"
        :deletable="false"
        :draggable="false"
        :node-types="{
          custom: currentComponent,
        }"
        class="w-full h-full flex items-center justify-center"
        :fit-view="true"
        :center="true"
        :auto-connect="false"
        :snap-to-grid="true"
        :snap-grid="[20, 20]">
        <Background :gap="20" />
      </VueFlow>
    </div>
  </el-dialog>
</template>

<script setup>
import { VueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  nodes: {
    type: Array,
    default: () => [],
  },
  currentComponent: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

// 對話框可見性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// 處理節點更新
const handleNodesUpdate = (newNodes) => {
  console.log("節點更新:", newNodes);
  // 這裡只是預覽，不需要更新 props.nodes
};
</script>

<style scoped>
.vue-flow {
  background-color: #f5f5f5;
}
</style>
