import { useIcons } from "@/composables/useIcons";
const { icons } = useIcons();

/**
 * 根據節點類別獲取對應的圖標
 * @param {string} category - 節點類別 (business-input, business-process, statistical-analysis)
 * @returns {Component} - Lucide Vue 圖標組件
 */
export const getNodeIcon = (category) => {
  switch (category) {
    case "business-input":
      return icons.TextCursorInput;
    case "business-process":
      return icons.Filter;
    case "statistical-analysis":
      return icons.BarChart;
    default:
      return icons.Component;
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
      return icons.FileInput;
    case "business-process":
      return icons.Filter;
    case "statistical-analysis":
      return icons.BarChart;
    default:
      return icons.Component;
  }
};
