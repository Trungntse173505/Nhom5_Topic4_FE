import axiosClient from "./axiosClient";

const annotatorApi = {
  // Lấy danh sách Task của Annotator theo trạng thái lọc (GET)
  getTasks: (status) =>
    axiosClient.get("/api/annotator/tasks", { params: { status } }),

  // Lấy toàn bộ không gian làm việc (Workspace) của 1 Task (GET)
  getTaskDetail: (taskId) => axiosClient.get(`/api/annotator/tasks/${taskId}`),

  // Bấm nút "Bắt đầu làm" trên giao diện (PATCH)
  startTask: (taskId) =>
    axiosClient.patch(`/api/annotator/tasks/${taskId}/start`),

  // Lưu tọa độ vẽ/gán nhãn khi bấm Save cho 1 tấm ảnh (POST)
  saveAnnotation: (itemId, data) =>
    axiosClient.post(`/api/task-items/${itemId}/annotation`, data),

  // Lấy tọa độ gán nhãn của 1 tấm ảnh duy nhất để Lazy Loading (GET)
  getItemDetail: (itemId) => axiosClient.get(`/api/task-items/${itemId}`),

  // Báo lỗi 1 tấm ảnh bị mờ/hỏng (PATCH)
  flagItem: (itemId) => axiosClient.patch(`/api/task-items/${itemId}/flag`),

  // Nộp bài lần đầu tiên (POST)
  submitTask: (taskId) => axiosClient.post(`/api/tasks/${taskId}/submit`),

  // Nộp lại bài sau khi bị từ chối (POST)
  resubmitTask: (taskId) => axiosClient.post(`/api/tasks/${taskId}/resubmit`),

  // Gửi khiếu nại kết quả duyệt (POST)
  disputeTask: (taskId, data) =>
    axiosClient.post(`/api/tasks/${taskId}/dispute`, data),

  // Lấy thông tin điểm tín nhiệm (Reputation) của Annotator (GET)
  getReputation: () => axiosClient.get("/api/annotator/reputation"),
  // Lấy danh sách lịch sử khiếu nại của chính Annotator (GET)
  getDisputes: () => axiosClient.get("/api/annotator/disputes"),

  getStats: () => axiosClient.get("/api/annotator/my-stats"),
};

export default annotatorApi;
