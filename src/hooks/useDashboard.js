import { useState, useEffect } from 'react';
import { taskApi } from '../api/taskApi';

export const useDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await taskApi.getAllTasks();
        setTasks(response.data);
      } catch (error) {
        console.error("Lỗi tải tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => filter === 'All' ? true : task.status === filter);
  
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'Done').length,
    rejectedTasks: tasks.filter(t => t.status === 'Rejected').length
  };

  return { tasks, filteredTasks, isLoading, filter, setFilter, stats };
};