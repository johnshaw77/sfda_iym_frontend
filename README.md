# SFDA IYM 良率分析平台

這是一個專門用於半導體製造業的良率分析平台，提供直觀的數據分析和可視化工具，幫助工程師和管理者更好地理解和改善製造流程。

## 技術棧

### 前端技術
- Vue 3 (Composition API)
- Element Plus UI 框架
- Vue Router 路由管理
- Vite 構建工具
- Tailwind CSS 樣式框架
- Vue-Flow 工作流畫布
- ECharts.js 數據可視化
- Axios HTTP 客戶端

### 後端技術
- Node.js + Express
  - 用戶管理
  - 文件管理
  - 工作流配置管理
- Python + FastAPI
  - 數據分析
  - 統計建模
  - API服務

### 數據庫
- SQLite（開發階段）
- MySQL（生產環境）

## 功能特點

- 📊 **專案管理**
  - 多專案支援
  - 專案狀態追蹤
  - 團隊協作功能

- 🔄 **工作流程**
  - 自定義工作流程
  - 流程模板管理
  - 即時狀態監控

- 📁 **文件管理**
  - 檔案上傳與管理
  - 版本控制
  - 權限管理

- 📈 **數據分析**
  - 良率趨勢分析
  - 製程參數分析
  - 數據可視化

## 快速開始

### 環境要求
- Node.js >= 16
- npm >= 8

### 安裝步驟

1. 克隆專案
```bash
git clone [repository-url]
cd frontend
```

2. 安裝依賴
```bash
npm install
```

3. 啟動開發服務器
```bash
npm run dev
```

4. 建置生產版本
```bash
npm run build
```

## 專案結構

```
frontend/
├── src/
│   ├── api/            # API 請求
│   ├── assets/         # 靜態資源
│   ├── components/     # 共用元件
│   ├── layouts/        # 佈局元件
│   ├── router/         # 路由配置
│   ├── store/          # 狀態管理
│   ├── styles/         # 全局樣式
│   ├── utils/          # 工具函數
│   └── views/          # 頁面元件
├── public/             # 公共資源
├── .env               # 環境變數
└── vite.config.js     # Vite 配置
```

## 核心功能

### 不良率分析
- 整體不良率展示（總數據、趨勢圖）
- 多維度不良率拆解分析（製程、檢驗站等）
- 豐富的統計圖表展示（柱狀圖、折線圖、餅圖等）

### 工作流管理
- 可視化工作流畫布
- 支持多種節點類型：
  - 數據輸入節點
  - 分析節點
  - 附件節點
  - 結果節點
- 節點屬性自定義
- 支持節點間的拖放與連接
- 支持撤銷/重做功能（Ctrl+Z / Ctrl+Shift+Z）
- 支持工作區自適應（自動縮放以適應畫布）
- 支持便利貼功能（可自定義顏色和大小）

### 數據分析
- 數據清洗與預處理
- 多維度統計分析
- 不良原因關聯性分析
- 支持決策樹、相關性矩陣等分析方法

### 文件管理
- 支持拖放上傳
- 文件預覽功能
- 與節點綁定機制

### 結果導出
- 支持圖表/表格導出（圖片、PDF）
- 工作流配置導出（JSON格式）

## 已完成功能

1. 用戶認證系統
   - [x] 登入功能
   - [x] 記住我（7天）
   - [ ] 忘記密碼
   - [ ] 註冊功能

2. 工作流畫布
   - [x] 節點拖放與連接
   - [x] 自定義節點類型
   - [x] 節點屬性編輯
   - [x] 撤銷/重做功能
   - [x] 工作區自適應
   - [x] 便利貼功能
   - [x] 自動布局
   - [x] JSON 數據導出
   - [x] 可折疊的浮動配置面板

3. 檔案管理
   - [x] 拖放上傳
   - [x] 檔案預覽（圖片、PDF、文字、Excel、PPT）
   - [x] 檔案下載
   - [x] 檔案類型驗證
   - [x] 上傳進度顯示
   - [x] 檔案大小限制
   - [x] 檔案操作按鈕優化

4. 介面優化
   - [x] 響應式布局
   - [x] 暗色主題支持
   - [x] 動畫效果
   - [x] 操作提示
   - [x] 智能面板收合
   - [x] 檔案節點視覺優化

## 開發規範

- 使用 ESLint 進行程式碼檢查
- 使用 Prettier 進行程式碼格式化
- 遵循 Vue 3 組合式 API 風格指南
- 使用 TypeScript 進行型別檢查

## 瀏覽器支援

- Chrome (推薦)
- Firefox
- Safari
- Edge

## 版本資訊

- 當前版本：1.1.0
- 最後更新：2024-03-21
- 更新內容：
  1. 新增用戶認證系統
  2. 優化登入介面
  3. 添加記住我功能
  4. 改進錯誤處理機制

## 開發團隊

- 系統管理員：王小明
- 資深工程師：陳美玲
- 品質主管：林志偉
- 數據分析師：張雅婷
- 製程工程師：黃建志

## 聯絡資訊

如有任何問題或建議，請聯繫系統管理員：
- Email: ming.wang@example.com