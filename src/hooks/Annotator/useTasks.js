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
      setTasks(data || []); 
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải danh sách Task");
    } finally {
      setLoading(false);
    }
  }, [status]);
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { 
    tasks,      
    loading,
    error, 
    refresh: fetchTasks 
  };
};