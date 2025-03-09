/**
 * 日誌級別枚舉
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// 當前日誌級別，可以通過環境變數控制
const currentLogLevel =
  process.env.NODE_ENV === "production" ? LogLevel.WARN : LogLevel.DEBUG;

/**
 * 統一的日誌工具
 */
export const logger = {
  /**
   * 輸出調試級別日誌
   * @param {string} component - 組件名稱
   * @param {string} message - 日誌訊息
   * @param {...any} args - 其他參數
   */
  debug(component, message, ...args) {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.log(`[DEBUG][${component}] ${message}`, ...args);
    }
  },

  /**
   * 輸出信息級別日誌
   * @param {string} component - 組件名稱
   * @param {string} message - 日誌訊息
   * @param {...any} args - 其他參數
   */
  info(component, message, ...args) {
    if (currentLogLevel <= LogLevel.INFO) {
      console.log(`[INFO][${component}] ${message}`, ...args);
    }
  },

  /**
   * 輸出警告級別日誌
   * @param {string} component - 組件名稱
   * @param {string} message - 日誌訊息
   * @param {...any} args - 其他參數
   */
  warn(component, message, ...args) {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(`[WARN][${component}] ${message}`, ...args);
    }
  },

  /**
   * 輸出錯誤級別日誌
   * @param {string} component - 組件名稱
   * @param {string} message - 日誌訊息
   * @param {...any} args - 其他參數
   */
  error(component, message, ...args) {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(`[ERROR][${component}] ${message}`, ...args);
    }
  },
};
