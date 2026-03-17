import { useState, useEffect } from "react";
import {
  getAvailableAnnotators,
  getAvailableReviewers,
  getUserReputationLogs,
} from "../../api/managerApi";

export const useQualityScore = () => {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [selectedUserLogs, setSelectedUserLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [activeUserId, setActiveUserId] = useState(null);

  // 1. KÉO DANH SÁCH TỪ 2 API AVAILABLE
  useEffect(() => {
    const fetchPersonnel = async () => {
      setIsLoadingUsers(true);
      try {
        // Chạy song song 2 API cho nhanh
        const [annRes, revRes] = await Promise.all([
          getAvailableAnnotators().catch(() => []),
          getAvailableReviewers().catch(() => []),
        ]);

        // Trích xuất mảng data
        const annotatorsList = Array.isArray(annRes)
          ? annRes
          : annRes?.data || [];
        const reviewersList = Array.isArray(revRes)
          ? revRes
          : revRes?.data || [];

        // Ép cứng cái Role vào để giao diện (QualityScore.jsx) biết ai làm chức vụ gì
        const formattedAnnotators = annotatorsList.map((u) => ({
          ...u,
          roleName: "Annotator",
        }));

        const formattedReviewers = reviewersList.map((u) => ({
          ...u,
          roleName: "Reviewer",
        }));

        // Gộp chung 2 danh sách lại
        setUsers([...formattedAnnotators, ...formattedReviewers]);
      } catch (error) {
        console.error("Lỗi lấy danh sách nhân sự:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchPersonnel();
  }, []);

  // 2. Kéo lịch sử điểm khi bấm vào một User
  const fetchUserLogs = async (userId) => {
    setActiveUserId(userId);
    setIsLoadingLogs(true);
    try {
      const res = await getUserReputationLogs(userId);
      setSelectedUserLogs(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Lỗi lấy logs uy tín:", error);
      setSelectedUserLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const closeLogs = () => {
    setActiveUserId(null);
    setSelectedUserLogs([]);
  };

  return {
    users,
    isLoadingUsers,
    activeUserId,
    selectedUserLogs,
    isLoadingLogs,
    fetchUserLogs,
    closeLogs,
  };
};
