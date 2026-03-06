import { useState, useEffect, useCallback } from 'react';
import { reviewerApi } from '../../api/reviewerService';

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
      setError(err?.message || 'Có lỗi xảy ra khi lấy chi tiết Task.');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTaskDetail();
  }, [fetchTaskDetail]);

  // Bổ sung thêm một số Helper Functions (Hàm hỗ trợ) để Frontend gọi cho tiện
  
  // 1. Hàm cập nhật lại state "isApproved" của 1 annotation (điểm vẽ) NGAY TRÊN UI (không cần gọi lại toàn bộ API lấy list)
  const toggleAnnotationApproval = async (idDetail, currentStatus) => {
    try {
       // Gọi API báo cho Backend biết là Reviewer vừa bấm "Check đúng/sai"
       await reviewerApi.checkItemDetail(idDetail, !currentStatus);

       // Cập nhật lại State cục bộ (UI tự đổi màu ngay lập tức mà không bị giật lag)
       setTaskDetail(prev => {
          if (!prev) return prev;
          return {
             ...prev,
             items: prev.items.map(item => ({
                ...item,
                annotations: item.annotations.map(ann => 
                   ann.idDetail === idDetail ? { ...ann, isApproved: !currentStatus } : ann
                )
             }))
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
    toggleAnnotationApproval
  };
};