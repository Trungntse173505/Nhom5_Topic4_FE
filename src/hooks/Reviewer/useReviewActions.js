import { useState } from 'react';
import axiosClient from '../../api/axiosClient'; 

export const useReviewerActions = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Check đúng/sai cho từng annotation (PATCH)
  const checkItemDetail = async (id, isApproved) => {
    setIsProcessing(true);
    try {
      const response = await axiosClient.patch(`/api/reviewer/item-detail/${id}/check`, null, {
        params: { isApproved } 
      });
      return { success: true, data: response };
    } catch (error) {
      console.error("Lỗi khi check item:", error);
      return { success: false, error: error?.response?.data || error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Duyệt toàn bộ Task (POST)
  const approveTask = async (taskId) => {
    setIsProcessing(true);
    try {
      const response = await axiosClient.post(`/api/reviewer/tasks/${taskId}/approve`);
      return { success: true, data: response }; 
    } catch (error) {
      console.error("Lỗi duyệt task:", error);
      return { success: false, error: error?.response?.data || error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. TỪ CHỐI TASK (POST) - Mới thêm dựa trên FeedbackDTO
  const rejectTask = async (taskId, feedback) => {
    // feedback truyền vào nên có dạng: { comment: "...", errorRegion: "..." }
    if (!feedback?.comment || feedback.comment.trim() === "") {
      return { success: false, error: "Vui lòng nhập lý do từ chối." };
    }

    setIsProcessing(true);
    try {
      // Gửi body dạng JSON khớp với FeedbackDTO ở Backend
      const response = await axiosClient.post(`/api/reviewer/tasks/${taskId}/reject`, {
        comment: feedback.comment,
        errorRegion: feedback.errorRegion || ""
      });
      return { success: true, data: response };
    } catch (error) {
      console.error("Lỗi khi từ chối task:", error);
      // Backend trả về text/plain nên lỗi nằm ở error.response.data
      return { success: false, error: error?.response?.data || error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    checkItemDetail,
    approveTask,
    rejectTask, // Đã thêm
    isProcessing
  };
};