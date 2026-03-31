import { useState, useEffect, useCallback } from "react";
import { reviewerApi } from "../../api/reviewerService";
import { normalizeLabels } from "../../utils/utils";

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
      
      // 🔥 XỬ LÝ ĐỒNG BỘ DATA GIỮA ANNOTATOR VÀ REVIEWER TẠI ĐÂY
      const rawItems = data?.items || data?.taskItems || [];
      const normalizedItems = rawItems.map(item => ({
        ...item,
        annotations: (item.annotations || []).map(ann => {
          const rawStatus = String(ann.isApproved || ann.IsApproved).toLowerCase();
          
          let finalStatus = null; // Mặc định null = Chờ duyệt
          
          if (rawStatus === 'true') {
            finalStatus = true; // Reviewer đã chấm Đúng
          } else if (rawStatus === 'false') {
            finalStatus = false; // Reviewer đã chấm Sai
          } else if (rawStatus === 'complete') {
            finalStatus = null; // Annotator vừa nộp, chờ Reviewer chấm
          }
          
          return {
            ...ann,
            isApproved: finalStatus 
          };
        })
      }));

      setTaskDetail({
        ...data,
        items: normalizedItems, 
        availableLabels: normalizeLabels(data?.availableLabels || []),
      });
    } catch (err) {
      setError(err?.message || "Có lỗi xảy ra khi lấy chi tiết Task.");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTaskDetail();
  }, [fetchTaskDetail]);

  const toggleAnnotationApproval = async (idDetail, targetStatus) => {
    try {
      await reviewerApi.checkItemDetail(idDetail, targetStatus);

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
      alert("Lỗi kết nối khi chấm điểm!"); 
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