// src/hooks/useProjectActions.js
import { useState } from "react";
import {
  updateProjectInfo,
  updateProjectStatus,
  updateProjectGuideline,
  splitProjectTasks,
} from "../api/managerApi"; // Nhớ đảm bảo ông đã chép 4 hàm API tui gửi ở tin nhắn trước vào file managerApi.js nhé!

export const useProjectActions = (projectId) => {
  const [isActionLoading, setIsActionLoading] = useState(false);

  // 1. Cập nhật thông tin dự án
  const handleUpdateInfo = async (updateData, onSuccess) => {
    try {
      setIsActionLoading(true);
      await updateProjectInfo(projectId, updateData);
      alert("Cập nhật thông tin dự án thành công!");
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 2. Đổi trạng thái (VD: Active -> Closed)
  const handleChangeStatus = async (newStatus, onSuccess) => {
    try {
      setIsActionLoading(true);
      await updateProjectStatus(projectId, newStatus);
      alert(`Đã chuyển dự án sang trạng thái: ${newStatus}`);
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 3. Cập nhật Guideline
  const handleUpdateGuideline = async (guidelineUrl, onSuccess) => {
    try {
      setIsActionLoading(true);
      await updateProjectGuideline(projectId, guidelineUrl);
      alert("Cập nhật tài liệu hướng dẫn thành công!");
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 4. Phân lô Task (Trọng điểm)
  const handleSplitTasks = async (payload, onSuccess) => {
    try {
      setIsActionLoading(true);
      await splitProjectTasks(projectId, payload);
      alert("Phân lô dữ liệu thành các Task thành công!");
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    isActionLoading,
    handleUpdateInfo,
    handleChangeStatus,
    handleUpdateGuideline,
    handleSplitTasks,
  };
};
