import { useState, useEffect, useCallback } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useTaskDetail = (taskId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!taskId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await annotatorApi.getTaskDetail(taskId);  
      // Dữ liệu bao gồm: taskItems, availableLabels, taskName, status...
      setData(response);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải chi tiết Task");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    // Trả về danh sách ảnh để hiển thị ở Sidebar
    taskItems: data?.taskItems || [], 
    // Trả về danh sách nhãn để Annotator chọn khi vẽ
    availableLabels: data?.availableLabels || [],   
    // Các thông tin chung của Task
    taskInfo: {
      taskID: data?.taskID,
      taskName: data?.taskName,
      status: data?.status,
      deadline: data?.deadline,
      currentRound: data?.currentRound
    },
    
    loading,
    error,
    refresh: fetchDetail
  };
};