import { useState } from 'react';
import authApi from '../api/authApi';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async ({ username, password }) => {
    setLoading(true);
    setError(null);
    try {
      const apiRes = await authApi.loginAuth({ username, password });
      if (apiRes.success && apiRes.data) {
        const { token, user } = apiRes.data; 

        if (token) localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify({
            id: user.userId,    
            role: user.roleName, 
            fullName: user.fullName 
          }));
        }

        setLoading(false);
        return { success: true, user: user }; 
      } else {
        const msg = apiRes.message || "Sai tài khoản hoặc mật khẩu";
        setError(msg);
        return { success: false, error: msg };
      }
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || "Đăng nhập thất bại. Kiểm tra lại kết nối Azure.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  return { login, loading, error };
};