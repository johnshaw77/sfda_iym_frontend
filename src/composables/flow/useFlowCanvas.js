import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useVueFlow } from "@vue-flow/core";
import { useFullscreen } from "@vueuse/core";
import { ElMessage, ElMessageBox } from "element-plus";

export function useFlowCanvas() {
  // 畫布狀態
  const elements = ref([]);
  const snapToGrid = ref(true);
  const isDragOver = ref(false);
  const showJsonDrawer = ref(false);
  const flowCanvasRef = ref(null);
  const history = reactive({
    past: [],
    future: [],
    current: null,
  });

  // 全螢幕控制
  const { isFullscreen, toggle: toggleFullscreen } =
    useFullscreen(flowCanvasRef);

  // 快捷鍵相關
  const ctrlOrCmd = navigator.platform.includes("Mac") ? "⌘" : "Ctrl+";
  const shiftSymbol = navigator.platform.includes("Mac") ? "⇧" : "Shift+";

  // 節點類型定義
  const NODE_TYPES = {
    FILE: {
      type: "file",
      label: "檔案節點",
      icon: "File",
    },
    PROCESS: {
      type: "process",
      label: "處理節點",
      icon: "Settings",
    },
    DECISION: {
      type: "decision",
      label: "決策節點",
      icon: "GitBranch",
    },
    API: {
      type: "api",
      label: "API節點",
      icon: "Globe",
    },
    DATABASE: {
      type: "database",
      label: "資料庫節點",
      icon: "Database",
    },
  };

  // 使用 Vue Flow 的 API
  const {
    project,
    fitView,
    nodes,
    edges,
    setNodes,
    setEdges,
    addNodes,
    addEdges,
    removeNodes,
    removeEdges,
    updateNode,
    updateEdge,
    findNode,
    findEdge,
    getIncomers,
    getOutgoers,
    getConnectedEdges,
    viewportRef,
  } = useVueFlow({
    defaultEdgeOptions: {
      type: "default",
      animated: true,
      style: {
        strokeWidth: 2,
        stroke: "#3f3f3f",
      },
    },
  });

  // 歷史記錄處理
  const saveToHistory = () => {
    // 深拷貝當前狀態
    const currentState = JSON.stringify(elements.value);

    // 如果當前狀態與歷史記錄中的最後一個狀態不同，則保存
    if (history.current !== currentState) {
      // 添加到歷史記錄
      history.past.push(history.current);

      // 限制歷史記錄長度，避免佔用過多記憶體
      if (history.past.length > 50) {
        history.past.shift();
      }

      // 更新當前狀態
      history.current = currentState;

      // 清空未來記錄
      history.future = [];
    }
  };

  // 撤銷操作
  const handleUndo = () => {
    if (history.past.length === 0) {
      ElMessage.info("沒有可撤銷的操作");
      return;
    }

    // 保存當前狀態到未來記錄
    history.future.push(history.current);

    // 從歷史記錄中取出上一個狀態
    const previousState = history.past.pop();
    history.current = previousState;

    // 更新畫布
    elements.value = JSON.parse(previousState);
  };

  // 重做操作
  const handleRedo = () => {
    if (history.future.length === 0) {
      ElMessage.info("沒有可重做的操作");
      return;
    }

    // 保存當前狀態到歷史記錄
    history.past.push(history.current);

    // 從未來記錄中取出下一個狀態
    const nextState = history.future.pop();
    history.current = nextState;

    // 更新畫布
    elements.value = JSON.parse(nextState);
  };

  // 添加節點
  const onAddNode = (nodeType) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: nodeType.type,
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
      },
      data: {
        label: `${nodeType.label} ${nodes.value.length + 1}`,
        type: nodeType.type,
      },
    };

    addNodes([newNode]);
    saveToHistory();
  };

  // 自動布局
  const autoLayout = () => {
    if (nodes.value.length === 0) return;

    // 簡單的自動布局實現
    const spacing = 150;
    const startX = 100;
    const startY = 100;

    nodes.value.forEach((node, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;

      node.position = {
        x: startX + col * spacing,
        y: startY + row * spacing,
      };
    });

    setNodes([...nodes.value]);
    setTimeout(() => fitView({ padding: 0.2 }), 100);
    saveToHistory();
  };

  // 處理拖拽事件
  const handleDragOver = (event) => {
    event.preventDefault();
    isDragOver.value = true;
    event.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = () => {
    isDragOver.value = false;
  };

  // 檔案類型限制
  const ALLOWED_FILE_TYPES = {
    "image/*": "圖片檔案",
    "application/pdf": "PDF 檔案",
    "text/plain": "文字檔案",
    "text/csv": "CSV 檔案",
    "application/json": "JSON 檔案",
    // Excel 相關
    "application/vnd.ms-excel": "Excel 檔案",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "Excel 檔案",
    "application/excel": "Excel 檔案",
    "application/x-excel": "Excel 檔案",
    "application/x-msexcel": "Excel 檔案",
    // PPT 相關
    "application/vnd.ms-powerpoint": "PPT 檔案",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "PPT 檔案",
    "application/powerpoint": "PPT 檔案",
    "application/mspowerpoint": "PPT 檔案",
    "application/x-mspowerpoint": "PPT 檔案",
    "application/ppt": "PPT 檔案",
    //word 相關
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word 檔案",
    "application/word": "Word 檔案",
    "application/x-word": "Word 檔案",
    "application/vnd.ms-word": "Word 檔案",
  };

  const isFileTypeAllowed = (file) => {
    return Object.keys(ALLOWED_FILE_TYPES).some((type) => {
      if (type.endsWith("*")) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
  };

  // 檔案拖放處理
  const handleDrop = async (event, uploadDocument) => {
    isDragOver.value = false;
    const files = Array.from(event.dataTransfer.files);

    // 檢查檔案類型
    const invalidFiles = files.filter((file) => !isFileTypeAllowed(file));
    if (invalidFiles.length > 0) {
      ElMessage.error(
        `不支援的檔案類型：${invalidFiles.map((f) => f.name).join(", ")}`
      );
      return;
    }

    // 獲取滑鼠在畫布上的位置
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    // 處理每個檔案
    for (const file of files) {
      try {
        // 創建檔案節點（先顯示上傳進度）
        const nodeId = `file-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const newNode = {
          id: nodeId,
          type: "file",
          position,
          data: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadProgress: 0,
          },
        };

        // 添加節點
        addNodes([newNode]);

        // 模擬上傳進度
        const updateProgress = (progress) => {
          const node = nodes.value.find((n) => n.id === nodeId);
          if (node) {
            node.data = { ...node.data, uploadProgress: progress };
          }
        };

        // 模擬分段上傳進度
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          updateProgress(progress);
        }

        // 上傳檔案
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", "current-project-id"); // 這裡應該從 props 或其他地方獲取
        formData.append("instanceId", "current-instance-id"); // 這裡應該從 props 或其他地方獲取
        formData.append("docType", file.type);

        // 上傳檔案
        const result = await uploadDocument(formData);

        // 更新節點資訊
        const node = nodes.value.find((n) => n.id === nodeId);
        if (node) {
          node.data = {
            ...node.data,
            fileId: result.data.id,
            fileUrl: result.data.url,
            fileName: result.data.name,
            uploadProgress: 100,
          };

          // 確保節點被添加到 elements 陣列中
          if (!elements.value.some((el) => el.id === nodeId)) {
            elements.value = [...elements.value, node];
          }

          // 將更新後的節點保存到流程實例中
          try {
            // 使用共用的更新函數
            saveToHistory();
            ElMessage.success(`檔案 ${file.name} 上傳並保存到流程實例成功`);
          } catch (updateError) {
            console.error("保存流程實例失敗", updateError);
            ElMessage.warning(
              `檔案已上傳，但保存到流程實例失敗：${
                updateError.message || "未知錯誤"
              }`
            );
          }
        }
      } catch (error) {
        console.error("上傳檔案失敗", error);
        ElMessage.warning(`檔案 ${file.name} 上傳失敗`);
        // 移除失敗的節點
        const node = nodes.value.find((n) => n.data.fileName === file.name);
        if (node) {
          removeNodes([node]);
        }
      }
    }
  };

  // 處理適應工作區大小
  const handleFitView = () => {
    fitView({ padding: 0.2 });
  };

  // 節點事件處理
  const onNodeClick = (event) => {
    // 可以在這裡處理節點點擊事件
  };

  const onPaneClick = () => {
    // 可以在這裡處理畫布點擊事件
  };

  const onNodeDragStart = (event) => {
    // 可以在這裡處理節點拖動開始事件
  };

  const onNodeDragStop = (event) => {
    saveToHistory();
  };

  // 連接線事件處理
  const onConnect = (params) => {
    const newEdge = {
      id: `edge_${params.source}_${params.sourceHandle}_${params.target}_${params.targetHandle}`,
      ...params,
      type: "default",
      animated: true,
      style: {
        strokeWidth: 2,
        stroke: "#3f3f3f",
      },
    };

    addEdges([newEdge]);
    saveToHistory();
  };

  const onEdgeClick = (event) => {
    // 可以在這裡處理邊線點擊事件
  };

  const onEdgeUpdate = (oldEdge, newConnection) => {
    removeEdges([oldEdge.id]);

    const newEdge = {
      ...oldEdge,
      ...newConnection,
    };

    addEdges([newEdge]);
    saveToHistory();
  };

  const onEdgeUpdateStart = (event) => {
    // 可以在這裡處理邊線更新開始事件
  };

  const onEdgeUpdateEnd = (event) => {
    // 可以在這裡處理邊線更新結束事件
  };

  // 變化事件處理
  const onNodesChange = (changes) => {
    // 檢查是否有節點被刪除
    const hasNodeRemoval = changes.some((change) => change.type === "remove");

    if (hasNodeRemoval) {
      saveToHistory();
    }
  };

  const onEdgesChange = (changes) => {
    // 檢查是否有邊線被刪除
    const hasEdgeRemoval = changes.some((change) => change.type === "remove");

    if (hasEdgeRemoval) {
      saveToHistory();
    }
  };

  // 初始化歷史記錄
  const initHistory = () => {
    history.current = JSON.stringify(elements.value);
    history.past = [];
    history.future = [];
  };

  // 鍵盤快捷鍵處理
  const setupKeyboardShortcuts = () => {
    const handleKeyDown = (event) => {
      // Ctrl+Z 或 Command+Z: 撤銷
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        event.key === "z"
      ) {
        event.preventDefault();
        handleUndo();
      }

      // Ctrl+Shift+Z 或 Command+Shift+Z: 重做
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "z"
      ) {
        event.preventDefault();
        handleRedo();
      }

      // F11 或 Ctrl+Shift+F 或 Command+Shift+F: 全螢幕
      if (
        event.key === "F11" ||
        ((event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          event.key === "f")
      ) {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  };

  // 生命週期鉤子
  onMounted(() => {
    initHistory();
    const cleanupKeyboardShortcuts = setupKeyboardShortcuts();

    onUnmounted(() => {
      cleanupKeyboardShortcuts();
    });
  });

  return {
    // 狀態
    elements,
    snapToGrid,
    isDragOver,
    showJsonDrawer,
    flowCanvasRef,
    isFullscreen,
    ctrlOrCmd,
    shiftSymbol,
    NODE_TYPES,

    // Vue Flow API
    project,
    fitView,
    nodes,
    edges,
    setNodes,
    setEdges,
    addNodes,
    addEdges,
    removeNodes,
    removeEdges,
    updateNode,
    updateEdge,
    findNode,
    findEdge,
    getIncomers,
    getOutgoers,
    getConnectedEdges,

    // 方法
    saveToHistory,
    handleUndo,
    handleRedo,
    onAddNode,
    autoLayout,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFitView,
    onNodeClick,
    onPaneClick,
    onNodeDragStart,
    onNodeDragStop,
    onConnect,
    onEdgeClick,
    onEdgeUpdate,
    onEdgeUpdateStart,
    onEdgeUpdateEnd,
    onNodesChange,
    onEdgesChange,
    toggleFullscreen,
    isFileTypeAllowed,
    ALLOWED_FILE_TYPES,
  };
}
