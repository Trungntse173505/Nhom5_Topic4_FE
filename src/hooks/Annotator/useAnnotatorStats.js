import { useState, useEffect } from 'react';
import annotatorApi from '../../api/annotatorApi'; // Import default

export const useAnnotatorStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await annotatorApi.getStats();
        // axiosClient thường trả về thẳng data, nếu không thì dùng response.data
        setStats(response.data || response); 
      } catch (err) {
        setError(err.message || "Lỗi tải thống kê Annotator");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};