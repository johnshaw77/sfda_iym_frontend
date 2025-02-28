import { ref } from "vue";

export function useFlowLayout() {
  // 布局設置
  const layoutSettings = ref({
    direction: "LR",
    spacing: 100,
    nodeWidth: 180,
    nodeHeight: 100,
  });

  // 布局方向選項
  const layoutDirections = {
    LR: { label: "從左到右", x: 1, y: 0 },
    RL: { label: "從右到左", x: -1, y: 0 },
    TB: { label: "從上到下", x: 0, y: 1 },
    BT: { label: "從下到上", x: 0, y: -1 },
    RADIAL: { label: "放射狀", x: 0, y: 0 },
  };

  // 自動布局函數
  const layoutGraph = (nodes, setNodes, fitView, direction = "LR") => {
    if (!nodes.value || nodes.value.length === 0) return;

    const { spacing, nodeWidth, nodeHeight } = layoutSettings.value;

    if (direction === "RADIAL") {
      // 放射狀布局
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const radius = Math.min(window.innerWidth, window.innerHeight) / 3;
      const angleStep = (2 * Math.PI) / nodes.value.length;

      nodes.value.forEach((node, index) => {
        const angle = index * angleStep;
        node.position = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      });
    } else {
      // 線性布局（左右/上下）
      const isHorizontal = direction === "LR" || direction === "RL";
      const isReverse = direction === "RL" || direction === "BT";

      // 設置起始位置
      const startPos = 100;

      // 計算總高度/寬度
      const totalNodes = nodes.value.length;
      const crossAxisTotal =
        totalNodes * (isHorizontal ? nodeHeight : nodeWidth);
      const crossAxisSpacing = (totalNodes - 1) * spacing;

      // 計算起始位置（置中）
      const crossAxisStart =
        (isHorizontal ? window.innerHeight : window.innerWidth) / 2 -
        (crossAxisTotal + crossAxisSpacing) / 2;

      // 直接對所有節點進行布局
      nodes.value.forEach((node, index) => {
        const crossAxisPos =
          crossAxisStart +
          index * (isHorizontal ? nodeHeight + spacing : nodeWidth + spacing);
        const mainAxisPos = startPos + index * spacing;

        let x, y;
        if (isHorizontal) {
          x = isReverse
            ? window.innerWidth - mainAxisPos - nodeWidth
            : mainAxisPos;
          y = crossAxisPos;
        } else {
          x = crossAxisPos;
          y = isReverse
            ? window.innerHeight - mainAxisPos - nodeHeight
            : mainAxisPos;
        }

        node.position = { x, y };
      });
    }

    // 更新節點位置
    setNodes([...nodes.value]);

    // 只有當有多個節點時才執行 fitView
    if (nodes.value.length > 1) {
      setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 400);
    }
  };

  // 面板摺疊狀態
  const isLeftPanelCollapsed = ref(false);
  const isRightPanelCollapsed = ref(false);

  // 從 localStorage 讀取面板狀態
  const loadPanelStates = () => {
    try {
      const leftPanelState = localStorage.getItem(
        "flowTemplateDesign_leftPanel"
      );
      const rightPanelState = localStorage.getItem(
        "flowTemplateDesign_rightPanel"
      );

      if (leftPanelState !== null) {
        isLeftPanelCollapsed.value = JSON.parse(leftPanelState);
      }

      if (rightPanelState !== null) {
        isRightPanelCollapsed.value = JSON.parse(rightPanelState);
      }
    } catch (error) {
      console.error("讀取面板狀態失敗:", error);
    }
  };

  // 保存面板狀態到 localStorage
  const savePanelState = (panelType, isCollapsed) => {
    try {
      localStorage.setItem(
        `flowTemplateDesign_${panelType}`,
        JSON.stringify(isCollapsed)
      );
    } catch (error) {
      console.error(`保存${panelType}面板狀態失敗:`, error);
    }
  };

  // 處理左側面板摺疊
  const toggleLeftPanel = (fitView) => {
    isLeftPanelCollapsed.value = !isLeftPanelCollapsed.value;
    savePanelState("leftPanel", isLeftPanelCollapsed.value);
    fitView && setTimeout(fitView, 300);
  };

  // 處理右側面板摺疊
  const toggleRightPanel = (fitView) => {
    isRightPanelCollapsed.value = !isRightPanelCollapsed.value;
    savePanelState("rightPanel", isRightPanelCollapsed.value);
    fitView && setTimeout(fitView, 300);
  };

  return {
    layoutSettings,
    layoutDirections,
    layoutGraph,
    isLeftPanelCollapsed,
    isRightPanelCollapsed,
    loadPanelStates,
    toggleLeftPanel,
    toggleRightPanel,
  };
}
