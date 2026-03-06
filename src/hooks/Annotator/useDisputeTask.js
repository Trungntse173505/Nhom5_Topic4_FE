import { useState } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useDisputeTask = () => {
  const [isDisputing, setIsDisputing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Hàm gửi khiếu nại cho một Task bị chấm sai
   * @param {string} taskId - ID của Task cần khiếu nại
   * @param {string} reason - Lý do khiếu nại (ví dụ: "Ảnh số 3 tôi gán nhãn đúng theo quy định...")
   */
  const dispute = async (taskId, reason) => {
    if (!taskId || !reason) return;

    setIsDisputing(true);
    setError(null);
    try {
      // Gọi API POST /api/tasks/{taskId}/dispute với body là { reason }
      const response = await annotatorApi.disputeTask(taskId, { reason });
      
      // Trả về kết quả thành công từ Azure
      return response;
    } catch (err) {
      const errorMsg = err?.response?.data || "Không thể gửi khiếu nại lúc này.";
      setError(errorMsg);
      throw err;
    } finally {
      setIsDisputing(false);
    }
  };

  return { 
    dispute,       // Hàm thực hiện khiếu nại
    isDisputing,   // Trạng thái đang gửi yêu cầu
    error          // Thông báo lỗi nếu có
  };
};