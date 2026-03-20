import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;


const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor cho Request: Tự động đính kèm Token
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

// Interceptor cho Response: Xử lý data và lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isSilent = Boolean(error?.config?.silent || error?.config?.meta?.silent);
    
    if (error.response) {
      const { status, data } = error.response;

      if (!isSilent) {
        console.error(`Lỗi hệ thống (${status}):`, data?.message || "Đã có lỗi xảy ra");
      }

      if (status === 401) {
        if (!isSilent) console.warn("Phiên làm việc hết hạn, đang đăng xuất...");
        localStorage.removeItem('token');
        // Có thể thêm logic chuyển hướng về trang login ở đây nếu cần
      }
    } else {
      if (!isSilent) console.error("Lỗi kết nối: Server Azure có thể đang khởi động lại.");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
