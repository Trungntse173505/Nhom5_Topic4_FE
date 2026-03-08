import { useCallback, useState } from 'react';
import authForgotPasswordApi from '../../api/authForgotPasswordApi';

const looksLikeEmail = (value) => {
  const v = String(value ?? '').trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

const buildPayload = ({ emailOrUsername }) => {
  const value = String(emailOrUsername ?? '').trim();
  const isEmail = looksLikeEmail(value);

  return isEmail
    ? { email: value, Email: value }
    : { username: value, Username: value, userName: value, UserName: value };
};

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const forgotPassword = useCallback(async ({ emailOrUsername }) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const payload = buildPayload({ emailOrUsername });
      const res = await authForgotPasswordApi.forgotPassword(payload);
      setData(res);
      return { success: true, data: res };
    } catch (err) {
      const status = err?.response?.status ?? null;
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.message ||
        (status === 404 ? 'API forgot-password không tồn tại (404).' : 'Gửi yêu cầu quên mật khẩu thất bại.');
      setError(msg);
      return { success: false, error: msg, status };
    } finally {
      setLoading(false);
    }
  }, []);

  return { forgotPassword, loading, error, data, setError };
};
