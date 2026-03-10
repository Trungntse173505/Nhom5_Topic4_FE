import axiosClient from './axiosClient';

const authForgotPasswordApi = {
  // Yêu cầu gửi email/link khôi phục mật khẩu (POST)
  forgotPassword: (payload, config) => axiosClient.post('/api/Auth/forgot-password', payload, config),
};

export default authForgotPasswordApi;