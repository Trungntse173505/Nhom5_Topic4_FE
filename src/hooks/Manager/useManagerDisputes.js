import { useState, useEffect, useCallback } from 'react';
import { managerDisputeApi } from '../../api/managerDisputeApi';

export const useManagerDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // Lấy danh sách Disputes
  const fetchDisputes = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const data = await managerDisputeApi.getAllDisputes();
      // Lọc ưu tiên hiển thị trạng thái Pending lên đầu
      setDisputes(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khiếu nại:", error);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  // Lấy chi tiết 1 Dispute
  const fetchDisputeDetail = async (disputeId) => {
    setIsLoadingDetail(true);
    try {
      const data = await managerDisputeApi.getDisputeDetail(disputeId);
      setSelectedDispute(data);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết khiếu nại:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Xử lý Accept/Reject
  const resolveDispute = async (disputeId, action) => {
    setIsResolving(true);
    try {
      await managerDisputeApi.resolveDispute(disputeId, action);
      // Xử lý thành công -> Tải lại danh sách & Xóa selected
      await fetchDisputes();
      setSelectedDispute(null);
      alert(action === 'accept' ? 'Đã chấp thuận khiếu nại (Annotator thắng)!' : 'Đã từ chối khiếu nại (Reviewer thắng)!');
    } catch (error) {
      console.error(`Lỗi khi ${action} khiếu nại:`, error);
      alert('Có lỗi xảy ra khi xử lý!');
    } finally {
      setIsResolving(false);
    }
  };

  // Tự động fetch danh sách lần đầu mount hook
  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  return {
    disputes,
    selectedDispute,
    isLoadingList,
    isLoadingDetail,
    isResolving,
    fetchDisputeDetail,
    resolveDispute
  };
};