import { useState, useEffect, useCallback } from 'react';
import { reviewerApi } from '../../api/reviewerService';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reviewerApi.getTasks(); 
      setTasks(data);
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi lấy danh sách task.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tự động gọi API khi component được mount lần đầu
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Trả về state và hàm refetch để có thể gọi lại API bằng tay (ví dụ: nút Làm mới)
  return { 
    tasks, 
    isLoading, 
    error, 
    refetch: fetchTasks 
  };
};