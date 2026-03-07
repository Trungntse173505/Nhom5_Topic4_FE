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
      const response = await annotatorApi.startTask(taskId);  
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
    start,        
    isStarting,  
    error     
  };
};