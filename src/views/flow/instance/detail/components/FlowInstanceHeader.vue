<template>
  <Teleport
    to="#header-actions"
    v-if="showHeaderContent">
    <!-- 返回按鈕 -->
    <el-button
      plain
      type="default"
      @click="handleBack"
      class="mr-2">
      <ArrowLeft
        class="mr-1"
        :size="16" />
      返回
    </el-button>

    <el-button
      plain
      link
      type="primary">
      <el-segmented
        v-model="viewFlowMode"
        :options="viewModeoptions"
        @change="handleModeChange"
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
import { GitBranch, List, ArrowLeft } from "lucide-vue-next";
import { useTeleportVisibility } from "@/composables/useTeleportVisibility";
import { useFlowStore } from "@/stores/flowStore";
import { useRouter, useRoute } from "vue-router";
import { nextTick } from "vue";

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

const flowStore = useFlowStore();
const router = useRouter();
const route = useRoute();

const viewModeoptions = [
  { label: "流程", value: "flow", icon: GitBranch },
  { label: "列表", value: "list", icon: List },
];

const viewFlowMode = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 處理模式變化
const handleModeChange = (val) => {
  console.log("模式變化", val);
  emit("update:modelValue", val);
};

// 處理返回
const handleBack = () => {
  // 檢查是否從專案詳情頁進入
  if (flowStore.fromProject && flowStore.projectId) {
    // 返回專案詳情頁
    router.push(`/projects/${flowStore.projectId}`);
  } else {
    // 返回流程實例列表
    router.push("/flow-instances");
  }
};
</script>
