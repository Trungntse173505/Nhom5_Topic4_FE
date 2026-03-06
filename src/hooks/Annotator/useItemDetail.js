import { useState, useCallback } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useItemDetail = () => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Hàm lấy tọa độ và thông tin của 1 ảnh duy nhất
   * @param {string} itemId - ID của tấm ảnh (Lấy từ mảng taskItems)
   */
  const getItem = useCallback(async (itemId) => {
    if (!itemId) return;

    setLoading(true);
    setError(null);
    try {
      // Gọi API GET /api/task-items/{itemId} trên Azure
      const data = await annotatorApi.getItemDetail(itemId);
      // Data trả về chứa itemID, filePath và mảng annotations (tọa độ cũ)
      setItem(data);
      return data;
    } catch (err) {
      const errorMsg = err?.response?.data || "Không tìm thấy ảnh hoặc dữ liệu.";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    getItem,    // Hàm để gọi khi người dùng click vào 1 tấm ảnh
    item,       // Dữ liệu ảnh hiện tại (bao gồm tọa độ)
    loading,    // Trạng thái đang tải từ Azure
    error       // Thông báo lỗi (ví dụ: "Không tìm thấy ảnh hoặc dữ liệu")
  };
};