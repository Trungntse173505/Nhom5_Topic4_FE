import { useState, useEffect } from "react";
import {
  getUsersList,
  getUnassignedItems,
  createBatchTask,
  assignTaskPersonnel,
  updateTaskDeadline,
} from "../api/managerApi";

export const useWorkDistribution = (projectId, onRefresh) => {
  const [users, setUsers] = useState([]);
  const [unassignedItems, setUnassignedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Kéo dữ liệu File chưa giao và Danh sách nhân viên
  const fetchData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [itemsRes, usersRes] = await Promise.all([
        getUnassignedItems(projectId).catch(() => []),
        getUsersList().catch(() => []),
      ]);
      setUnassignedItems(
        Array.isArray(itemsRes) ? itemsRes : itemsRes.data || [],
      );
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes.data || []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  // 2. Chạy liên hoàn 3 API: Gom lô -> Giao việc -> Deadline
  const createBatchAndAssign = async (selectedIds, assignmentData) => {
    if (!selectedIds || selectedIds.length === 0) return false;
    setIsProcessing(true);
    try {
      // BƯỚC 1: Gom lô tạo Task
      const taskRes = await createBatchTask(projectId, selectedIds);
      const newTaskId =
        taskRes.taskId || taskRes.id || (taskRes.data && taskRes.data.id);

      if (!newTaskId)
        throw new Error(
          "Tạo lô thành công nhưng không lấy được Task ID từ Backend",
        );

      // BƯỚC 2: Giao Annotator & Reviewer
      if (assignmentData.annotatorId) {
        await assignTaskPersonnel(
          newTaskId,
          assignmentData.annotatorId,
          assignmentData.reviewerId || null,
        );
      }

      // BƯỚC 3: Đặt Deadline
      if (assignmentData.deadline) {
        await updateTaskDeadline(newTaskId, assignmentData.deadline);
      }

      await fetchData(); // Load lại list file chưa giao
      if (onRefresh) onRefresh();
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    users,
    unassignedItems,
    isLoading,
    isProcessing,
    createBatchAndAssign,
  };
};
