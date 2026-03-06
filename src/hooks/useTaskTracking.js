import { useState, useEffect } from "react";
import {
  getProjectTasks,
  updateTaskDeadline,
  assignTaskPersonnel,
  revokeTask,
  getAvailableAnnotators, // <-- Gọi API mới
  getAvailableReviewers, // <-- Gọi API mới
} from "../api/managerApi";

export const useTaskTracking = (projectId) => {
  const [tasks, setTasks] = useState([]);
  const [annotators, setAnnotators] = useState([]); // Tách riêng list Annotator
  const [reviewers, setReviewers] = useState([]); // Tách riêng list Reviewer
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      // Gọi song song 3 API: Lấy Task, lấy Annotator, lấy Reviewer
      const [tasksRes, annRes, revRes] = await Promise.all([
        getProjectTasks(projectId).catch(() => []),
        getAvailableAnnotators().catch(() => []),
        getAvailableReviewers().catch(() => []),
      ]);

      const taskList = Array.isArray(tasksRes) ? tasksRes : tasksRes.data || [];
      const annList = Array.isArray(annRes) ? annRes : annRes.data || [];
      const revList = Array.isArray(revRes) ? revRes : revRes.data || [];

      // Logic tính toán quá hạn (Overdue)
      const today = new Date();
      const processedTasks = taskList.map((t) => ({
        ...t,
        isOverdue:
          new Date(t.deadline) < today &&
          !["Approved", "Completed", "Done"].includes(t.status),
      }));

      setTasks(processedTasks);
      setAnnotators(annList); // Gắn data vào state
      setReviewers(revList); // Gắn data vào state
    } catch (error) {
      console.error("Lỗi lấy dữ liệu Task Tracking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleAction = async (actionFn, ...args) => {
    try {
      setIsActionLoading(true);
      await actionFn(...args);
      await fetchData();
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
    annotators,
    reviewers,
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
