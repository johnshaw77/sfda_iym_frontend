# SFDA IYM 前端專案

## 專案說明
SFDA IYM（良率分析平台）是一個專門用於半導體製程良率分析的系統。本專案使用 Vue 3 + Element Plus 開發，採用最新的組合式 API 和 TypeScript。

## 技術棧
- Vue 3
- Element Plus
- Vite
- Pinia
- Vue Router
- TailwindCSS
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
│   ├── api/          # API 請求
│   ├── assets/       # 靜態資源
│   ├── components/   # 公共組件
│   ├── layouts/      # 布局組件
│   ├── router/       # 路由配置
│   ├── stores/       # 狀態管理
│   ├── styles/       # 全局樣式
│   ├── utils/        # 工具函數
│   └── views/        # 頁面組件
├── public/           # 公共資源
└── vite.config.js    # Vite 配置
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

## 貢獻指南
1. Fork 本專案
2. 創建特性分支
3. 提交變更
4. 推送到分支
5. 創建 Pull Request

## 授權
本專案採用 MIT 授權條款 