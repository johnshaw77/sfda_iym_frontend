import { ref, shallowRef, onMounted } from 'vue';

export function useFlowComponents() {
  const components = ref({});
  const showPreview = ref(false);
  const currentComponent = shallowRef(null);

  // 從路徑中獲取組件名稱
  const getComponentName = (path) => {
    return path.split("/").pop().replace(".vue", "");
  };

  // 預覽組件
  const previewComponent = async (path) => {
    currentComponent.value = components.value[path]?.default;
    showPreview.value = true;
  };

  // 關閉預覽
  const closePreview = () => {
    showPreview.value = false;
    currentComponent.value = null;
  };

  // 載入組件
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
    getComponentName,
    previewComponent,
    closePreview,
    loadComponents
  };
} 