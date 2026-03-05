import { useState } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useFlagItem = () => {
  const [isFlagging, setIsFlagging] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Hàm đánh dấu ảnh bị lỗi (đen, mờ, hỏng...)
   * @param {string} itemId - ID của tấm ảnh cần báo lỗi
   */
  const flag = async (itemId) => {
    if (!itemId) return;

    setIsFlagging(true);
    setError(null);
    try {
      // Gọi API PATCH lên Azure để chuyển trạng thái ảnh sang IsFlagged = true
      const response = await annotatorApi.flagItem(itemId);
      
      // Trả về thông báo thành công: { message: "Đã đánh dấu ảnh bị lỗi" }
      return response;
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Không thể báo lỗi ảnh này.";
      setError(errorMsg);
      throw err;
    } finally {
      setIsFlagging(false);
    }
  };

  return { 
    flag,        // Hàm thực hiện báo lỗi
    isFlagging,  // Trạng thái đang xử lý
    error       
  };
};