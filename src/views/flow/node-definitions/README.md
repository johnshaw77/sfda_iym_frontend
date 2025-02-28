# 節點定義管理模組

## 模組目的

本模組用於管理流程節點定義，包括創建、編輯、刪除和預覽節點定義。節點定義是流程設計的基礎，定義了節點的外觀、行為和配置選項。

## 目錄結構

```
frontend/src/views/flow/node-definitions/
├── README.md                       # 本文檔
├── index.vue                       # 主視圖組件
└── components/                     # 子組件目錄
    ├── NodeDefinitionTable.vue     # 節點定義表格組件
    ├── NodeDefinitionEditDialog.vue # 節點定義編輯對話框組件
    └── NodeDefinitionPreviewDialog.vue # 節點定義預覽對話框組件
```

## 組件說明

### index.vue

主視圖組件，負責整體佈局和狀態管理，包括：

- 載入節點定義列表
- 處理創建、編輯、刪除操作
- 協調子組件之間的交互

### NodeDefinitionTable.vue

節點定義表格組件，負責顯示節點定義列表，包括：

- 顯示節點定義的基本信息（名稱、分類、描述等）
- 提供編輯、刪除、預覽操作按鈕
- 支持排序和過濾

### NodeDefinitionEditDialog.vue

節點定義編輯對話框組件，負責創建和編輯節點定義，包括：

- 表單驗證
- 組件路徑和名稱選擇
- 圖示選擇
- 預覽功能

### NodeDefinitionPreviewDialog.vue

節點定義預覽對話框組件，負責預覽節點定義的外觀和行為，包括：

- 使用 VueFlow 顯示節點
- 支持節點的拖拽和交互

## 使用方法

```vue
<template>
  <div>
    <!-- 使用節點定義管理模組 -->
    <NodeDefinitionList />
  </div>
</template>

<script setup>
import NodeDefinitionList from "@/views/flow/node-definitions/index.vue";
</script>
```

## 重構說明

本模組是從 `FlowNodeDefinitionList.vue` 重構而來，主要改進包括：

1. **組件拆分**：將大型組件拆分為多個小型、可重用的組件
2. **使用 Composition API**：充分利用 Vue 3 的 Composition API 進行狀態管理
3. **提高代碼組織性**：更清晰的代碼結構和命名
4. **遵循最佳實踐**：符合 Vue 3 和 Element Plus 的最佳實踐
5. **提高可讀性和可維護性**：更好的註釋和文檔

## 未來改進

1. **增強搜索和過濾功能**：添加更多的搜索和過濾選項
2. **優化預覽功能**：提供更多的預覽選項和交互方式
3. **批量操作**：支持批量創建、編輯和刪除節點定義
4. **表單驗證增強**：更嚴格的表單驗證和錯誤提示
5. **添加單元測試**：確保代碼質量和穩定性
