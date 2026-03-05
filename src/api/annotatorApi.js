import axiosClient from './axiosClient';

const annotatorApi = {
  /**
   * 1. Lấy danh sách Task của Annotator
   * @param {string} status - Trạng thái lọc (New, InProgress, PendingReview...)
   */
  getTasks: (status) => {
    const url = '/api/annotator/tasks';
    return axiosClient.get(url, { params: { status } });
  },

  /**
   * 2. Lấy toàn bộ không gian làm việc (Workspace) của 1 Task
   * @param {string} taskId - ID của Task
   */
  getTaskDetail: (taskId) => {
    const url = `/api/annotator/tasks/${taskId}`;
    return axiosClient.get(url);
  },

  /**
   * 3. Bấm nút "Bắt đầu làm" trên giao diện
   * @param {string} taskId - ID của Task
   */
  startTask: (taskId) => {
    const url = `/api/annotator/tasks/${taskId}/start`;
    return axiosClient.patch(url);
  },

  /**
   * 4. LƯU TỌA ĐỘ VẼ (Gọi khi bấm Save cho 1 tấm ảnh)
   * @param {string} itemId - ID của tấm ảnh (TaskItem)
   * @param {object} data - { annotations: [{ annotationData, content, field }] }
   */
  saveAnnotation: (itemId, data) => {
    const url = `/api/task-items/${itemId}/annotation`;
    return axiosClient.post(url, data);
  },

  /**
   * 4.1 Lấy tọa độ gán nhãn của 1 tấm ảnh duy nhất (Lazy Loading)
   * @param {string} itemId - ID của tấm ảnh
   */
  getItemDetail: (itemId) => {
    const url = `/api/task-items/${itemId}`;
    return axiosClient.get(url);
  },

  /**
   * 5. Báo lỗi 1 tấm ảnh (Flag)
   * @param {string} itemId - ID của tấm ảnh
   */
  flagItem: (itemId) => {
    const url = `/api/task-items/${itemId}/flag`;
    return axiosClient.patch(url);
  },

  /**
   * 6. Nộp bài lần đầu
   * @param {string} taskId - ID của Task
   */
  submitTask: (taskId) => {
    const url = `/api/tasks/${taskId}/submit`;
    return axiosClient.post(url);
  },

  /**
   * 7. Nộp lại bài (Resubmit)
   */
  resubmitTask: (taskId) => {
    const url = `/api/tasks/${taskId}/resubmit`;
    return axiosClient.post(url);
  },

  /**
   * 8. Gửi khiếu nại (Dispute)
   * @param {string} taskId - ID của Task
   * @param {object} data - { reason: string }
   */
  disputeTask: (taskId, data) => {
    const url = `/api/tasks/${taskId}/dispute`;
    return axiosClient.post(url, data);
  },

  /**
   * 9. Lấy thông tin điểm tín nhiệm (Reputation)
   */
  getReputation: () => {
    const url = '/api/annotator/reputation';
    return axiosClient.get(url);
  },
};

export default annotatorApi;