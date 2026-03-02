// src/hooks/useTaskTracking.js
import { useState, useEffect } from "react";
import { getProjectTasks, updateTask, revokeTask } from "../api/managerApi";

export const useTaskTracking = (projectId) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchTasks = async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const data = await getProjectTasks(projectId);
      const taskList = Array.isArray(data) ? data : data.data || [];

      // Xử lý thêm flag isOverdue dựa trên ngày hiện tại 2026-03-02
      const today = new Date("2026-03-02");
      const processedTasks = taskList.map((t) => ({
        ...t,
        isOverdue: new Date(t.deadline) < today && t.status !== "Approved",
      }));

      setTasks(processedTasks);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleAction = async (actionFn, ...args) => {
    try {
      setIsActionLoading(true);
      await actionFn(...args);
      await fetchTasks(); // Refresh danh sách sau khi làm xong
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    tasks,
    isLoading,
    isActionLoading,
    fetchTasks,
    extendDeadline: (taskId, date) =>
      handleAction(updateTask, taskId, { deadline: date }),
    reassignTask: (taskId, userId) =>
      handleAction(updateTask, taskId, { annotatorId: userId }),
    revoke: (taskId) => handleAction(revokeTask, taskId),
  };
};
