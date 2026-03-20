import axiosClient from './axiosClient'; // Đường dẫn trỏ tới file axiosClient của bạn

export const managerDisputeApi = {
  // Lấy danh sách tất cả khiếu nại
  getAllDisputes: () => {
    return axiosClient.get('/api/manager/projects/disputes');
  },

  // Lấy chi tiết 1 khiếu nại (kèm bằng chứng)
  getDisputeDetail: (disputeId) => {
    return axiosClient.get(`/api/manager/projects/disputes/${disputeId}`);
  },

  // Giải quyết khiếu nại (action: 'accept' hoặc 'reject')
  resolveDispute: (disputeId, action) => {
    return axiosClient.patch(`/api/manager/projects/disputes/${disputeId}?action=${action}`);
  }
};