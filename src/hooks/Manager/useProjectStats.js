import { useState, useEffect } from "react";
import { getProjectStatistics, getUserPerformance } from "../../api/managerApi";

export const useProjectStats = (projectId) => {
  const [stats, setStats] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchStats = async () => {
    if (!projectId) return;
    setIsLoadingStats(true);
    try {
      // Chạy song song 2 API cho lẹ
      const [statsRes, perfRes] = await Promise.all([
        getProjectStatistics(projectId).catch(() => null),
        getUserPerformance(projectId).catch(() => []),
      ]);

      // Bọc lót lấy data
      setStats(statsRes?.data || statsRes || null);
      setPerformance(Array.isArray(perfRes) ? perfRes : perfRes?.data || []);
    } catch (error) {
      console.error("Lỗi khi kéo dữ liệu thống kê:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [projectId]);

  return { stats, performance, isLoadingStats, refetchStats: fetchStats };
};
