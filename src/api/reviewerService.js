import axiosClient from './axiosClient'; 

export const reviewerApi = {
  /**
   * 1. Lấy danh sách các Task đang chờ Reviewer duyệt
   * GET: /api/reviewer/tasks
   */
  getTasks: () => {
    return axiosClient.get('/api/reviewer/tasks');
  },

  /**
   * 2. Lấy chi tiết một Task (Bao gồm danh sách ảnh, tọa độ để vẽ lên Canvas)
   * GET: /api/reviewer/tasks/{taskId}
   */
  getTaskDetail: (taskId) => {
    return axiosClient.get(`/api/reviewer/tasks/${taskId}`);
  },

  /**
   * 3. Đánh dấu ĐÚNG/SAI cho từng tọa độ/khung hình (Item Detail)
   * PATCH: /api/reviewer/item-detail/{id}/check
   * @param {number|string} id - ID của chi tiết item (TaskItemDetail ID)
   * @param {boolean} isApproved - true (Đúng) / false (Sai)
   */
  checkItemDetail: (id, isApproved) => {
    return axiosClient.patch(`/api/reviewer/item-detail/${id}/check`, null, {
      params: { isApproved } // Tự động nối thành ?isApproved=true/false trên URL
    });
  },

  /**
   * 4. Duyệt Task (Chỉ gọi khi tất cả các item đều đúng)
   * POST: /api/reviewer/tasks/{taskId}/approve
   */
  approveTask: (taskId) => {
    return axiosClient.post(`/api/reviewer/tasks/${taskId}/approve`);
  },

  /**
   * 5. Từ chối Task (Trả về cho Annotator làm lại kèm lý do)
   * POST: /api/reviewer/tasks/{taskId}/reject
   * @param {string} taskId - ID của Task
   * @param {string} reason - Lý do từ chối
   */
  rejectTask: (taskId, reason) => {
    // Vì BE của bạn dùng [FromBody] string reason, ta cần bọc JSON.stringify để gửi dưới dạng chuỗi chuẩn JSON
    return axiosClient.post(`/api/reviewer/tasks/${taskId}/reject`, JSON.stringify(reason), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};