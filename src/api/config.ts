import axios from 'axios';

const BASE_URL = 'https://swp-be-efc9d4and2d9fda3.japaneast-01.azurewebsites.net';

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
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`Lỗi hệ thống (${status}):`, data.message || "Đã có lỗi xảy ra");

      if (status === 401) {
        console.warn("Phiên làm việc hết hạn, đang đăng xuất...");
        localStorage.removeItem('token');
      }
    } else {
      console.error("Lỗi kết nối: Server Azure có thể đang khởi động lại.");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;