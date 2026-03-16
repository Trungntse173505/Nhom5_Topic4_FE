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

  // ĐÃ FIX: Nhận thẳng giá trị (targetStatus) và KHÔNG BAO GIỜ DÙNG DẤU "!" ĐẢO NGƯỢC NỮA
  const toggleAnnotationApproval = async (idDetail, targetStatus) => {
    try {
      // Bấm Đúng là gửi True, Bấm Sai là gửi False
      await reviewerApi.checkItemDetail(idDetail, targetStatus);

      // Cập nhật State cho UI xanh/đỏ chuẩn xác
      setTaskDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) => ({
            ...item,
            annotations: Array.isArray(item.annotations)
              ? item.annotations.map((ann) =>
                  ann.idDetail === idDetail
                    ? { ...ann, isApproved: targetStatus }
                    : ann,
                )
              : item.annotations,
          })),
        };
      });
      return true;
    } catch (err) {
      console.error("Lỗi khi đánh dấu annotation:", err);
      alert("Lỗi kết nối khi chấm điểm!"); // Báo lỗi nếu Backend sập
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
