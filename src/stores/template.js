import { defineStore } from "pinia";
import { ref } from "vue";

export const useTemplateStore = defineStore("template", () => {
  const templateName = ref("");

  function setTemplateName(name) {
    console.log("設置範本名稱:", name);
    templateName.value = name;
  }

  return {
    templateName,
    setTemplateName,
  };
});
