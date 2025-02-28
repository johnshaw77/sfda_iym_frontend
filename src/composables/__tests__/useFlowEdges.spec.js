import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";
import { useFlowEdges } from "../flow/useFlowEdges";

// 模擬 VueFlow 實例
const mockVueFlow = {
  addEdges: vi.fn(),
  getEdge: vi.fn(),
  setEdges: vi.fn(),
  getEdges: vi.fn(),
  onEdgesChange: vi.fn(),
  getNode: vi.fn(),
};

// 模擬 useFlowTemplate
const mockUseFlowTemplate = () => {
  return {
    flowTemplate: ref({
      id: "template-1",
      name: "測試模板",
      edges: [],
    }),
  };
};

describe("useFlowEdges", () => {
  let edges,
    defaultEdgeOptions,
    handleConnect,
    handleEdgeClick,
    handleEdgeUpdate,
    handleEdgesChange,
    addEdge,
    updateEdge,
    deleteEdge,
    getEdgeById;

  beforeEach(() => {
    // 重置模擬函數
    vi.clearAllMocks();

    // 初始化 useFlowEdges
    const result = useFlowEdges(mockVueFlow, mockUseFlowTemplate);

    // 解構返回值
    ({
      edges,
      defaultEdgeOptions,
      handleConnect,
      handleEdgeClick,
      handleEdgeUpdate,
      handleEdgesChange,
      addEdge,
      updateEdge,
      deleteEdge,
      getEdgeById,
    } = result);

    // 模擬 getEdges 返回值
    mockVueFlow.getEdges.mockReturnValue([]);
  });

  describe("defaultEdgeOptions", () => {
    it("應該有正確的默認邊緣選項", () => {
      expect(defaultEdgeOptions).toHaveProperty("type");
      expect(defaultEdgeOptions).toHaveProperty("animated");
      expect(defaultEdgeOptions).toHaveProperty("style");
    });
  });

  describe("handleConnect", () => {
    it("應該處理節點連接並添加邊緣", () => {
      // 模擬連接參數
      const connection = {
        source: "node-1",
        target: "node-2",
        sourceHandle: "output-1",
        targetHandle: "input-1",
      };

      // 模擬源節點和目標節點
      mockVueFlow.getNode.mockImplementation((id) => {
        if (id === "node-1") {
          return { id: "node-1", type: "input", data: { label: "源節點" } };
        } else if (id === "node-2") {
          return { id: "node-2", type: "process", data: { label: "目標節點" } };
        }
        return null;
      });

      handleConnect(connection);

      // 檢查是否調用了 addEdges
      expect(mockVueFlow.addEdges).toHaveBeenCalled();
      const addedEdge = mockVueFlow.addEdges.mock.calls[0][0];
      expect(addedEdge.source).toBe("node-1");
      expect(addedEdge.target).toBe("node-2");
      expect(addedEdge.id).toBeDefined();
    });

    it("如果源節點或目標節點不存在應該不添加邊緣", () => {
      // 模擬連接參數
      const connection = {
        source: "node-1",
        target: "node-999", // 不存在的節點
        sourceHandle: "output-1",
        targetHandle: "input-1",
      };

      // 模擬只有源節點存在
      mockVueFlow.getNode.mockImplementation((id) => {
        if (id === "node-1") {
          return { id: "node-1", type: "input", data: { label: "源節點" } };
        }
        return null;
      });

      handleConnect(connection);

      // 檢查是否沒有調用 addEdges
      expect(mockVueFlow.addEdges).not.toHaveBeenCalled();
    });
  });

  describe("handleEdgeClick", () => {
    it("應該處理邊緣點擊事件", () => {
      // 模擬邊緣
      const edge = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
      };

      // 模擬事件
      const event = new MouseEvent("click");

      // 創建 spy 函數
      const consoleSpy = vi.spyOn(console, "log");

      handleEdgeClick(event, edge);

      // 檢查是否記錄了邊緣點擊
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("邊緣點擊:", edge);
    });
  });

  describe("handleEdgeUpdate", () => {
    it("應該更新邊緣連接", () => {
      // 模擬舊邊緣
      const oldEdge = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        sourceHandle: "output-1",
        targetHandle: "input-1",
      };

      // 模擬新連接
      const newConnection = {
        source: "node-1",
        target: "node-3",
        sourceHandle: "output-1",
        targetHandle: "input-1",
      };

      // 模擬節點
      mockVueFlow.getNode.mockImplementation((id) => {
        const nodes = {
          "node-1": { id: "node-1", type: "input", data: { label: "源節點" } },
          "node-2": {
            id: "node-2",
            type: "process",
            data: { label: "舊目標節點" },
          },
          "node-3": {
            id: "node-3",
            type: "process",
            data: { label: "新目標節點" },
          },
        };
        return nodes[id] || null;
      });

      handleEdgeUpdate({ edge: oldEdge, connection: newConnection });

      // 檢查是否調用了 setEdges
      expect(mockVueFlow.setEdges).toHaveBeenCalled();
      const updatedEdges = mockVueFlow.setEdges.mock.calls[0][0];
      expect(typeof updatedEdges).toBe("function"); // 應該是一個函數
    });

    it("如果新連接的源節點或目標節點不存在應該不更新邊緣", () => {
      // 模擬舊邊緣
      const oldEdge = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        sourceHandle: "output-1",
        targetHandle: "input-1",
      };

      // 模擬新連接
      const newConnection = {
        source: "node-1",
        target: "node-999", // 不存在的節點
        sourceHandle: "output-1",
        targetHandle: "input-1",
      };

      // 模擬節點
      mockVueFlow.getNode.mockImplementation((id) => {
        const nodes = {
          "node-1": { id: "node-1", type: "input", data: { label: "源節點" } },
          "node-2": {
            id: "node-2",
            type: "process",
            data: { label: "目標節點" },
          },
        };
        return nodes[id] || null;
      });

      handleEdgeUpdate({ edge: oldEdge, connection: newConnection });

      // 檢查是否沒有調用 setEdges
      expect(mockVueFlow.setEdges).not.toHaveBeenCalled();
    });
  });

  describe("handleEdgesChange", () => {
    it("應該處理邊緣變更", () => {
      // 模擬邊緣變更
      const changes = [
        { id: "edge-1", type: "remove" },
        { id: "edge-2", type: "select", selected: true },
      ];

      handleEdgesChange(changes);

      // 檢查是否調用了 onEdgesChange
      expect(mockVueFlow.onEdgesChange).toHaveBeenCalledWith(changes);
    });
  });

  describe("addEdge", () => {
    it("應該添加新邊緣", () => {
      // 模擬新邊緣
      const newEdge = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        sourceHandle: "output-1",
        targetHandle: "input-1",
      };

      addEdge(newEdge);

      // 檢查是否調用了 addEdges
      expect(mockVueFlow.addEdges).toHaveBeenCalledWith(newEdge);
    });

    it("應該生成唯一 ID 如果未提供", () => {
      // 模擬新邊緣（沒有 ID）
      const newEdge = {
        source: "node-1",
        target: "node-2",
        sourceHandle: "output-1",
        targetHandle: "input-1",
      };

      addEdge(newEdge);

      // 檢查是否調用了 addEdges，並且傳入的邊緣有 ID
      expect(mockVueFlow.addEdges).toHaveBeenCalled();
      const calledEdge = mockVueFlow.addEdges.mock.calls[0][0];
      expect(calledEdge.id).toBeDefined();
      expect(calledEdge.id).toMatch(/^edge-\w+$/);
    });
  });

  describe("updateEdge", () => {
    it("應該更新現有邊緣", () => {
      // 模擬現有邊緣
      const existingEdges = [
        {
          id: "edge-1",
          source: "node-1",
          target: "node-2",
          label: "舊標籤",
        },
        {
          id: "edge-2",
          source: "node-2",
          target: "node-3",
          label: "邊緣 2",
        },
      ];
      mockVueFlow.getEdges.mockReturnValue(existingEdges);

      // 更新邊緣
      const updatedEdge = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        label: "新標籤",
      };

      updateEdge(updatedEdge);

      // 檢查是否調用了 setEdges 並更新了正確的邊緣
      expect(mockVueFlow.setEdges).toHaveBeenCalled();
      const newEdges = mockVueFlow.setEdges.mock.calls[0][0];
      expect(newEdges).toHaveLength(2);
      expect(newEdges[0].label).toBe("新標籤");
      expect(newEdges[1].label).toBe("邊緣 2");
    });

    it("如果邊緣不存在應該不做任何操作", () => {
      // 模擬現有邊緣
      const existingEdges = [
        { id: "edge-1", source: "node-1", target: "node-2" },
      ];
      mockVueFlow.getEdges.mockReturnValue(existingEdges);

      // 嘗試更新不存在的邊緣
      const updatedEdge = {
        id: "edge-999",
        source: "node-1",
        target: "node-2",
        label: "新標籤",
      };

      updateEdge(updatedEdge);

      // 檢查是否沒有調用 setEdges
      expect(mockVueFlow.setEdges).not.toHaveBeenCalled();
    });
  });

  describe("deleteEdge", () => {
    it("應該刪除邊緣", () => {
      // 模擬現有邊緣
      const existingEdges = [
        { id: "edge-1", source: "node-1", target: "node-2" },
        { id: "edge-2", source: "node-2", target: "node-3" },
      ];
      mockVueFlow.getEdges.mockReturnValue(existingEdges);

      // 刪除邊緣
      deleteEdge("edge-1");

      // 檢查是否調用了 setEdges 並刪除了正確的邊緣
      expect(mockVueFlow.setEdges).toHaveBeenCalled();
      const newEdges = mockVueFlow.setEdges.mock.calls[0][0];
      expect(newEdges).toHaveLength(1);
      expect(newEdges[0].id).toBe("edge-2");
    });

    it("如果邊緣不存在應該不做任何操作", () => {
      // 模擬現有邊緣
      const existingEdges = [
        { id: "edge-1", source: "node-1", target: "node-2" },
      ];
      mockVueFlow.getEdges.mockReturnValue(existingEdges);

      // 嘗試刪除不存在的邊緣
      deleteEdge("edge-999");

      // 檢查是否沒有調用 setEdges
      expect(mockVueFlow.setEdges).not.toHaveBeenCalled();
    });
  });

  describe("getEdgeById", () => {
    it("應該返回指定 ID 的邊緣", () => {
      // 模擬邊緣
      const targetEdge = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        label: "測試邊緣",
      };
      mockVueFlow.getEdge.mockReturnValue(targetEdge);

      const result = getEdgeById("edge-1");

      expect(mockVueFlow.getEdge).toHaveBeenCalledWith("edge-1");
      expect(result).toEqual(targetEdge);
    });
  });
});
