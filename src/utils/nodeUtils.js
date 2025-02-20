/**
 * 節點相關的工具函數
 */

// 預設的節點配置
export const DEFAULT_NODE_CONFIG = {
  type: "BaseNode",
  category: "business-input",
  nodeType: "custom-process",
  version: "1.0.0",
  style: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
  },
  headerBgColor: "#F8FAFC",
  headerBorderColor: "#E2E8F0",
};

// 預設的 UI 配置
export const DEFAULT_UI_CONFIG = {
  style: {
    backgroundColor: "#ffffff",
    borderColor: "#64748b",
  },
};

// 預設的驗證規則
export const DEFAULT_VALIDATION = {
  required: false,
};

// 預設的連接點配置
export const DEFAULT_HANDLES = {
  inputs: [],
  outputs: [],
};

/**
 * 解析 JSON 字串
 * @param {string|object} value - 要解析的值
 * @param {object} defaultValue - 預設值
 * @returns {object} 解析後的物件
 */
export const parseJsonField = (value, defaultValue = {}) => {
  try {
    if (typeof value === "string") {
      return JSON.parse(value);
    }
    return value || defaultValue;
  } catch (e) {
    console.warn("JSON 解析失敗:", e);
    return defaultValue;
  }
};

/**
 * 建立新節點的預設資料
 * @returns {object} 新節點的預設資料
 */
export const createDefaultNode = () => ({
  id: `temp-${Date.now()}`,
  definitionKey: "",
  nodeType: DEFAULT_NODE_CONFIG.nodeType,
  name: "",
  category: DEFAULT_NODE_CONFIG.category,
  description: "",
  componentName: "",
  componentPath: "",
  apiEndpoint: "",
  apiMethod: "POST",
  version: DEFAULT_NODE_CONFIG.version,
  config: {},
  uiConfig: {
    ...DEFAULT_UI_CONFIG,
    style: {
      ...DEFAULT_UI_CONFIG.style,
      ...DEFAULT_NODE_CONFIG.style,
    },
  },
  validation: { ...DEFAULT_VALIDATION },
  handles: { ...DEFAULT_HANDLES },
  headerBgColor: DEFAULT_NODE_CONFIG.headerBgColor,
  headerBorderColor: DEFAULT_NODE_CONFIG.headerBorderColor,
});

/**
 * 處理節點資料，確保所有必要的欄位都存在
 * @param {object} node - 節點資料
 * @returns {object} 處理後的節點資料
 */
export const processNodeData = (node) => {
  if (!node) return null;

  return {
    ...node,
    uiConfig: {
      ...DEFAULT_UI_CONFIG,
      ...parseJsonField(node.uiConfig, DEFAULT_UI_CONFIG),
      style: {
        ...DEFAULT_UI_CONFIG.style,
        ...(parseJsonField(node.uiConfig, DEFAULT_UI_CONFIG)?.style || {}),
      },
    },
    validation: {
      ...DEFAULT_VALIDATION,
      ...parseJsonField(node.validation, DEFAULT_VALIDATION),
    },
    handles: {
      ...DEFAULT_HANDLES,
      ...parseJsonField(node.handles, DEFAULT_HANDLES),
    },
    config: parseJsonField(node.config, {}),
  };
};

/**
 * 準備要儲存的節點資料
 * @param {object} node - 節點資料
 * @returns {object} 準備儲存的資料
 */
export const prepareNodeDataForSave = (node) => {
  if (!node) return null;

  return {
    definitionKey: node.definitionKey,
    nodeType: node.nodeType,
    name: node.name,
    category: node.category,
    description: node.description,
    version: node.version || "1.0.0",
    componentName: node.componentName,
    componentPath: node.componentPath,
    apiEndpoint: node.apiEndpoint,
    apiMethod: node.apiMethod,
    config: node.config || {},
    uiConfig: node.uiConfig || DEFAULT_UI_CONFIG,
    validation: node.validation || DEFAULT_VALIDATION,
    handles: node.handles || DEFAULT_HANDLES,
  };
};
