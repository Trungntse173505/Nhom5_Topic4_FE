import { useState, useEffect, useCallback } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useReputation = () => {
  const [reputation, setReputation] = useState({ currentScore: 0, logs: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Hàm lấy thông tin điểm tín nhiệm từ Azure
   */
  const fetchReputation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await annotatorApi.getReputation();    
      // Dữ liệu bao gồm currentScore và mảng logs
      setReputation({
        currentScore: data?.currentScore || 0,
        logs: data?.logs || []
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải thông tin tín nhiệm.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động tải dữ liệu khi component được mount
  useEffect(() => {
    fetchReputation();
  }, [fetchReputation]);

  return { 
    currentScore: reputation.currentScore, // Điểm hiện tại (ví dụ: 100)
    logs: reputation.logs,                 // Lịch sử biến động điểm
    loading, 
    error, 
    refresh: fetchReputation 
  };
};