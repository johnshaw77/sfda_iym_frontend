import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getFlowTemplateById,
  updateFlowTemplate,
  publishFlowTemplate,
} from "@/api/modules/flow";
import { useFlowTemplateStore } from "@/stores/flowTemplate";

export function useFlowTemplate() {
  const route = useRoute();
  const router = useRouter();
  const flowTemplateStore = useFlowTemplateStore();

  // 範本資料
  const flowTemplate = ref(null);
  const hasUnsavedChanges = ref(false);

  // 表單規則
  const formRules = {
    name: [{ required: true, message: "請輸入範本名稱" }],
    description: [{ required: true, message: "請輸入範本描述" }],
  };

  // 載入範本資料
  const loadTemplate = async (templateId, elements, handleFitView) => {
    try {
      const response = await getFlowTemplateById(templateId);
      flowTemplate.value = response.data;

      if (response.data) {
        // 使用 Pinia store 設置範本名稱
        flowTemplateStore.setTemplateName(flowTemplate.value.name);

        try {
          const nodes = flowTemplate.value.nodes;
          const edges = flowTemplate.value.edges;

          elements.value = [...nodes, ...edges];

          handleFitView && handleFitView();
          setTimeout(() => {
            hasUnsavedChanges.value = false;
          }, 400);
        } catch (e) {
          console.error("解析範本配置失敗:", e);
          elements.value = [];
        }
      }
    } catch (error) {
      console.error("載入範本失敗:", error);
      ElMessage.error("載入範本失敗");
    }
  };

  // 儲存範本
  const saveTemplate = async (templateId, elements) => {
    try {
      // 從 elements 中的，取出 nodes (沒有屬性 sourceHandle 的)
      const nodes = elements.value.filter((el) => !el.sourceHandle);
      const edges = elements.value.filter((el) => el.sourceHandle);

      await updateFlowTemplate(templateId, {
        ...flowTemplate.value,
        config: JSON.stringify({ elements: elements.value }),
        nodes: nodes,
        edges: edges,
      });

      hasUnsavedChanges.value = false;
      ElMessage.success("儲存成功");
    } catch (error) {
      console.error("儲存失敗:", error);
      ElMessage.error("儲存失敗");
    }
  };

  // 發布範本
  const publishTemplate = async (templateId) => {
    try {
      await ElMessageBox.confirm(
        "確定要發布此範本嗎？發布後將不能修改。",
        "發布確認",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "info",
        }
      );

      await publishFlowTemplate(templateId);
      ElMessage.success("範本發布成功");
      router.push("/workflow-templates");
    } catch (error) {
      if (error !== "cancel") {
        console.error("發布範本失敗:", error);
        ElMessage.error("發布範本失敗");
      }
    }
  };

  // 處理瀏覽器原生的離開提示（用於重新整理和關閉頁面）
  const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges.value) {
      const message = "您有未保存的更改，確定要離開嗎？";
      e.returnValue = message;
      return message;
    }
  };

  // 處理路由變化的提示（使用 Element Plus 對話框）
  const setupRouteGuard = (router) => {
    const routeGuard = async (to, from, next) => {
      if (hasUnsavedChanges.value) {
        try {
          await ElMessageBox.confirm(
            "您有未保存的更改，確定要離開嗎？",
            "離開確認",
            {
              confirmButtonText: "確定離開",
              cancelButtonText: "取消",
              type: "warning",
            }
          );
          hasUnsavedChanges.value = false; // 重置未保存狀態
          next();
        } catch (error) {
          next(false);
        }
      } else {
        next();
      }
    };

    router.beforeEach(routeGuard);
    return () => router.beforeEach((to, from, next) => next()); // 返回清理函數
  };

  return {
    flowTemplate,
    hasUnsavedChanges,
    formRules,
    loadTemplate,
    saveTemplate,
    publishTemplate,
    handleBeforeUnload,
    setupRouteGuard,
  };
}
