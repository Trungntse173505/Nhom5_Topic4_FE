import axiosClient from './axiosClient'; 

export const reviewerApi = {
  // Lấy danh sách Task đang chờ duyệt (GET)
  getTasks: () => axiosClient.get('/api/reviewer/tasks'),

  // Xem chi tiết Task kèm danh sách ảnh/tọa độ (GET)
  getTaskDetail: (taskId) => axiosClient.get(`/api/reviewer/tasks/${taskId}`),

  // 🔥 Đánh dấu đúng/sai cho từng khung hình hoặc tọa độ (PATCH)
  checkItemDetail: (id, isApproved) => {
    // Đảm bảo ép chuẩn thành chuỗi có viết hoa đầu "True" / "False"
    const statusString = (isApproved === true || isApproved === "True") ? "True" : "False";
    return axiosClient.patch(`/api/reviewer/item-detail/${id}/check`, null, {
      params: { isApproved: statusString } 
    });
  },

  // Duyệt Task thành công (POST)
  approveTask: (taskId) => axiosClient.post(`/api/reviewer/tasks/${taskId}/approve`),

  // Từ chối Task và yêu cầu làm lại kèm lý do (POST)
  rejectTask: (taskId, reason) => axiosClient.post(`/api/reviewer/tasks/${taskId}/reject`, JSON.stringify(reason), {
    headers: { 'Content-Type': 'application/json' }
  }),
  
  // all khiếu nại
  getDisputes: () => axiosClient.get('/api/reviewer/disputes'),
  
  // xem điểm
  getReputation: () => axiosClient.get('/api/reviewer/reputation'),

  // lấy số liệu
  getStats: () => axiosClient.get('/api/reviewer/my-stats'),
};