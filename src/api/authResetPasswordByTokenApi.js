import axiosClient from './axiosClient';

const authResetPasswordByTokenApi = {
  // Đặt lại mật khẩu mới bằng token nhận từ email
  resetPasswordByToken: (payload, config) =>
    axiosClient.post('/api/Auth/reset-password-by-token', payload, config),
};

export default authResetPasswordByTokenApi;
