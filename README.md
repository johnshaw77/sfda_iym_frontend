# SFDA IYM 前端專案

## 專案簡介

SFDA IYM（良率分析系統）是一個基於 Vue 3 + Element Plus 開發的現代化網頁應用。

## 技術棧

- Vue 3 (Composition API)
- Element Plus UI 框架
- Vite 構建工具
- Vue Router 路由管理
- Tailwind CSS 樣式框架
- Axios HTTP 客戶端

## 功能特點

- [x] 現代化的用戶界面設計
- [x] 響應式佈局
- [x] 用戶認證系統
  - [x] 登入功能
  - [x] 記住我（7天）
  - [ ] 忘記密碼
  - [ ] 註冊功能
- [x] 路由權限控制
- [x] 全局狀態管理
- [x] API 請求封装
- [x] 錯誤處理機制

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

## 開發規範

- 使用 ESLint 進行程式碼檢查
- 使用 Prettier 進行程式碼格式化
- 遵循 Vue 3 組合式 API 風格指南
- 使用 TypeScript 進行型別檢查

## 版本資訊

- 當前版本：1.0.0
- 最後更新：2024-03-21