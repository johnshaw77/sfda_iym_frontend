import {
  Component,
  TextCursorInput,
  Filter,
  Calculator,
  BarChart,
  FileInput,
} from "lucide-vue-next";

/**
 * 根據節點類別獲取對應的圖標
 * @param {string} category - 節點類別 (business-input, business-process, statistical-analysis)
 * @returns {Component} - Lucide Vue 圖標組件
 */
export const getNodeIcon = (category) => {
  switch (category) {
    case "business-input":
      return TextCursorInput;
    case "business-process":
      return Filter;
    case "statistical-analysis":
      return BarChart;
    default:
      return Component;
  }
};

/**
 * 獲取節點類別的預設圖標
 * @param {string} category - 節點類別
 * @returns {Component} - Lucide Vue 圖標組件
 */
export const getCategoryIcon = (category) => {
  switch (category) {
    case "business-input":
      return FileInput;
    case "business-process":
      return Filter;
    case "statistical-analysis":
      return BarChart;
    default:
      return Component;
  }
};
