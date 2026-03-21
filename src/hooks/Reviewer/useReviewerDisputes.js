import { useState, useEffect, useCallback } from 'react';
import { reviewerApi } from '../../api/reviewerService';

export const useReviewerDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDisputes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await reviewerApi.getDisputes();
      const data = response.data || response;
      setDisputes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khiếu nại:", error);
      setDisputes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  return { disputes, isLoading, fetchDisputes };
};