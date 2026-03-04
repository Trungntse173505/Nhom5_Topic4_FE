import axiosClient from './axiosClient';

const systemConfigApi = {
  getSystemConfigs: (config) => {
    const url = '/api/admin/system-configs';
    return axiosClient.get(url, config);
  },
  updateConfigs: (id, data, config) => {
    const url = `/api/admin/update-configs/${encodeURIComponent(id)}`;
    return axiosClient.put(url, data, config);
  },
};

export default systemConfigApi;
