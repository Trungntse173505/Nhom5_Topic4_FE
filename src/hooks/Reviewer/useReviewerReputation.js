import { useState, useEffect, useCallback } from 'react';
import { reviewerApi } from '../../api/reviewerService';

export const useReviewerReputation = () => {
  const [reputationData, setReputationData] = useState({ currentScore: 0, logs: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReputation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reviewerApi.getReputation();
      setReputationData(data || { currentScore: 0, logs: [] });
    } catch (err) {
      console.error("Lỗi lấy điểm tín nhiệm:", err);
      setError("Không thể tải dữ liệu điểm tín nhiệm lúc này.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReputation();
  }, [fetchReputation]);

  return { reputationData, loading, error, fetchReputation };
};