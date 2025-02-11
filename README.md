# SFDA IYM 前端專案

## 專案概述

SFDA IYM 是一個現代化的良率分析系統，提供直觀的用戶界面和強大的分析功能。本專案採用 Vue 3 生態系統開發，具有高度的可擴展性和維護性。

## 技術棧

- **核心框架：** Vue 3 + Vite
- **UI 框架：** Element Plus
- **狀態管理：** Vue Router
- **HTTP 客戶端：** Axios
- **樣式解決方案：** Tailwind CSS
- **圖標：** Element Plus Icons + Lucide Icons
- **開發語言：** JavaScript/TypeScript

## 主要功能

1. **用戶認證系統**
   - 登入/登出功能
   - 記住我功能（支持7天自動登入）
   - JWT Token 認證
   - 權限控制

2. **用戶個人化**
   - 頭像上傳（支援拖拉上傳）
   - 個人資料管理
   - 主題設定
   - 通知偏好設定

3. **專案管理**
   - 專案列表
   - 專案詳情
   - 專案分析
   - 數據可視化

4. **檔案管理**
   - 檔案上傳（支援拖拉上傳）
   - 檔案預覽
   - 檔案下載
   - 檔案刪除

5. **工作流程**
   - 流程設計
   - 流程執行
   - 狀態追蹤

## 專案結構

```
src/
├── api/            # API 請求模組
├── assets/         # 靜態資源
├── components/     # 共用元件
├── layouts/        # 頁面布局
├── router/         # 路由配置
├── views/          # 頁面組件
├── mock/           # 模擬數據
├── App.vue         # 根組件
└── main.js         # 入口文件
```

## 開始使用

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **開發環境運行**
   ```bash
   npm run dev
   ```

3. **生產環境構建**
   ```bash
   npm run build
   ```

## 環境變數配置

在 `.env` 文件中配置以下環境變數：

```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_USE_MOCK=false
VITE_APP_TITLE=SFDA IYM
```

## 開發規範

1. **命名規範**
   - 組件名稱使用 PascalCase
   - 文件名使用 kebab-case
   - 變量和函數使用 camelCase

2. **代碼風格**
   - 使用 ESLint 進行代碼檢查
   - 使用 Prettier 進行代碼格式化
   - 遵循 Vue 3 組合式 API 風格指南

3. **提交規範**
   - feat: 新功能
   - fix: 修復問題
   - docs: 文檔變更
   - style: 代碼格式
   - refactor: 代碼重構
   - test: 測試相關
   - chore: 其他更改

## 版本資訊

- 當前版本：1.2.0
- 最後更新：2024-03-21
- 更新內容：
  1. 優化頭像上傳功能
     - 新增拖拉上傳支援
     - 優化上傳介面設計
     - 改進檔案處理邏輯
  2. 改進用戶體驗
     - 優化表單驗證
     - 添加載入動畫
     - 完善錯誤提示
  3. 更新依賴版本
  4. 修復已知問題

## 待辦事項

- [ ] 實現忘記密碼功能
- [ ] 添加用戶個人資料頁面
- [ ] 優化檔案上傳體驗
- [ ] 添加數據導出功能
- [ ] 實現即時通知系統

## 貢獻指南

1. Fork 本專案
2. 創建特性分支
3. 提交您的更改
4. 推送到您的分支
5. 創建 Pull Request

## 聯絡方式

如有任何問題或建議，請聯繫：
- Email: john_hsiao@example.com
- GitHub Issues 