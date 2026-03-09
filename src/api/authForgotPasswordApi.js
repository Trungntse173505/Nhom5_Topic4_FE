import axiosClient from './axiosClient';

const authForgotPasswordApi = {
    forgotPassword: (payload, config) => axiosClient.post('/api/Auth/forgot-password', payload, config),
    forgotPasswordWithUrl: (url, payload, config) => axiosClient.post(url, payload, config),
};
export default authForgotPasswordApi;
