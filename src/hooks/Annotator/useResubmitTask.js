import { useState } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useResubmitTask = () => {
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Hàm nộp lại bài sau khi đã sửa lỗi theo yêu cầu của Reviewer
   * @param {string} taskId - ID của Task cần nộp lại
   */
  const resubmit = async (taskId) => {
    if (!taskId) return;

    setIsResubmitting(true);
    setError(null);
    try {
      // Gọi API POST /api/tasks/{taskId}/resubmit
      const response = await annotatorApi.resubmitTask(taskId);
      
      // Trả về thông báo thành công từ Azure
      return response;
    } catch (err) {
      // Xử lý lỗi (ví dụ: "Đã quá 3 lần nộp lại" hoặc "Task không ở trạng thái Rejected")
      const errorMsg = err?.response?.data || "Nộp lại bài thất bại. Vui lòng kiểm tra số lần nộp còn lại.";
      setError(errorMsg);
      throw err;
    } finally {
      setIsResubmitting(false);
    }
  };

  return { 
    resubmit,       // Hàm thực hiện nộp lại
    isResubmitting, // Trạng thái đang xử lý trên Azure
    error           // Thông báo lỗi nếu có
  };
};