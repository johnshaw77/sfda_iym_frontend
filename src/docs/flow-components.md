# 流程設計元件文檔

本文檔提供了流程設計相關元件和 Composables 的使用說明。

## 目錄結構

```
frontend/src/
├── composables/
│   └── flow/
│       ├── useFlowTemplate.js - 處理流程範本相關邏輯
│       ├── useFlowLayout.js - 處理流程布局相關邏輯
│       ├── useFlowNodes.js - 處理流程節點相關邏輯
│       ├── useFlowEdges.js - 處理流程連接線相關邏輯
│       ├── useFlowCanvas.js - 處理流程畫布相關邏輯
│       └── useFileNode.js - 處理檔案節點相關邏輯
├── views/
│   └── flow/
│       ├── templates/
│       │   └── design/ - 流程範本設計相關元件
│       │       ├── index.vue - 主元件
│       │       ├── ToolPanel.vue - 左側工具面板
│       │       ├── PropertyPanel.vue - 右側屬性面板
│       │       └── FlowToolbar.vue - 頂部工具列
│       └── components/ - 流程相關元件
│           ├── FlowCanvas.vue - 流程畫布元件
│           ├── FileNode.vue - 檔案節點元件
│           ├── CustomNode.vue - 自定義節點元件
│           ├── CustomEdge.vue - 自定義連接線元件
│           └── EdgeWithButton.vue - 帶按鈕的連接線元件
```

## Composables

### useFlowTemplate

處理流程範本的相關邏輯，包括載入、儲存和發布範本。

#### 主要功能

- `loadTemplate`: 載入範本資料
- `saveTemplate`: 儲存範本資料
- `publishTemplate`: 發布範本
- `handleBeforeUnload`: 處理瀏覽器原生的離開提示
- `setupRouteGuard`: 設置路由守衛

#### 使用範例

```javascript
import { useFlowTemplate } from "@/composables/flow/useFlowTemplate";

const {
  flowTemplate,
  hasUnsavedChanges,
  formRules,
  loadTemplate,
  saveTemplate,
  publishTemplate,
} = useFlowTemplate();

// 載入範本
await loadTemplate(templateId, elements, handleFitView);

// 儲存範本
await saveTemplate(templateId, elements);

// 發布範本
await publishTemplate(templateId);
```

### useFlowLayout

處理流程布局的相關邏輯，包括自動布局和面板摺疊。

#### 主要功能

- `layoutGraph`: 自動布局函數
- `toggleLeftPanel`: 切換左側面板摺疊狀態
- `toggleRightPanel`: 切換右側面板摺疊狀態
- `loadPanelStates`: 從 localStorage 載入面板狀態

#### 使用範例

```javascript
import { useFlowLayout } from "@/composables/flow/useFlowLayout";

const {
  layoutSettings,
  layoutDirections,
  layoutGraph,
  isLeftPanelCollapsed,
  isRightPanelCollapsed,
  loadPanelStates,
  toggleLeftPanel,
  toggleRightPanel,
} = useFlowLayout();

// 自動布局
layoutGraph(nodes, setNodes, fitView, layoutSettings.value.direction);

// 切換左側面板
toggleLeftPanel(() => fitView({ padding: 0.2 }));
```

### useFlowNodes

處理流程節點的相關邏輯，包括節點定義、拖拽和事件處理。

#### 主要功能

- `loadNodeDefinitions`: 載入節點定義
- `handleDragStart`: 處理節點拖拽開始
- `handleDrop`: 處理節點拖放
- `handleDeleteNode`: 處理刪除節點
- `onNodeClick`: 節點點擊事件
- `onPaneClick`: 畫布點擊事件

#### 使用範例

```javascript
import { useFlowNodes } from "@/composables/flow/useFlowNodes";

const {
  inputNodes,
  processNodes,
  selectedNode,
  loadNodeDefinitions,
  handleDragStart,
  handleDrop,
  handleDragOver,
  handleDeleteNode,
  onNodeClick,
  onPaneClick,
} = useFlowNodes();

// 載入節點定義
await loadNodeDefinitions();

// 處理節點拖放
handleDrop(event, project, elements, snapToGrid);
```

### useFlowEdges

處理流程連接線的相關邏輯，包括連接線樣式和事件處理。

#### 主要功能

- `onConnect`: 連接事件
- `onEdgeClick`: 連接線點擊事件
- `onEdgeUpdate`: 連接線更新事件
- `onEdgesChange`: 連接線變化事件

#### 使用範例

```javascript
import { useFlowEdges } from "@/composables/flow/useFlowEdges";

const {
  defaultEdgeOptions,
  edgeTypes,
  onConnect,
  onEdgeClick,
  onEdgeUpdate,
  onEdgeUpdateStart,
  onEdgeUpdateEnd,
  onEdgesChange,
} = useFlowEdges();

// 處理連接事件
onConnect(params, elements);
```

### useFlowCanvas

處理流程畫布的相關邏輯，包括畫布狀態、歷史記錄和事件處理。

#### 主要功能

- `saveToHistory`: 保存歷史記錄
- `handleUndo`: 撤銷操作
- `handleRedo`: 重做操作
- `onAddNode`: 添加節點
- `autoLayout`: 自動布局
- `handleFitView`: 適應工作區大小

#### 使用範例

