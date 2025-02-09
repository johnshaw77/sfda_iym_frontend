import Mock from "mockjs";
import {
  generateResponse,
  generateError,
  generateId,
  generateDate,
  withDelay,
} from "../utils";

// 模擬檔案列表
const files = new Map();

// 模擬檔案上傳
Mock.mock("/api/workflow/upload", "post", (options) => {
  const workflowId = options.body.get("workflowId");
  const file = options.body.get("file");

  // 生成檔案資訊
  const fileInfo = {
    id: generateId(),
    workflowId,
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file),
    uploadedAt: generateDate(),
    updatedAt: generateDate(),
  };

  // 儲存檔案資訊
  if (!files.has(workflowId)) {
    files.set(workflowId, new Map());
  }
  files.get(workflowId).set(fileInfo.id, fileInfo);

  return withDelay(() => generateResponse(fileInfo, "檔案上傳成功"));
});

// 獲取工作流程的檔案列表
Mock.mock(/\/api\/workflow\/.*\/files$/, "get", (options) => {
  const workflowId = options.url.split("/")[3];
  const workflowFiles = Array.from(files.get(workflowId)?.values() || []);

  return withDelay(() => generateResponse(workflowFiles));
});

// 刪除檔案
Mock.mock(/\/api\/workflow\/files\/.*$/, "delete", (options) => {
  const fileId = options.url.split("/").pop();

  // 尋找並刪除檔案
  for (const [workflowId, workflowFiles] of files.entries()) {
    if (workflowFiles.has(fileId)) {
      workflowFiles.delete(fileId);
      return withDelay(() => generateResponse(null, "檔案刪除成功"));
    }
  }

  return withDelay(() => generateError("檔案不存在"));
});

// 下載檔案
Mock.mock(/\/api\/workflow\/files\/.*\/download$/, "get", (options) => {
  const fileId = options.url.split("/")[4];

  // 尋找檔案
  for (const [workflowId, workflowFiles] of files.entries()) {
    const file = workflowFiles.get(fileId);
    if (file) {
      return withDelay(() =>
        generateResponse({
          url: file.url,
          name: file.name,
        })
      );
    }
  }

  return withDelay(() => generateError("檔案不存在"));
});
