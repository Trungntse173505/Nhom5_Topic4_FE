import axiosClient from './axiosClient';

const ENDPOINT_CANDIDATES = [
  '/api/Auth/forgot-password',
  '/api/auth/forgot-password',
  '/api/Auth/forgotPassword',
  '/api/auth/forgotPassword',
  '/api/Auth/ForgotPassword',
  '/api/auth/ForgotPassword',
];

const authForgotPasswordApi = {
  forgotPassword: async (payload) => {
    let lastError;

    for (let i = 0; i < ENDPOINT_CANDIDATES.length; i += 1) {
      const url = ENDPOINT_CANDIDATES[i];
      try {
        const silent = i > 0;
        return await axiosClient.post(url, payload, silent ? { silent: true } : undefined);
      } catch (err) {
        lastError = err;
        const status = err?.response?.status ?? null;
        if (status !== 404) break;
      }
    }

    throw lastError;
  },
};
export default authForgotPasswordApi;
