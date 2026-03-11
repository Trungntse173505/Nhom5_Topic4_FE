import { useState } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useSubmitTask = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Hàm nộp bài lần đầu lên Azure
   * @param {string} taskId - ID của Task cần nộp
   */
  const submit = async (taskId) => {
    if (!taskId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await annotatorApi.submitTask(taskId);
      return response;
    } catch (err) {
      const errorMsg = err?.response?.data || "Nộp bài thất bại. Vui lòng kiểm tra lại các ảnh.";
      setError(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    submit,      
    isSubmitting, 
    error    
  };
};