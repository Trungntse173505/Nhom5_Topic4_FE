import axiosClient from './axiosClient';

const authFirstLoginApi = {
  changePasswordFirstLogin: (payload) =>
    axiosClient.post('/api/Auth/change-password-first-login', payload),
};

export default authFirstLoginApi;

