import Mock from "mockjs";
import {
  generateResponse,
  generateError,
  generateId,
  generateDate,
} from "../utils";

// 模擬檔案存儲
const files = new Map();
const workflowFiles = new Map();

// 模擬檔案上傳
Mock.mock(new RegExp("^/api/workflow/upload"), "post", (options) => {
  console.log("Mock 服務收到上傳請求：", options);
  try {
    // 解析上傳的檔案資訊
    const fileInfo = {
      id: generateId(),
      workflowId: "default",
      name: "模擬檔案.txt",
      size: 1024,
      type: "text/plain",
      url: "data:text/plain;base64,5pW45L2N5qiZ5qiZ5paH5Lu2",
      uploadedAt: generateDate(),
      updatedAt: generateDate(),
    };

    console.log("Mock 服務處理檔案資訊：", fileInfo);

    // 儲存檔案資訊
    files.set(fileInfo.id, fileInfo);

    // 關聯檔案到工作流程
    if (!workflowFiles.has(fileInfo.workflowId)) {
      workflowFiles.set(fileInfo.workflowId, new Set());
    }
    workflowFiles.get(fileInfo.workflowId).add(fileInfo.id);

    return generateResponse(fileInfo);
  } catch (error) {
    console.error("Mock 檔案上傳失敗:", error);
    return generateError("檔案上傳失敗");
  }
});

// 獲取工作流程的檔案列表
Mock.mock(/\/api\/workflow\/.*\/files$/, "get", (options) => {
  const workflowId = options.url.split("/")[3];
  const fileIds = workflowFiles.get(workflowId) || new Set();
  const workflowFileList = Array.from(fileIds)
    .map((fileId) => files.get(fileId))
    .filter(Boolean);

  return generateResponse(workflowFileList);
});

// 刪除檔案
Mock.mock(/\/api\/workflow\/files\/.*$/, "delete", (options) => {
  const fileId = options.url.split("/").pop();
  const fileInfo = files.get(fileId);

  if (!fileInfo) {
    return generateError("檔案不存在");
  }

  // 從檔案存儲中刪除
  files.delete(fileId);

  // 從工作流程關聯中刪除
  const workflowFileSet = workflowFiles.get(fileInfo.workflowId);
  if (workflowFileSet) {
    workflowFileSet.delete(fileId);
  }

  return generateResponse(null, "檔案刪除成功");
});

// 下載檔案
Mock.mock(/\/api\/workflow\/files\/.*\/download$/, "get", (options) => {
  const fileId = options.url.split("/")[4];
  const fileInfo = files.get(fileId);

  if (!fileInfo) {
    return generateError("檔案不存在");
  }

  return generateResponse({
    url: fileInfo.url,
    name: fileInfo.name,
  });
});
