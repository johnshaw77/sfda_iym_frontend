import { defineStore } from "pinia";
import { ref } from "vue";

// 工作流程實例 store (用於設置實例所屬專案名稱，並在麵包屑中顯示)
export const useFlowInstanceStore = defineStore("flowInstance", () => {
  const projectName = ref("");

  function setProjectName(name) {
    projectName.value = name;
  }

  return {
    projectName,
    setProjectName,
  };
});
