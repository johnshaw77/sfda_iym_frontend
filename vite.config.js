import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import fs from 'fs';
import path from "path";

// 創建 JSON 伺服器(用於測試)
function createJsonServer() {
  return {
    name: 'json-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url.endsWith('.json')) {
          // 支援延遲響應（模擬網絡延遲）
          const delay = req.url.includes('delay=') 
            ? parseInt(req.url.split('delay=')[1]) 
            : 0

          try {
            // 移除 URL 參數
            const cleanUrl = req.url.split('?')[0]
            const jsonPath = path.join(__dirname, 'public', cleanUrl)
            const jsonContent = fs.readFileSync(jsonPath, 'utf-8')

            // 支援 CORS
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            res.setHeader('Content-Type', 'application/json')

            // 添加延遲
            if (delay) {
              await new Promise(resolve => setTimeout(resolve, delay))
            }

            res.end(jsonContent)
            return
          } catch (error) {
            console.error('JSON 檔案處理錯誤:', error)
            res.statusCode = 404
            res.end(JSON.stringify({ 
              error: 'File not found',
              path: req.url 
            }))
            return
          }
        }
        next()
      })
    }
  }
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), createJsonServer()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ["pdfjs-dist"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["pdfjs-dist"],
  },
});
