import { useState, useEffect, useCallback } from 'react';
import { reviewerApi } from '../../api/reviewerService';

export const useReviewerDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDisputes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reviewerApi.getDisputes();
      setDisputes(data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khiếu nại:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  return { disputes, isLoading, fetchDisputes };
};