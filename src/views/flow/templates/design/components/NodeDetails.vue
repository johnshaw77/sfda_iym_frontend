<template>
  <div class="p-4 space-y-4">
    <div v-if="selectedNode">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">
          {{ selectedNode.data.label || "節點詳情" }}
        </h3>
        <el-button
          type="danger"
          size="small"
          @click="$emit('delete-node')">
          <Trash2
            class="mr-1"
            :size="14" />
          刪除節點
        </el-button>
      </div>

      <el-form
        label-position="top"
        class="space-y-4">
        <el-form-item label="節點 ID">
          <el-input
            v-model="selectedNode.id"
            disabled />
        </el-form-item>

        <el-form-item label="節點類型">
          <el-input
            v-model="selectedNode.type"
            disabled />
        </el-form-item>

        <el-form-item label="節點名稱">
          <el-input
            v-model="selectedNode.data.label"
            @change="updateNodeData" />
        </el-form-item>

        <el-form-item label="節點描述">
          <el-input
            v-model="selectedNode.data.description"
            type="textarea"
            :rows="3"
            @change="updateNodeData" />
        </el-form-item>

        <el-form-item label="節點配置">
          <el-collapse>
            <el-collapse-item
              title="配置詳情"
              name="1">
              <json-editor
                v-model="selectedNode.data.config"
                :options="jsonEditorOptions"
                @change="updateNodeData" />
            </el-collapse-item>
          </el-collapse>
        </el-form-item>
      </el-form>
    </div>
    <div
      v-else
      class="text-center py-8 text-gray-500">
      <div class="flex flex-col items-center">
        <MousePointer2 :size="32" />
        <p class="mt-2">請選擇一個節點以查看詳情</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Trash2, MousePointer2 } from "lucide-vue-next";
import JsonEditor from "vue-json-editor";

const props = defineProps({
  selectedNode: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update-node", "delete-node"]);

const jsonEditorOptions = {
  mode: "code",
  mainMenuBar: false,
  navigationBar: false,
  statusBar: false,
};

const updateNodeData = () => {
  emit("update-node");
};
</script>

<style scoped>
.node-details {
  width: 100%;
}
</style>
