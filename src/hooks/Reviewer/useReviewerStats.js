import { useState, useEffect } from 'react';
import { reviewerApi } from '../../api/reviewerService'; 

export const useReviewerStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await reviewerApi.getStats();
        setStats(response.data || response);
      } catch (err) {
        console.error("Lỗi API Thống kê:", err);
        setError(err.message || "Lỗi tải thống kê Reviewer");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};