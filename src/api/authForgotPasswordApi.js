import axiosClient from './axiosClient';

const authForgotPasswordApi = {
    forgotPassword: (payload) => axiosClient.post('/api/Auth/forgot-password', payload),
};
export default authForgotPasswordApi;
