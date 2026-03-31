import { useState, useEffect, useCallback } from "react";
import {
  getProjectDisputes,
  getDisputeDetail,
  updateDisputeAction,
} from "../../api/managerApi";

export const useDisputeResolution = (projectId) => {
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Gọi API 1: Lấy danh sách hàng chờ
  const fetchDisputes = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const res = await getProjectDisputes(projectId);
      setDisputes(res?.data || res || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách khiếu nại:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  // Gọi API 2: Lấy chi tiết khi click vào 1 item
  const fetchDetail = async (disputeId) => {
    setIsDetailLoading(true);
    try {
      const res = await getDisputeDetail(disputeId);
      setSelectedDispute(res?.data || res);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Gọi API 3: Xử lý khiếu nại (Approve / Reject)
  const handleAction = async (disputeId, action) => {
    if (!disputeId) return;
    setIsActionLoading(true);
    try {
      await updateDisputeAction(disputeId, action);
      alert(`Đã xử lý khiếu nại thành công (${action})!`);
      setSelectedDispute(null); // Đóng form chi tiết
      await fetchDisputes(); // Load lại danh sách bên trái
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    disputes,
    selectedDispute,
    isLoading,
    isDetailLoading,
    isActionLoading,
    fetchDetail,
    handleAction,
  };
};
