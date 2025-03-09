/**
 * 事件總線系統
 * 用於組件間通信，替代全局事件
 */
import { ref, inject, provide } from "vue";
import { logger } from "@/utils/logger";

// 事件總線的 Symbol key
export const EventBusSymbol = Symbol("eventBus");

// 創建事件總線
export function createEventBus() {
  // 事件監聽器映射表
  const listeners = ref(new Map());

  /**
   * 註冊事件監聽器
   * @param {string} event - 事件名稱
   * @param {Function} callback - 回調函數
   * @param {Object} options - 選項
   * @param {string} options.source - 事件來源（用於調試）
   * @returns {Function} - 用於移除監聽器的函數
   */
  const on = (event, callback, options = {}) => {
    if (!listeners.value.has(event)) {
      listeners.value.set(event, []);
    }

    const eventListeners = listeners.value.get(event);
    const listenerInfo = {
      callback,
      source: options.source || "unknown",
      timestamp: new Date().toISOString(),
    };

    eventListeners.push(listenerInfo);

    logger.debug(
      "EventBus",
      `已註冊事件 "${event}" 的監聽器，來源: ${listenerInfo.source}`
    );

    // 返回移除監聽器的函數
    return () => {
      const index = eventListeners.indexOf(listenerInfo);
      if (index > -1) {
        eventListeners.splice(index, 1);
        logger.debug(
          "EventBus",
          `已移除事件 "${event}" 的監聽器，來源: ${listenerInfo.source}`
        );
      }
    };
  };

  /**
   * 觸發事件
   * @param {string} event - 事件名稱
   * @param {any} payload - 事件數據
   * @param {Object} options - 選項
   * @param {string} options.source - 事件來源（用於調試）
   */
  const emit = (event, payload, options = {}) => {
    if (!listeners.value.has(event)) {
      logger.debug("EventBus", `沒有事件 "${event}" 的監聽器`);
      return;
    }

    const source = options.source || "unknown";
    logger.debug("EventBus", `觸發事件 "${event}"，來源: ${source}`);

    const eventListeners = listeners.value.get(event);
    eventListeners.forEach((listenerInfo) => {
      try {
        listenerInfo.callback(payload);
      } catch (error) {
        logger.error("EventBus", `事件 "${event}" 的監聽器執行出錯:`, error);
      }
    });
  };

  /**
   * 移除事件的所有監聽器
   * @param {string} event - 事件名稱
   */
  const off = (event) => {
    if (listeners.value.has(event)) {
      logger.debug("EventBus", `移除事件 "${event}" 的所有監聽器`);
      listeners.value.delete(event);
    }
  };

  /**
   * 獲取事件的所有監聽器
   * @param {string} event - 事件名稱
   * @returns {Array} - 監聽器列表
   */
  const getListeners = (event) => {
    return listeners.value.get(event) || [];
  };

  /**
   * 獲取所有已註冊的事件
   * @returns {Array} - 事件列表
   */
  const getEvents = () => {
    return Array.from(listeners.value.keys());
  };

  /**
   * 清除所有事件監聽器
   */
  const clear = () => {
    logger.debug("EventBus", "清除所有事件監聽器");
    listeners.value.clear();
  };

  return {
    on,
    emit,
    off,
    getListeners,
    getEvents,
    clear,
  };
}

/**
 * 提供事件總線
 */
export function provideEventBus() {
  const eventBus = createEventBus();
  provide(EventBusSymbol, eventBus);
  return eventBus;
}

/**
 * 使用事件總線
 * @returns {Object} - 事件總線實例
 */
export function useEventBus() {
  const eventBus = inject(EventBusSymbol);
  if (!eventBus) {
    logger.warn("EventBus", "未找到事件總線，創建一個新的實例");
    return createEventBus();
  }
  return eventBus;
}

// 創建一個全局事件總線實例
export const globalEventBus = createEventBus();

// 節點事件類型
export const NodeEventType = {
  STATE_CHANGE: "node:stateChange",
  SIZE_CHANGE: "node:sizeChange",
  EXECUTE: "node:execute",
  COMPLETED: "node:completed",
  ERROR: "node:error",
};

// 流程事件類型
export const FlowEventType = {
  INSTANCE_UPDATED: "flow:instanceUpdated",
  INSTANCE_CREATED: "flow:instanceCreated",
  INSTANCE_DELETED: "flow:instanceDeleted",
};
