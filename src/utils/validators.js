/**
 * 名稱格式化工具
 * @param {string} value - 輸入值
 * @returns {string} - 格式化後的值
 */
export const formatName = (value) => {
  return value
    .replace(/\s+/g, "_") // 將空格替換為下底線
    .toUpperCase() // 轉換為大寫
    .replace(/[^A-Z0-9_]/g, ""); // 移除非法字符
};

/**
 * 檢查按鍵是否合法
 * @param {KeyboardEvent} event - 鍵盤事件
 * @returns {boolean} - 是否為合法按鍵
 */
export const isValidKeyInput = (event) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Tab",
    "Enter",
    "_",
    " ",
  ];

  return allowedKeys.includes(event.key) || /^[a-zA-Z0-9]$/.test(event.key);
};

/**
 * 通用名稱驗證規則
 */
export const nameValidationRules = [
  { required: true, message: "請輸入名稱", trigger: "blur" },
  { min: 2, max: 50, message: "長度在 2 到 50 個字符之間", trigger: "blur" },
  {
    pattern: /^[A-Z][A-Z0-9_]*$/,
    message: "必須以英文字母開頭，只能包含大寫字母、數字和下底線",
    trigger: ["blur", "change"],
  },
];

/**
 * 通用描述驗證規則
 */
export const descriptionValidationRules = [
  { required: true, message: "請輸入描述", trigger: "blur" },
  { max: 200, message: "長度不能超過 200 個字符", trigger: "blur" },
];

// 節點定義相關的驗證規則
export const nodeDefinitionValidators = {
  definitionKey: [
    { required: true, message: "請輸入節點定義鍵值", trigger: "blur" },
    { min: 5, max: 30, message: "長度必須在5到30個字元之間", trigger: "blur" },
    {
      pattern: /^[a-z][a-z0-9-]*$/,
      message: "必須以小寫字母開頭，只能包含小寫字母、數字和連字符號",
      trigger: ["blur", "change"],
    },
    {
      validator: (rule, value, callback) => {
        if (value && value.includes("--")) {
          callback(new Error("不能包含連續的連字符號"));
        } else {
          callback();
        }
      },
      trigger: ["blur", "change"],
    },
  ],
  name: [
    { required: true, message: "請輸入節點名稱", trigger: "blur" },
    { min: 2, max: 50, message: "長度必須在2到50個字元之間", trigger: "blur" },
  ],
  category: [
    { required: true, message: "請選擇節點分類", trigger: "change" },
    {
      validator: (rule, value, callback) => {
        const validCategories = [
          "business-input",
          "business-process",
          "statistical-analysis",
        ];
        if (!validCategories.includes(value)) {
          callback(new Error("無效的節點分類"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  nodeType: [
    { required: true, message: "請選擇節點類型", trigger: "change" },
    {
      validator: (rule, value, callback) => {
        const validTypes = [
          "custom-input",
          "custom-process",
          "statistic-process",
        ];
        if (!validTypes.includes(value)) {
          callback(new Error("無效的節點類型"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  description: [
    { required: true, message: "請輸入節點描述", trigger: "blur" },
    {
      min: 2,
      max: 200,
      message: "長度必須在2到200個字元之間",
      trigger: "blur",
    },
    {
      validator: (rule, value, callback) => {
        if (value && value.trim().length === 0) {
          callback(new Error("描述不能只包含空白字符"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  componentName: [
    {
      validator: (rule, value, callback, source) => {
        if (source.nodeType === "custom-input" && !value) {
          callback(new Error("custom-input 類型必須指定組件名稱"));
        } else {
          callback();
        }
      },
      trigger: ["blur", "change"],
    },
  ],
  apiEndpoint: [
    {
      validator: (rule, value, callback, source) => {
        if (
          ["custom-process", "statistic-process"].includes(source.nodeType) &&
          !value
        ) {
          callback(new Error("處理類型節點必須指定 API 端點"));
        } else if (value && !value.startsWith("/")) {
          callback(new Error("API 端點必須以 / 開頭"));
        } else {
          callback();
        }
      },
      trigger: ["blur", "change"],
    },
  ],
  apiMethod: [
    {
      validator: (rule, value, callback, source) => {
        const validMethods = ["GET", "POST", "PUT", "DELETE"];
        if (source.apiEndpoint && !value) {
          callback(new Error("請選擇 API 方法"));
        } else if (value && !validMethods.includes(value)) {
          callback(new Error("無效的 API 方法"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
};

// 格式化節點定義鍵值
export const formatDefinitionKey = (value) => {
  if (!value) return "";

  // 移除非法字符，只保留小寫字母、數字和連字符號
  let formatted = value
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  // 確保以小寫字母開頭
  if (formatted && !formatted.match(/^[a-z]/)) {
    formatted = formatted.replace(/^[^a-z]*([a-z])?/, "$1");
  }

  return formatted;
};

// 驗證節點定義鍵值輸入
export const isValidDefinitionKeyInput = (event) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Tab",
    "Enter",
    "-",
    " ",
  ];

  // 只允許小寫字母、數字、連字符號和控制鍵
  return allowedKeys.includes(event.key) || event.key.match(/^[a-z0-9]$/);
};
