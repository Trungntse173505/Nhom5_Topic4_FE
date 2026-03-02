import axiosClient from './axiosClient';

const authApi = {
  loginAuth: (payload) => axiosClient.post('/api/Auth/login', payload),
  loginAuthLower: (payload) => axiosClient.post('/api/auth/login', payload),
};

export default authApi;

