# SFDA IYM 前端專案

## 專案簡介

SFDA IYM（Improve Your Manufacturing）是一個專注於製造業良率提升的工作流程管理系統。本專案使用 Vue 3 + Vite 開發，採用最新的前端技術棧，提供現代化的使用者介面和流暢的操作體驗。

## 技術棧

- **核心框架：** Vue 3 + Vite
- **UI 框架：** Element Plus
- **工作流程引擎：** Vue Flow
- **樣式框架：** Tailwind CSS
- **圖標：** Lucide Icons
- **HTTP 客戶端：** Axios
- **路由：** Vue Router
- **進度條：** NProgress

## 功能特點

- 📊 工作流程範本設計
- 🔄 工作流程執行管理
- 📁 專案管理
- 📂 文件管理
- 📈 數據分析
- ⚙️ 系統設置

## 開始使用

### 環境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安裝依賴

```bash
npm install
```

### 開發環境運行

```bash
npm run dev
```

### 生產環境構建

```bash
npm run build
```

### 預覽生產構建

```bash
npm run preview
```

## 專案結構

```
frontend/
├── src/                    # 源代碼目錄
│   ├── api/               # API 請求封裝
│   ├── assets/            # 靜態資源
│   ├── components/        # 公共組件
│   ├── layouts/           # 頁面布局
│   ├── router/            # 路由配置
│   ├── styles/            # 全局樣式
│   ├── utils/             # 工具函數
│   └── views/             # 頁面組件
├── public/                # 公共資源
├── .env                   # 環境變數
├── index.html             # HTML 模板
├── package.json           # 項目配置
├── vite.config.js         # Vite 配置
└── tailwind.config.js     # Tailwind 配置
```

## 主要功能模組

### 工作流程範本設計

- 支援拖拽式節點配置
- 多種節點類型：
  - 資料輸入節點
  - 資料處理節點
  - API 呼叫節點
  - 資料輸出節點
- 節點連線管理
- 範本版本控制

### 專案管理

- 專案創建與配置
- 專案狀態追蹤
- 工作流程實例管理
- 專案數據統計

### 文件管理

- 支援多種文件格式
- 文件預覽
- 文件版本控制
- 文件分類管理

### 系統設置

- 用戶管理
- 權限配置
- 系統參數設置
- 日誌查看

## 開發規範

### 代碼風格

- 使用 ESLint 進行代碼檢查
- 使用 Prettier 進行代碼格式化
- 遵循 Vue 3 組合式 API 風格指南

### 命名規範

- 組件名稱：PascalCase
- 文件名稱：kebab-case
- 變量命名：camelCase
- CSS 類名：kebab-case

### Git 提交規範

提交信息格式：
```
<type>(<scope>): <subject>

<body>

<footer>
```

類型（type）：
- feat: 新功能
- fix: 修復
- docs: 文檔
- style: 格式
- refactor: 重構
- test: 測試
- chore: 構建過程或輔助工具的變動

## 部署說明

1. 構建專案
```bash
npm run build
```

2. 部署 `dist` 目錄內容到 Web 伺服器

3. 配置伺服器
- 啟用 HTTPS
- 配置跨域請求
- 設置適當的快取策略

## 環境變數配置

在 `.env` 文件中配置以下環境變數：

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_TITLE=SFDA IYM
VITE_APP_DESCRIPTION=Improve Your Manufacturing
```

## 常見問題

1. **Q: 如何處理跨域問題？**
   A: 在開發環境中，通過 Vite 的 proxy 配置處理；在生產環境中，需要後端配置 CORS。

2. **Q: 如何添加新的節點類型？**
   A: 在 `nodeTypes.js` 中定義新的節點類型，並在 `CustomNode.vue` 中添加對應的渲染邏輯。

## 更新日誌

### v1.1.0 (2024-02-13)
- 新增 API 呼叫節點類型
- 優化節點樣式配置
- 改進工作流程範本管理
- 修復已知問題

### v1.0.0 (2024-02-01)
- 初始版本發布
- 基礎功能實現

## 聯繫方式

- 技術支援：support@example.com
- 問題回報：issues@example.com

## 授權說明

本專案為私有軟體，未經授權不得使用、複製或分發。 