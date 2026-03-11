
import axiosClient from './axiosClient';

const adminRuleApi = {
  // Lấy danh sách tất cả các rules
  getAllRules: () => {
    const url = '/api/admin/rules';
    return axiosClient.get(url);
  },

  // Cập nhật một rule cụ thể
  updateRule: (ruleId, data) => {
    const url = `/api/admin/rules/${ruleId}`;
    return axiosClient.put(url, {
      value: data.value,
      description: data.description,
      isActive: data.isActive
    });
  }
};

export default adminRuleApi;