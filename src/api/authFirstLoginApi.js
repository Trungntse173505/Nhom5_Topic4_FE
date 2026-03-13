import axiosClient from './axiosClient';

const authFirstLoginApi = {

  // Thay đổi mật khẩu bắt buộc trong lần đăng nhập đầu tiên
  changePasswordFirstLogin: (payload) => axiosClient.post('/api/Auth/change-password-first-login', payload),
};

export default authFirstLoginApi;