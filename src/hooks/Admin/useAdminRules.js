// src/hooks/useAdminRules.js
import { useState, useEffect, useCallback } from 'react';
import adminRuleApi from '../api/adminRuleApi';

export const useAdminRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Hàm gọi API lấy danh sách rules
  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminRuleApi.getAllRules();
      // axiosClient thường trả thẳng data, tuỳ cấu hình của bạn
      setRules(response.data || response); 
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra khi tải danh sách Rules');
      console.error('Fetch rules failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hàm gọi API cập nhật rule
  const updateRule = async (ruleId, updatedData) => {
    setIsUpdating(true);
    setError(null);
    try {
      await adminRuleApi.updateRule(ruleId, updatedData);
      
      // Cập nhật lại state local (giao diện) ngay sau khi API thành công
      setRules((prevRules) =>
        prevRules.map((rule) =>
          rule.ruleID === ruleId ? { ...rule, ...updatedData } : rule
        )
      );
      
      return { success: true };
    } catch (err) {
      const errMsg = err.message || 'Cập nhật Rule thất bại';
      setError(errMsg);
      console.error('Update rule failed:', err);
      return { success: false, error: errMsg };
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return {
    rules,
    loading,
    error,
    isUpdating,
    fetchRules,
    updateRule,
  };
};