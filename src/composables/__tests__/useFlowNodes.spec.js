import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";
import { useFlowNodes } from "../flow/useFlowNodes";

// 模擬 VueFlow 實例
const mockVueFlow = {
  addNodes: vi.fn(),
  getNode: vi.fn(),
  setNodes: vi.fn(),
  getNodes: vi.fn(),
  onNodesChange: vi.fn(),
};

// 模擬 useFlowTemplate
const mockUseFlowTemplate = () => {
  return {
    flowTemplate: ref({
      id: "template-1",
      name: "測試模板",
      nodes: [],
    }),
  };
};

describe("useFlowNodes", () => {
  let nodes,
    nodeTypes,
    nodeDefinitions,
    handleNodeClick,
    handleNodeDragStart,
    handleNodeDrop,
    handleNodesChange,
    addNode,
    updateNode,
    deleteNode,
    getNodeById,
    loadNodeDefinitions;

  beforeEach(() => {
    // 重置模擬函數
    vi.clearAllMocks();

    // 初始化 useFlowNodes
    const result = useFlowNodes(mockVueFlow, mockUseFlowTemplate);

    // 解構返回值
    ({
      nodes,
      nodeTypes,
      nodeDefinitions,
      handleNodeClick,
      handleNodeDragStart,
      handleNodeDrop,
      handleNodesChange,
      addNode,
      updateNode,
      deleteNode,
      getNodeById,
      loadNodeDefinitions,
    } = result);

    // 模擬 getNodes 返回值
    mockVueFlow.getNodes.mockReturnValue([]);
  });

  describe("loadNodeDefinitions", () => {
    it("應該載入節點定義", async () => {
      // 模擬 API 響應
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([
          { id: "node-1", type: "input", name: "輸入節點" },
          { id: "node-2", type: "process", name: "處理節點" },
        ]),
      });

      await loadNodeDefinitions();

      expect(nodeDefinitions.value).toHaveLength(2);
      expect(nodeDefinitions.value[0].id).toBe("node-1");
      expect(nodeDefinitions.value[1].id).toBe("node-2");
    });

    it("應該處理 API 錯誤", async () => {
      // 模擬 API 錯誤
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      console.error = vi.fn();

      await loadNodeDefinitions();

      expect(console.error).toHaveBeenCalled();
      expect(nodeDefinitions.value).toEqual([]);
    });
  });

  describe("addNode", () => {
    it("應該添加新節點", () => {
      const newNode = {
        id: "node-1",
        type: "input",
        data: { label: "輸入節點" },
        position: { x: 100, y: 100 },
      };

      addNode(newNode);

      expect(mockVueFlow.addNodes).toHaveBeenCalledWith(newNode);
    });

    it("應該生成唯一 ID 如果未提供", () => {
      const newNode = {
        type: "input",
        data: { label: "輸入節點" },
        position: { x: 100, y: 100 },
      };

      addNode(newNode);

      // 檢查是否調用了 addNodes，並且傳入的節點有 ID
      expect(mockVueFlow.addNodes).toHaveBeenCalled();
      const calledNode = mockVueFlow.addNodes.mock.calls[0][0];
      expect(calledNode.id).toBeDefined();
      expect(calledNode.id).toMatch(/^node-\w+$/);
    });
  });

  describe("updateNode", () => {
    it("應該更新現有節點", () => {
      // 模擬現有節點
      const existingNodes = [
        { id: "node-1", type: "input", data: { label: "舊標籤" } },
        { id: "node-2", type: "process", data: { label: "處理節點" } },
      ];
      mockVueFlow.getNodes.mockReturnValue(existingNodes);

      // 更新節點
      const updatedNode = {
        id: "node-1",
        type: "input",
        data: { label: "新標籤" },
      };

      updateNode(updatedNode);

      // 檢查是否調用了 setNodes 並更新了正確的節點
      expect(mockVueFlow.setNodes).toHaveBeenCalled();
      const newNodes = mockVueFlow.setNodes.mock.calls[0][0];
      expect(newNodes).toHaveLength(2);
      expect(newNodes[0].data.label).toBe("新標籤");
      expect(newNodes[1].data.label).toBe("處理節點");
    });

    it("如果節點不存在應該不做任何操作", () => {
      // 模擬現有節點
      const existingNodes = [
        { id: "node-1", type: "input", data: { label: "輸入節點" } },
      ];
      mockVueFlow.getNodes.mockReturnValue(existingNodes);

      // 嘗試更新不存在的節點
      const updatedNode = {
        id: "node-999",
        type: "input",
        data: { label: "新標籤" },
      };

      updateNode(updatedNode);

      // 檢查是否沒有調用 setNodes
      expect(mockVueFlow.setNodes).not.toHaveBeenCalled();
    });
  });

  describe("deleteNode", () => {
    it("應該刪除節點", () => {
      // 模擬現有節點
      const existingNodes = [
        { id: "node-1", type: "input", data: { label: "輸入節點" } },
        { id: "node-2", type: "process", data: { label: "處理節點" } },
      ];
      mockVueFlow.getNodes.mockReturnValue(existingNodes);

      // 刪除節點
      deleteNode("node-1");

      // 檢查是否調用了 setNodes 並刪除了正確的節點
      expect(mockVueFlow.setNodes).toHaveBeenCalled();
      const newNodes = mockVueFlow.setNodes.mock.calls[0][0];
      expect(newNodes).toHaveLength(1);
      expect(newNodes[0].id).toBe("node-2");
    });

    it("如果節點不存在應該不做任何操作", () => {
      // 模擬現有節點
      const existingNodes = [
        { id: "node-1", type: "input", data: { label: "輸入節點" } },
      ];
      mockVueFlow.getNodes.mockReturnValue(existingNodes);

      // 嘗試刪除不存在的節點
      deleteNode("node-999");

      // 檢查是否沒有調用 setNodes
      expect(mockVueFlow.setNodes).not.toHaveBeenCalled();
    });
  });

  describe("handleNodeDrop", () => {
    it("應該在拖放位置添加新節點", () => {
      // 模擬拖放事件
      const event = {
        dataTransfer: {
          getData: vi.fn().mockReturnValue(
            JSON.stringify({
              type: "input",
              data: { label: "輸入節點" },
            })
          ),
        },
        clientX: 200,
        clientY: 200,
      };

      // 模擬 VueFlow 元素位置
      const vueFlowBounds = { left: 50, top: 50 };
      const vueFlowInstance = {
        project: vi.fn().mockReturnValue({ x: 150, y: 150 }),
        getNodes: vi.fn().mockReturnValue([]),
      };

      handleNodeDrop(event, vueFlowBounds, vueFlowInstance);

      // 檢查是否調用了 addNodes
      expect(mockVueFlow.addNodes).toHaveBeenCalled();
      const addedNode = mockVueFlow.addNodes.mock.calls[0][0];
      expect(addedNode.type).toBe("input");
      expect(addedNode.position).toEqual({ x: 150, y: 150 });
    });
  });

  describe("getNodeById", () => {
    it("應該返回指定 ID 的節點", () => {
      // 模擬節點
      const targetNode = {
        id: "node-1",
        type: "input",
        data: { label: "輸入節點" },
      };
      mockVueFlow.getNode.mockReturnValue(targetNode);

      const result = getNodeById("node-1");

      expect(mockVueFlow.getNode).toHaveBeenCalledWith("node-1");
      expect(result).toEqual(targetNode);
    });
  });
});
