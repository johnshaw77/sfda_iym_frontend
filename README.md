# SFDA (Statistical Flow-based Data Analysis) Frontend

這是一個基於 Vue 3 的統計分析工作流程設計系統前端專案。

## 專案說明
SFDA IYM（良率分析平台）是一個專門用於半導體製程良率分析的系統。本專案使用 Vue 3 + Element Plus 開發，採用最新的組合式 API 和 TypeScript。

## 技術棧
- Vue 3 (Composition API)
- Vue Router
- Pinia
- Element Plus
- TailwindCSS
- Vue Flow
- Lucide Icons

## 開發環境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

## 安裝與運行
```bash
# 安裝依賴
npm install

# 開發環境運行
npm run dev

# 生產環境打包
npm run build

# 預覽生產環境
npm run preview
```

## 專案結構
```
frontend/
├── src/
│   ├── components/          # 共用元件
│   │   └── flow-nodes/     # 工作流程節點元件
│   │       ├── base/       # 基礎節點元件
│   │       ├── business/   # 業務節點元件
│   │       └── statistical/ # 統計分析節點元件
│   ├── views/              # 頁面元件
│   ├── stores/             # 狀態管理
│   ├── utils/              # 工具函數
│   ├── api/                # API 請求
│   ├── router/             # 路由配置
│   ├── assets/             # 靜態資源
│   ├── layouts/            # 布局組件
│   └── router/             # 路由配置
├── public/                 # 公共資源
└── vite.config.js          # Vite 配置
```

## 功能特性
- 🔐 JWT 認證與授權
- 🎨 響應式設計
- 📱 移動端適配
- 🌙 主題切換
- 🔍 全局搜索
- 📊 數據可視化
- 🚀 自動部署

## 最新更新
- 優化用戶認證流程
- 改進「記住我」功能的實現
- 修復登出相關問題
- 添加路由權限控制
- 優化錯誤處理機制

## 開發規範
- 使用 ESLint 和 Prettier 進行代碼格式化
- 遵循 Vue 3 組合式 API 最佳實踐
- 組件命名採用 PascalCase
- 文件命名採用 kebab-case
- 使用 TypeScript 進行類型檢查

## 開發指南

### 安裝依賴
```bash
npm install
```

### 開發環境
```bash
npm run dev
```

### 建置專案
```bash
npm run build
```

## 節點系統架構

### 基礎節點 (BaseNode)
- 提供基本的節點外觀和功能
- 支援自定義樣式和狀態
- 整合連接點系統
- 提供豐富的插槽配置

### 連接點系統 (NodeHandles)
- 支援輸入/輸出端口配置
- 自動計算連接點位置
- 提供視覺反饋和工具提示
- 處理連接相關事件

## 待辦事項 (TODO)

### 節點系統
- [ ] 實作業務節點範例（如：客訴單號選擇器）
- [ ] 實作拖曳相關功能
- [ ] 完善節點連接邏輯
- [ ] 添加節點驗證機制

### 工作流程設計器
- [ ] 實作工作流程儲存功能
- [ ] 實作工作流程執行功能
- [ ] 添加工作流程驗證機制
- [ ] 實作工作流程範本功能

### 使用者介面
- [ ] 優化節點樣式和動畫
- [ ] 實作工具面板
- [ ] 添加鍵盤快捷鍵支援
- [ ] 實作縮放和導航功能

### 其他功能
- [ ] 實作匯出/匯入功能
- [ ] 添加操作歷史記錄
- [ ] 實作自動儲存功能
- [ ] 添加錯誤處理機制

## 貢獻指南

1. Fork 專案
2. 建立特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m '添加一些很棒的功能'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案 