```javascript
import { useFlowCanvas } from "@/composables/flow/useFlowCanvas";

const {
  elements,
  snapToGrid,
  isDragOver,
  showJsonDrawer,
  flowCanvasRef,
  isFullscreen,
  saveToHistory,
  handleUndo,
  handleRedo,
  onAddNode,
  autoLayout,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFitView,
} = useFlowCanvas();

// 添加節點
onAddNode(nodeType);

// 自動布局
autoLayout();

// 撤銷操作
handleUndo();
```

### useFileNode

處理檔案節點的相關邏輯，包括檔案預覽、下載和刪除。

#### 主要功能

- `handlePreview`: 處理檔案預覽
- `handleDownload`: 處理檔案下載
- `handleDelete`: 處理檔案刪除
- `getFileIcon`: 獲取檔案圖示
- `formatFileSize`: 格式化檔案大小

#### 使用範例

```javascript
import { useFileNode } from "@/composables/flow/useFileNode";

const {
  previewVisible,
  zoomLevel,
  isImage,
  isPdf,
  isPreviewable,
  getFileIcon,
  getIconColorClass,
  formatFileSize,
  handlePreview,
  handleDownload,
  handleDelete,
} = useFileNode();

// 處理檔案預覽
handlePreview(fileData);

// 處理檔案下載
handleDownload(fileData);
```

## 元件

### FlowTemplateDesign (index.vue)

流程範本設計的主元件，整合了工具面板、屬性面板和畫布。

#### 主要功能

- 整合左側工具面板、右側屬性面板和中間畫布
- 處理範本載入、儲存和發布
- 處理節點拖拽和連接

#### 使用範例

```html
<router-view
  path="/flow-templates/:id/design"
  component="FlowTemplateDesign" />
```

### ToolPanel

左側工具面板，顯示可用的節點類型。

#### 主要功能

- 顯示輸入節點和處理節點
- 支援節點拖拽
- 支援面板摺疊

#### 使用範例

```html
<ToolPanel
  :input-nodes="inputNodes"
  :process-nodes="processNodes"
  :is-collapsed="isLeftPanelCollapsed"
  @toggle-panel="handleLeftPanelToggle"
  @drag-start="handleDragStart" />
```

### PropertyPanel

右側屬性面板，顯示和編輯範本屬性。

#### 主要功能

- 顯示和編輯範本屬性
- 支援面板摺疊

#### 使用範例

```html
<PropertyPanel
  :flow-template="flowTemplate"
  :form-rules="formRules"
  :is-collapsed="isRightPanelCollapsed"
  @toggle-panel="handleRightPanelToggle" />
```

### FlowToolbar

頂部工具列，提供各種操作按鈕。

#### 主要功能

- 提供清空畫布、預覽縮圖、儲存、顯示 JSON、重新布局等按鈕
- 提供布局方向選擇
- 提供發布範本按鈕

#### 使用範例

```html
<FlowToolbar
  :layout-direction="layoutSettings.direction"
  :layout-directions="layoutDirections"
  :has-unsaved-changes="hasUnsavedChanges"
  @reset="handleReset"
  @preview-thumbnail="handlePreviewThumbnail"
  @save="handleSave"
  @show-json="handleShowJson"
  @layout="handleLayout"
  @layout-direction-change="handleLayoutDirectionChange"
  @publish="handlePublish" />
```

### FlowCanvas

流程畫布元件，提供節點拖拽、連接和編輯功能。

#### 主要功能

- 提供節點拖拽、連接和編輯功能
- 支援撤銷/重做操作
- 支援自動布局
- 支援顯示 JSON 數據

#### 使用範例

```html
<FlowCanvas
  :node-types="nodeTypes"
  :edge-types="edgeTypes"
  :default-edge-options="defaultEdgeOptions"
  v-model:elements="elements"
  @node-click="handleNodeClick"
  @edge-click="handleEdgeClick"
  @connect="handleConnect" />
```

### FileNode

檔案節點元件，顯示檔案資訊和提供預覽、下載等功能。

#### 主要功能

- 顯示檔案資訊（名稱、大小、類型）
- 提供檔案預覽功能
- 提供檔案下載功能
- 提供檔案刪除功能

#### 使用範例

```html
<FileNode
  :id="node.id"
  :data="node.data"
  :selected="node.selected"
  @click="handleNodeClick"
  @delete="handleNodeDelete" />
```

## 性能優化

### 使用 v-memo 減少不必要的重渲染

```html
<div v-memo="[node.id, node.selected]">
  <!-- 節點內容 -->
</div>
```

### 使用 defineAsyncComponent 延遲加載不常用元件

```javascript
import { defineAsyncComponent } from "vue";

const FilePreview = defineAsyncComponent(() =>
  import("@/components/FilePreview.vue")
);
```

### 使用虛擬滾動處理大量數據

```html
<el-virtual-list
  :items="largeDataList"
  :item-size="50"
  class="h-[500px]">
  <template #default="{ item }">
    <div class="p-2">{{ item.name }}</div>
  </template>
</el-virtual-list>
```

## 命名規範

- 元件名稱：使用 PascalCase（如 `FileNode.vue`）
- Composable 名稱：使用 camelCase 並以 `use` 開頭（如 `useFlowNodes.js`）
- 事件處理函數：使用 `handle` 開頭（如 `handleNodeClick`）
- 事件監聽函數：使用 `on` 開頭（如 `onNodeClick`）
- 布林值變數：使用 `is` 或 `has` 開頭（如 `isCollapsed`、`hasUnsavedChanges`）
