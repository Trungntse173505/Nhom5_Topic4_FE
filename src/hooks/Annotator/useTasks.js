import { useState, useEffect, useCallback } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useTasks = (status = null) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await annotatorApi.getTasks(status); 
      // AxiosClient của bạn đã trả về response.data nên data ở đây chính là mảng Task
      setTasks(data || []); 
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải danh sách Task");
    } finally {
      setLoading(false);
    }
  }, [status]);
  // Tự động gọi API khi mount component hoặc khi status thay đổi
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { 
    tasks,      // Danh sách Task lấy từ Azure: taskID, taskName, status...
    loading,    // Trạng thái đang tải
    error,      // Thông báo lỗi nếu có
    refresh: fetchTasks // Hàm để gọi lại API thủ công (ví dụ khi nhấn nút Reload)
  };
};