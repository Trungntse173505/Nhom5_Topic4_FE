import { useState, useEffect, useCallback } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useReputation = () => {
  const [{ currentScore, logs }, setReputation] = useState({ currentScore: 0, logs: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { currentScore = 0, logs = [] } = await annotatorApi.getReputation() || {};
      setReputation({ currentScore, logs });
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải thông tin điểm tín nhiệm.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);
  return { currentScore, logs, loading, error, refresh };
};