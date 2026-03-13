import { useState, useEffect } from "react";
import { getUnassignedItems, createBatchTask } from "../../api/managerApi";

export const useWorkDistribution = (projectId, onRefresh) => {
  const [unassignedItems, setUnassignedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const itemsRes = await getUnassignedItems(projectId);
      setUnassignedItems(
        Array.isArray(itemsRes) ? itemsRes : itemsRes.data || [],
      );
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  // CHỈ TẠO TASK, KHÔNG GIAO NGƯỜI
  const createBatch = async (selectedIds, taskName, deadline) => {
    if (!selectedIds.length || !taskName || !deadline) return false;
    setIsProcessing(true);
    try {
      // Chuẩn bị payload đúng Swagger
      const payload = {
        taskName: taskName,
        dataIDs: selectedIds,
        // Chuyển format ngày giờ sang chuẩn ISO theo yêu cầu BE
        deadline: new Date(deadline).toISOString(),
      };

      await createBatchTask(projectId, payload);
      await fetchData();
      if (onRefresh) onRefresh();
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { unassignedItems, isLoading, isProcessing, createBatch };
};
