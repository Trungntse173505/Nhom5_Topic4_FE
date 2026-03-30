import { useState } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useResubmitTask = () => {
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Hàm nộp lại bài sau khi đã sửa lỗi theo yêu cầu của Reviewer
   * @param {string} taskId - ID Task cần nộp lại
   */
  const resubmit = async (taskId) => {
    if (!taskId) return;

    setIsResubmitting(true);
    setError(null);
    try {
      const response = await annotatorApi.resubmitTask(taskId);
      return response;
    } catch (err) {

      const errorMsg = err?.response?.data || "Nộp lại bài thất bại. Vui lòng kiểm tra số lần nộp còn lại.";
      setError(errorMsg);
      throw err;
    } finally {
      setIsResubmitting(false);
    }
  };

  return { 
    resubmit,      
    isResubmitting, 
    error  
  };
};