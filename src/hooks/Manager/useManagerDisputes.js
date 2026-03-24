import { useState, useEffect, useCallback } from 'react';
import { managerDisputeApi } from '../../api/managerDisputeApi';

export const useManagerDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const fetchDisputes = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const data = await managerDisputeApi.getAllDisputes();
      setDisputes(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khiếu nại:", error);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

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

  const resolveDispute = async (disputeId, action, comment) => {
    setIsResolving(true);
    try {
      await managerDisputeApi.resolveDispute(disputeId, action, comment);
      await fetchDisputes();
      setSelectedDispute(null);
      return true; 
    } catch (error) {
      console.error(`Lỗi khi ${action} khiếu nại:`, error);
      throw error; 
    } finally {
      setIsResolving(false);
    }
  };

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