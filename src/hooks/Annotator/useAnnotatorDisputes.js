import { useState, useEffect, useCallback } from "react";
import annotatorApi from "../../api/annotatorApi";

export const useAnnotatorDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDisputes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await annotatorApi.getDisputes();
      // Đảm bảo luôn trả về mảng
      setDisputes(res?.data || res || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách khiếu nại:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  return { disputes, isLoading, refresh: fetchDisputes };
};
