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
