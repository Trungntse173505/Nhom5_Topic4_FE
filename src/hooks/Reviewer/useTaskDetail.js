import { useState, useEffect, useCallback } from "react";
import { reviewerApi } from "../../api/reviewerService";

export const useTaskDetail = (taskId) => {
  const [taskDetail, setTaskDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTaskDetail = useCallback(async () => {
    if (!taskId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await reviewerApi.getTaskDetail(taskId);
      setTaskDetail(data);
    } catch (err) {
      setError(err?.message || "Có lỗi xảy ra khi lấy chi tiết Task.");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTaskDetail();
  }, [fetchTaskDetail]);

  // ĐÃ FIX: Nhận thẳng `targetStatus` (true/false) và KHÔNG ĐẢO NGƯỢC NỮA
  const toggleAnnotationApproval = async (idDetail, targetStatus) => {
    try {
      // Gọi API báo cho Backend biết trạng thái (Đúng là true, Sai là false)
      await reviewerApi.checkItemDetail(idDetail, targetStatus);

      // Cập nhật UI ngay lập tức
      setTaskDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) => ({
            ...item,
            annotations: item.annotations.map((ann) =>
              ann.idDetail === idDetail
                ? { ...ann, isApproved: targetStatus }
                : ann,
            ),
          })),
        };
      });
      return true;
    } catch (err) {
      console.error("Lỗi khi đánh dấu annotation:", err);
      return false;
    }
  };

  return {
    taskDetail,
    isLoading,
    error,
    refetch: fetchTaskDetail,
    toggleAnnotationApproval,
  };
};
