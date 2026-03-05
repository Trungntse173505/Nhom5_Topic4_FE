import { useState } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useStartTask = () => {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Hàm kích hoạt bắt đầu làm Task
   * @param {string} taskId - ID của Task cần bắt đầu
   */
  const start = async (taskId) => {
    if (!taskId) return;

    setIsStarting(true);
    setError(null);
    try {
      // Gọi API PATCH để đổi trạng thái từ New -> InProgress trên Azure
      const response = await annotatorApi.startTask(taskId);  
      // Trả về dữ liệu thành công { message: "Đã bắt đầu làm Task" }
      return response;
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Không thể bắt đầu làm Task này.";
      setError(errorMsg);
      throw err;
    } finally {
      setIsStarting(false);
    }
  };

  return { 
    start,        // Hàm thực hiện gọi API
    isStarting,   // Trạng thái đang đợi server Azure phản hồi
    error         // Thông báo lỗi nếu có
  };
};