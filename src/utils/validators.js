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

// 節點定義驗證規則
export const nodeDefinitionValidators = {
  name: [
    { required: true, message: '請輸入節點名稱' },
    { min: 2, max: 50, message: '名稱長度需在 2-50 個字元之間' }
  ],
  category: [
    { required: true, message: '請選擇節點分類' }
  ],
  nodeType: [
    { required: true, message: '請選擇節點類型' }
  ],
  description: [
    { required: true, message: '請輸入節點描述' },
    { min: 2, max: 200, message: '描述長度需在 2-200 個字元之間' }
  ]
};

// 格式化節點定義鍵值
export const formatDefinitionKey = (value) => {
  if (!value) return '';

  // 移除特殊字符，轉換為小寫
  let formatted = value
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');

  // 確保以小寫字母開頭
  if (formatted && !formatted.match(/^[a-z]/)) {
    formatted = 'n' + formatted;
  }

  return formatted;
};

// 驗證鍵值輸入
export const isValidDefinitionKeyInput = (event) => {
  // 允許的按鍵：字母、數字、底線、退格、刪除、方向鍵等
  const validKeys = [
    'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab',
    '_', 
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)), // a-z
    ...Array.from({ length: 10 }, (_, i) => i.toString()) // 0-9
  ];

  // 檢查是否為允許的按鍵
  if (!validKeys.includes(event.key)) {
    return false;
  }

  // 如果是字母，確保是小寫
  if (/^[a-zA-Z]$/.test(event.key)) {
    return event.key === event.key.toLowerCase();
  }

  return true;
};
