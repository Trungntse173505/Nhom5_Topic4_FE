import { useState, useEffect } from "react";
import {
  getProjectTasks,
  updateTaskDeadline,
  assignTaskPersonnel,
  revokeTask,
  getUsersList,
} from "../api/managerApi";

export const useTaskTracking = (projectId) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); // Chứa danh sách nhân sự để Reassign
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([
        getProjectTasks(projectId).catch(() => []),
        getUsersList().catch(() => []),
      ]);

      const taskList = Array.isArray(tasksRes) ? tasksRes : tasksRes.data || [];
      const userList = Array.isArray(usersRes) ? usersRes : usersRes.data || [];

      // Logic tính toán quá hạn (Overdue)
      const today = new Date();
      const processedTasks = taskList.map((t) => ({
        ...t,
        isOverdue:
          new Date(t.deadline) < today &&
          !["Approved", "Completed", "Done"].includes(t.status),
      }));

      setTasks(processedTasks);
      setUsers(userList);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu Task Tracking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  // Hành động gọi API
  const handleAction = async (actionFn, ...args) => {
    try {
      setIsActionLoading(true);
      await actionFn(...args);
      await fetchData(); // Refresh lại danh sách sau khi làm xong
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
    users, // Trả ra để UI đổ vào Dropdown Reassign
    isLoading,
    isActionLoading,
    fetchTasks: fetchData,
    extendDeadline: (taskId, date) =>
      handleAction(updateTaskDeadline, taskId, date),
    reassignTask: (taskId, annotatorId, reviewerId) =>
      handleAction(assignTaskPersonnel, taskId, annotatorId, reviewerId),
    revoke: (taskId) => handleAction(revokeTask, taskId),
  };
};
