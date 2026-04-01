import { useState, useEffect, useMemo } from "react";
import {
  getAvailableAnnotators,
  getAvailableReviewers,
  getUserReputationLogs,
} from "../../api/managerApi";

const PAGE_SIZE = 10;

const roleFilterOptions = [
  { value: "all", label: "Tất cả vai trò" },
  { value: "annotator", label: "Annotator" },
  { value: "reviewer", label: "Reviewer" },
];

const experienceFilterOptions = [
  { value: "any", label: "All experience" },
  { value: "basic", label: "Basic" },
  { value: "mixed", label: "Mixed" },
  { value: "video", label: "Video" },
  { value: "text", label: "Text" },
  { value: "audio", label: "Audio" },
  { value: "image", label: "Image" },
];

const scoreSortOptions = [
  { value: "score-desc", label: "Cao đến thấp" },
  { value: "score-asc", label: "Thấp đến cao" },
];

const normalizeRole = (user) => String(user.roleName || user.role || "").trim().toLowerCase();

const normalizeExperience = (user) => {
  const raw = String(user.experience ?? user.expertise ?? user.level ?? user.seniority ?? "").trim().toLowerCase();

  if (!raw || ["n/a", "na", "null", "undefined", "chưa cập nhật", "chua cap nhat", "basic", "cơ bản"].includes(raw)) {
    return "basic";
  }

  if (raw === "all" || raw === "mixed") {
    return "mixed";
  }

  if (["video", "text", "audio", "image"].includes(raw)) {
    return raw;
  }

  return raw;
};

const sortUsers = (users, scoreSort) => {
  const list = [...users];
  const multiplier = scoreSort === "score-asc" ? 1 : -1;

  list.sort((left, right) => {
    const leftName = String(left.fullName || left.userName || left.name || "");
    const rightName = String(right.fullName || right.userName || right.name || "");
    const diff = Number(left.score ?? left.qualityScore ?? left.reputationScore ?? 100) -
      Number(right.score ?? right.qualityScore ?? right.reputationScore ?? 100);

    return diff !== 0 ? diff * multiplier : leftName.localeCompare(rightName, "vi");
  });

  return list;
};

export const useQualityScore = () => {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [scoreSort, setScoreSort] = useState("score-desc");
  const [roleFilter, setRoleFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("any");
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole =
        roleFilter === "all" || normalizeRole(user) === roleFilter.toLowerCase();
      const matchesExperience =
        experienceFilter === "any" || normalizeExperience(user) === experienceFilter;
      return matchesRole && matchesExperience;
    });
  }, [users, roleFilter, experienceFilter]);

  const sortedFilteredUsers = useMemo(
    () => sortUsers(filteredUsers, scoreSort),
    [filteredUsers, scoreSort],
  );

  const totalPages = Math.max(1, Math.ceil(sortedFilteredUsers.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, experienceFilter, scoreSort]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedFilteredUsers.slice(start, start + PAGE_SIZE);
  }, [currentPage, sortedFilteredUsers]);

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
    filteredUsers,
    paginatedUsers,
    totalFilteredUsers: sortedFilteredUsers.length,
    totalPages,
    currentPage,
    setCurrentPage,
    roleFilter,
    setRoleFilter,
    roleFilterOptions,
    experienceFilter,
    setExperienceFilter,
    experienceFilterOptions,
    scoreSort,
    setScoreSort,
    scoreSortOptions,
    pageSize: PAGE_SIZE,
    isLoadingUsers,
    activeUserId,
    selectedUserLogs,
    isLoadingLogs,
    fetchUserLogs,
    closeLogs,
  };
};
