<!-- IconPicker.vue -->
<template>
  <div>
    <!-- 觸發按鈕 -->
    <el-button
      @click="dialogVisible = true"
      type="primary"
      plain
      class="flex items-center gap-2"
    >
      <component
        v-if="modelValue"
        :is="icons[modelValue]"
        class="w-4 h-4 mr-2"
      />
      <span>{{ modelValue || "選擇圖示" }}</span>
    </el-button>

    <!-- 圖示選擇對話框 -->
    <el-dialog
      v-model="dialogVisible"
      title="選擇圖示"
      width="80%"
      class="max-w-4xl"
    >
      <!-- 搜尋輸入框 -->
      <el-input
        v-model="searchQuery"
        placeholder="搜尋圖示..."
        prefix-icon="Search"
        clearable
        class="mb-4"
      />

      <!-- 圖示網格 -->
      <div
        class="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[60vh] overflow-y-auto p-2"
      >
        <el-card
          v-for="iconName in filteredIcons"
          :key="iconName"
          :class="[
            'cursor-pointer hover:shadow-lg transition-shadow',
            'flex flex-col items-center justify-center !p-0',
            tempSelection === iconName
              ? 'border-dashed border-2 border-gray-500 bg-gray-300'
              : '',
          ]"
          @click="selectIcon(iconName)"
        >
          <el-tooltip :content="iconName" placement="top">
            <component :is="icons[iconName]" class="w-4 h-4" />
          </el-tooltip>
          <!-- <div class="text-xs text-center truncate w-full">
            {{ iconName }}
          </div> -->
        </el-card>
      </div>

      <!-- 操作按鈕 -->
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSelection"> 確認 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import * as LucideIcons from "lucide-vue-next";
import { ElMessage } from "element-plus";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

// 所有圖示
const icons = LucideIcons;

// 對話框可見性
const dialogVisible = ref(false);

// 搜尋關鍵字
const searchQuery = ref("");

// 暫存選擇的圖示
const tempSelection = ref(props.modelValue);

// 過濾圖示
const filteredIcons = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return Object.keys(icons).filter(
    (name) =>
      // 忽略前綴 Lucide 忽略後綴 Icon, 並且包含搜尋關鍵字
      !name.startsWith("Lucide") &&
      !name.endsWith("Icon") &&
      name.toLowerCase().includes(query)
  );
});

// 選擇圖示
const selectIcon = (iconName) => {
  tempSelection.value = iconName;
};

// 確認選擇
const confirmSelection = () => {
  emit("update:modelValue", tempSelection.value);
  dialogVisible.value = false;
  ElMessage.success("圖示已選擇");
};

// 監聽 modelValue 變化
watch(
  () => props.modelValue,
  (newValue) => {
    tempSelection.value = newValue;
  }
);
</script>
