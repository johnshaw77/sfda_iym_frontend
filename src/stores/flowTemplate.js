import { defineStore } from "pinia";
import { ref } from "vue";

// 工作流程範本 store (用於設置範本名稱，並在麵包屑中顯示)
export const useFlowTemplateStore = defineStore("flowTemplate", () => {
  const templateName = ref("");

  function setTemplateName(name) {
    templateName.value = name;
  }

  return {
    templateName,
    setTemplateName,
  };
});
