import { useState } from 'react';
import annotatorApi from '../../api/annotatorApi';

export const useSaveAnnotation = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  /**
   * @param {string} itemId - ID tấm ảnh
   * @param {object} payload - Dữ liệu { annotations: [...] }
   */
  const save = async (itemId, payload) => {
    if (!itemId) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await annotatorApi.saveAnnotation(itemId, payload);
      return response;
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.response?.data || "Network Error";
      setError(errorMsg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return { save, isSaving, error };
};