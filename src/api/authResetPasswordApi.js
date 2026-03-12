import axiosClient from './axiosClient';

const authResetPasswordApi = {
  // Đặt lại mật khẩu mới bằng token/mã xác nhận (POST)
  resetPassword: (payload, config) => axiosClient.post('/api/Auth/reset-password', payload, config),
};

export default authResetPasswordApi;