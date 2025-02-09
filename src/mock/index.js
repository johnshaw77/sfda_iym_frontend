import Mock from "mockjs";

// 設置全局延遲
Mock.setup({
  timeout: "300-600", // 模擬請求延遲
});

// 導入所有 mock 模組
const modules = import.meta.glob("./modules/*.js", { eager: true });

// 設置是否啟用 mock
const enableMock = import.meta.env.VITE_ENABLE_MOCK === "true";

export function setupMock() {
  if (!enableMock) {
    console.log("Mock 服務未啟用");
    return;
  }

  // 攔截 XMLHttpRequest
  Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send;
  Mock.XHR.prototype.send = function () {
    if (this.custom.xhr) {
      this.custom.xhr.withCredentials = this.withCredentials || false;
    }
    this.proxy_send(...arguments);
  };

  // 清除現有的 mock 配置
  Mock.mock.restore();

  // 加載所有 mock 模組
  Object.values(modules).forEach((module) => {
    if (module.default) {
      module.default();
    }
  });

  console.log("Mock 服務已啟用");
}
