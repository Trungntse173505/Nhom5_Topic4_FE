import axiosClient from './axiosClient';

const authResetPasswordApi = {
  resetPassword: (payload, config) => axiosClient.post('/api/Auth/reset-password', payload, config),
};

export default authResetPasswordApi;

