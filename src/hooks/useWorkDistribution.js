// src/hooks/useWorkDistribution.js
import { useState, useEffect } from "react";
import { getUsersList, splitProjectTasks } from "../api/managerApi";

export const useWorkDistribution = (project, onRefresh) => {
  const [users, setUsers] = useState([]);
  const [selectedDataIds, setSelectedDataIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Lấy danh sách User khi vào trang
  useEffect(() => {
    getUsersList()
      .then((data) => setUsers(Array.isArray(data) ? data : data.data || []))
      .catch((err) => console.error("Lỗi lấy user:", err));
  }, []);

  // 2. Lọc danh sách file chưa được giao việc từ project prop
  const unassignedItems =
    project?.dataItems?.filter((item) => !item.isAssigned) || [];

  const toggleSelection = (dataId) => {
    setSelectedDataIds((prev) =>
      prev.includes(dataId)
        ? prev.filter((id) => id !== dataId)
        : [...prev, dataId],
    );
  };

  // 3. Xử lý tạo Task Batch
  const createBatch = async (assignmentData) => {
    try {
      setIsProcessing(true);
      const payload = {
        dataIds: selectedDataIds,
        annotatorId: assignmentData.annotatorId,
        reviewerId: assignmentData.reviewerId,
        deadline: assignmentData.deadline,
      };

      await splitProjectTasks(project.projectID, payload);
      alert("Đã tạo Task và giao việc thành công!");
      setSelectedDataIds([]);
      if (onRefresh) onRefresh(); // Tải lại Dashboard để cập nhật số liệu
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    users,
    unassignedItems,
    selectedDataIds,
    isProcessing,
    toggleSelection,
    createBatch,
  };
};
