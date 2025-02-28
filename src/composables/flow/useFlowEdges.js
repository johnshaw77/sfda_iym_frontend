import { ref } from "vue";

export function useFlowEdges() {
  // 設置默認的連接線選項
  const defaultEdgeOptions = {
    type: "button", // 這個會影響到節點的連接線類型
    animated: true,
    label: "",
    markerEnd: {
      type: "arrowclosed",
      color: "#3f3f3f",
    },
    updatable: true,
    deletable: true,
    style: {
      strokeWidth: 2,
      stroke: "#3f3f3f",
    },
  };

  // 註冊自定義邊線類型
  const edgeTypes = {
    button: "EdgeWithButton", // 這裡只是引用名稱，實際元件需要在使用時導入
    custom: "CustomEdge",
  };

  // 連接事件
  const onConnect = (params, elements) => {
    const newEdge = {
      id: `edge_${params.source}_${params.sourceHandle}_${params.target}_${params.targetHandle}`,
      ...params,
      type: "button",
      animated: true,
      style: {
        strokeWidth: 2,
        stroke: "#3f3f3f",
      },
      markerEnd: defaultEdgeOptions.markerEnd,
    };
    elements.value = [...elements.value, newEdge];
  };

  // 邊線點擊事件
  const onEdgeClick = (event) => {
    // 可以在這裡處理邊線點擊事件
  };

  // 邊線更新事件
  const onEdgeUpdate = (oldEdge, newConnection, elements) => {
    const newEdge = {
      ...oldEdge,
      ...newConnection,
    };
    elements.value = elements.value.map((el) =>
      el.id === oldEdge.id ? newEdge : el
    );
  };

  // 邊線更新開始事件
  const onEdgeUpdateStart = (event) => {
    // 可以在這裡處理邊線更新開始事件
  };

  // 邊線更新結束事件
  const onEdgeUpdateEnd = (event) => {
    // 可以在這裡處理邊線更新結束事件
  };

  // 邊線變化事件
  const onEdgesChange = (changes, setHasUnsavedChanges) => {
    setHasUnsavedChanges && setHasUnsavedChanges(true);
  };

  return {
    defaultEdgeOptions,
    edgeTypes,
    onConnect,
    onEdgeClick,
    onEdgeUpdate,
    onEdgeUpdateStart,
    onEdgeUpdateEnd,
    onEdgesChange,
  };
}
