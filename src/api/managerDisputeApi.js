import axiosClient from './axiosClient';

export const managerDisputeApi = {
  // Lấy danh sách tất cả khiếu nại
  getAllDisputes: () => {
    return axiosClient.get('/api/manager/projects/disputes');
  },

  // Lấy chi tiết 1 khiếu nại (kèm bằng chứng)
  getDisputeDetail: (disputeId) => {
    return axiosClient.get(`/api/manager/projects/disputes/${disputeId}`);
  },

  // 🔥 ĐÃ FIX: Giải quyết khiếu nại (truyền thêm managerComment vào body)
  resolveDispute: (disputeId, action, managerComment) => {
    return axiosClient.patch(
      `/api/manager/projects/disputes/${disputeId}?action=${action}`,
      JSON.stringify(managerComment), // Gửi body dạng chuỗi JSON
      { headers: { 'Content-Type': 'application/json' } }
    );
  },

  getMissingLabelReports: (projectId) =>
    axiosClient.get(`/api/manager/projects/projects/${projectId}/missing-label-reports`),

  getMissingLabelEvidence: (taskId) =>
    axiosClient.get(`/api/manager/projects/missing-label-evidence/${taskId}`),
};