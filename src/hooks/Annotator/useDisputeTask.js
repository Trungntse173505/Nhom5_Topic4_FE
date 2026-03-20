import { useState } from "react";
import annotatorApi from "../../api/annotatorApi";

export const useDisputeTask = () => {
  const [isDisputing, setIsDisputing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Hàm gửi khiếu nại cho một Task bị chấm sai
   * @param {string} taskId - ID của Task cần khiếu nại
   * @param {string} reason - Lý do khiếu nại (ví dụ: "Ảnh số 3 tôi gán nhãn đúng theo quy định...")
   * @param {Array<string>} evidenceUrls - Mảng chứa các link ảnh bằng chứng (từ Cloudinary)
   */
  const dispute = async (taskId, reason, evidenceUrls = []) => {
    if (!taskId || !reason) return;

    setIsDisputing(true);
    setError(null);
    try {
      // 👉 Gói thêm evidenceImages vào túi đồ gửi cho Backend
      const response = await annotatorApi.disputeTask(taskId, {
        reason: reason,
        evidenceImages: evidenceUrls,
      });
      return response;
    } catch (err) {
      const errorMsg =
        err?.response?.data || "Không thể gửi khiếu nại lúc này.";
      setError(errorMsg);
      throw err;
    } finally {
      setIsDisputing(false);
    }
  };

  return {
    dispute,
    isDisputing,
    error,
  };
};
