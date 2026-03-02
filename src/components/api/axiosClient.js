import axios from 'axios';

const DEFAULT_BASE_URL = 'https://swp-be-efc9d4and2d9fda3.japaneast-01.azurewebsites.net';
const RAW_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL;
const BASE_URL = String(RAW_BASE_URL).replace(/\/+$/, '');

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});


axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const isSilent = Boolean(error?.config?.silent || error?.config?.meta?.silent);
    if (error.response) {
      const { status, data } = error.response;

      if (!isSilent) {
        console.error(`Lỗi hệ thống (${status}):`, data?.message || data?.Message || "Đã có lỗi xảy ra");
      }

      if (status === 401) {
        if (!isSilent) console.warn("Phiên làm việc hết hạn, đang đăng xuất...");
        localStorage.removeItem('token');
      }
    } else {
      if (!isSilent) console.error("Lỗi kết nối: Server Azure có thể đang khởi động lại.");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
