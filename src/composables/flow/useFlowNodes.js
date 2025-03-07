import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getFlowNodeDefinitions } from "@/api/modules/flow";

export function useFlowNodes() {
  // 節點類型定義
  const inputNodes = ref([]);
  const processNodes = ref([]);
  const selectedNode = ref(null);

  // 從資料庫載入節點定義
  const loadNodeDefinitions = async () => {
    try {
      const response = await getFlowNodeDefinitions();
      const definitions = response.data;

      // 將節點定義分類
      inputNodes.value = Object.values(definitions)
        .filter(
          (node) =>
            node.componentName &&
            node.componentPath &&
            node.category === "data-input"
        )
        .map((node) => ({
          componentName: node.componentName,
          label: node.name,
          icon: node.icon,
          description: node.description,
        }));

      processNodes.value = Object.values(definitions)
        .filter(
          (node) =>
            node.componentName &&
            node.componentPath &&
            ["data-process", "statistical-analysis"].includes(node.category)
        )
        .map((node) => ({
          type: node.nodeType,
          componentName: node.componentName,
          label: node.name,
          icon: node.icon,
          description: node.description,
        }));
    } catch (error) {
      console.error("載入節點定義失敗：", error);
      ElMessage.error("載入節點定義失敗");
    }
  };

  // 處理節點拖拽開始
  const handleDragStart = (event, node) => {
    event.dataTransfer.setData(
      "application/vueflow",
      JSON.stringify({
        name: node.name,
        type: node.componentName.replace(".vue", ""),
        componentName: node.componentName,
        label: node.label,
        icon: node.icon,
        description: node.description,
      })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  // 處理節點拖放
  const handleDrop = (event, project, elements, snapToGrid) => {
    event.preventDefault();

    const nodeData = JSON.parse(
      event.dataTransfer.getData("application/vueflow")
    );

    // 獲取畫布的 DOM 元素和位置資訊
    const bounds = event.target.getBoundingClientRect();
    const position = project({
      x: event.clientX - bounds.left - 90,
      y: event.clientY - bounds.top - 50,
    });

    // 如果啟用了網格對齊，將位置四捨五入到最近的網格點
    if (snapToGrid) {
      position.x = Math.round(position.x / 20) * 20;
      position.y = Math.round(position.y / 20) * 20;
    }

    // 創建新節點
    const newNode = {
      id: `node_${Date.now()}`,
      type: nodeData.componentName.replace(".vue", ""), // 使用 componentName 作為節點類型
      position,
      data: {
        name: nodeData.name, // TODO: why label ?
        label: nodeData.name,
        type: nodeData.type,
        icon: nodeData.icon,
        description: nodeData.description,
        status: "idle",
        config: getInitialConfig(nodeData.type),
      },
    };

    // 添加新節點到畫布
    elements.value = [...elements.value, newNode];
  };

  // 處理拖拽經過
  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // 處理刪除節點
  const handleDeleteNode = async (elements) => {
    if (!selectedNode.value) return;

    try {
      await ElMessageBox.confirm(
        "確定要刪除此節點嗎？此操作不可恢復。",
        "刪除確認",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
        }
      );

      elements.value = elements.value.filter(
        (el) => el.id !== selectedNode.value.id
      );
      selectedNode.value = null;
    } catch (error) {
      if (error !== "cancel") {
        ElMessage.error("刪除節點失敗");
      }
    }
  };

  // 獲取節點初始配置
  const getInitialConfig = (nodeType) => {
    // 根據節點類型返回對應的初始配置
    switch (nodeType) {
      case "custom-input":
        return {
          dataSource: "",
          validation: {
            required: true,
          },
        };
      case "custom-process":
        return {
          operations: [],
          filters: [],
          transformations: [],
        };
      case "statistic-process":
        return {
          analysisType: "",
          parameters: {},
          modelType: "",
        };
      default:
        return {};
    }
  };

  // 節點點擊事件
  const onNodeClick = (event) => {
    selectedNode.value = event.node;
  };

  // 畫布點擊事件
  const onPaneClick = () => {
    selectedNode.value = null;
  };

  // 節點拖動開始事件
  const onNodeDragStart = (event, setHasUnsavedChanges) => {
    setHasUnsavedChanges && setHasUnsavedChanges(true);
  };

  // 節點拖動結束事件
  const onNodeDragStop = (event, setHasUnsavedChanges) => {
    setHasUnsavedChanges && setHasUnsavedChanges(true);
  };

  // 節點變化事件
  const onNodesChange = (changes, setHasUnsavedChanges) => {
    setHasUnsavedChanges && setHasUnsavedChanges(true);
  };

  return {
    inputNodes,
    processNodes,
    selectedNode,
    loadNodeDefinitions,
    handleDragStart,
    handleDrop,
    handleDragOver,
    handleDeleteNode,
    getInitialConfig,
    onNodeClick,
    onPaneClick,
    onNodeDragStart,
    onNodeDragStop,
    onNodesChange,
  };
}
