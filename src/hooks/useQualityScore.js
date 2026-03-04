import { useState, useEffect } from "react";
import { getUsersList, getUserReputationLogs } from "../api/managerApi";

export const useQualityScore = () => {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [selectedUserLogs, setSelectedUserLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [activeUserId, setActiveUserId] = useState(null);

  // 1. Lấy danh sách toàn bộ User khi vào trang
  useEffect(() => {
    const fetchAllUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await getUsersList();
        const allUsers = Array.isArray(res) ? res : res.data || [];
        // Chỉ lấy Annotator và Reviewer
        const filtered = allUsers.filter(
          (u) =>
            u.role === "annotator" ||
            u.role === "reviewer" ||
            u.roleName === "Annotator" ||
            u.roleName === "Reviewer",
        );
        setUsers(filtered);
      } catch (error) {
        console.error("Lỗi lấy danh sách user:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchAllUsers();
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
