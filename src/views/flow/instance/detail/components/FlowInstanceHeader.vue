<template>
  <Teleport
    to="#header-actions"
    v-if="showHeaderContent">
    <el-button
      plain
      link
      type="primary"
      @click="viewFlowMode = !viewFlowMode">
      <el-segmented
        v-model="viewFlowMode"
        :options="viewModeoptions"
        block>
        <template #default="scope">
          <div class="flex align-center justify-center">
            <component
              :is="scope.item.icon"
              class="!w-3 !h-3 mr-1 pt-1" />

            {{ scope.item.label }}
          </div>
        </template>
      </el-segmented>
    </el-button>
  </Teleport>
</template>

<script setup>
import { GitBranch, List } from "lucide-vue-next";

const props = defineProps({
  showHeaderContent: {
    type: Boolean,
    default: true,
  },
  modelValue: {
    type: String,
    default: "flow",
  },
});

const emit = defineEmits(["update:modelValue"]);

const viewModeoptions = [
  { label: "流程", value: "flow", icon: GitBranch },
  { label: "列表", value: "list", icon: List },
];

const viewFlowMode = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
