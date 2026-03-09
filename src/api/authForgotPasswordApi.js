import axiosClient from './axiosClient';

const authForgotPasswordApi = {
    forgotPassword: (payload, config) => axiosClient.post('/api/Auth/forgot-password', payload, config),
};
export default authForgotPasswordApi;
