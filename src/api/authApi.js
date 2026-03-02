import axiosClient from './axiosClient';

const authApi = {
  loginAuth: (payload) => axiosClient.post('/api/Auth/login', payload),
};

export default authApi;