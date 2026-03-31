import { useState, useCallback } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useItemDetail = () => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Hàm lấy tọa độ và thông tin của 1 ảnh duy nhất
   * @param {string} itemId - ID tấm ảnh (Lấy từ mảng taskItems)
   */
  const getItem = useCallback(async (itemId) => {
    if (!itemId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await annotatorApi.getItemDetail(itemId);
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
    getItem,  
    item,      
    loading,  
    error     
  };
};