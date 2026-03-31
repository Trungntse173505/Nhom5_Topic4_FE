import { useState } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useReportMissingLabel = () => {
  const [isReporting, setIsReporting] = useState(false);

  const reportMissing = async (taskId, reason, evidenceImages = []) => {
    setIsReporting(true);
    try {
      const res = await annotatorApi.reportMissingLabel(taskId, {
        reason,
        evidenceImages
      });
      setIsReporting(false);
      return { success: true, data: res.data };
    } catch (err) {
      setIsReporting(false);
      return { 
        success: false, 
        error: err?.response?.data || "Có lỗi xảy ra khi báo cáo thiếu Label." 
      };
    }
  };

  return { reportMissing, isReporting };
};