import { ref, shallowRef, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 工作流程組件 (主要使用於節點定義管理，使其能動態載入所有節點的組件)
export function useFlowComponents() {
  const components = ref({});
  const showPreview = ref(false);
  const currentComponent = shallowRef(null);
  const previewNodeData = ref(null);
  const nodes = ref([]);

  // 從路徑中獲取組件名稱
  const getComponentName = (path) => {
    return path.split("/").pop().replace(".vue", "");
  };

  // 動態載入組件
  const loadComponent = async (componentPath, componentName) => {
    try {
      // 確保組件名稱包含 .vue 副檔名
      const fullComponentName = componentName.endsWith('.vue') 
        ? componentName 
        : `${componentName}.vue`;

      // 構建完整的組件路徑
      const fullPath = `/src/components/flow-nodes/${componentPath}/${fullComponentName}`;

      // 動態載入組件
      const module = await import(/* @vite-ignore */ fullPath);
      return module.default;
    } catch (error) {
      console.error('載入組件失敗：', error);
      throw new Error(`載入組件失敗：${error.message}`);
    }
  };

  // 預覽組件
  const previewComponent = async ({ componentPath, componentName, nodeData }) => {
    try {
      if (!componentPath || !componentName) {
        throw new Error('組件路徑或名稱未提供');
      }

      // 載入組件
      currentComponent.value = await loadComponent(componentPath, componentName);
      
      // 設置預覽節點數據
      const newNode = {
        id: 'preview-node',
        type: 'custom',
        position: { x: 0, y: 0 },
        draggable: false,
        selectable: false,
        data: {
          ...nodeData,
          title: nodeData.name,
          description: nodeData.description,
          type: nodeData.nodeType,
        },
      };

      // 更新節點數據
      nodes.value = [newNode];
      previewNodeData.value = newNode;

      showPreview.value = true;
    } catch (error) {
      ElMessageBox.alert(
        `<div class="text-red-500 font-bold text-lg mb-2">❌ 載入組件失敗</div>
         <div class="text-gray-700">請檢查：</div>
         <ul class="list-disc pl-4 mt-2 space-y-1 text-gray-600">
           <li>組件路徑是否正確</li>
           <li>檔案名稱是否有錯字</li>
           <li>對應的 Vue 檔案是否存在</li>
         </ul>`,
        '錯誤提示',
        {
          confirmButtonText: '我知道了',
          dangerouslyUseHTMLString: true,
          customClass: {
            container: 'error-alert-container',
          },
          width: '360px',
        }
      );
      throw error;
    }
  };

  // 關閉預覽
  const closePreview = () => {
    showPreview.value = false;
    currentComponent.value = null;
    previewNodeData.value = null;
    nodes.value = [];
  };

  // 載入所有組件
  const loadComponents = async () => {
    const modules = import.meta.glob("@/components/flow-nodes/**/*.vue", { eager: true });
    components.value = modules;
  };

  // 在組件掛載時載入
  onMounted(() => {
    loadComponents();
  });

  return {
    components,
    showPreview,
    currentComponent,
    previewNodeData,
    nodes,
    getComponentName,
    loadComponent,
    previewComponent,
    closePreview,
    loadComponents
  };
} 