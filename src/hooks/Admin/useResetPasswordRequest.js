import { useCallback, useState } from 'react';
import authResetPasswordApi from '../../api/authResetPasswordApi';

const buildPayload = ({ email }) => {
  const value = String(email ?? '').trim();
  return { email: value, Email: value };
};

export const useResetPasswordRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const requestResetPassword = useCallback(async ({ email }) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const payload = buildPayload({ email });
      const res = await authResetPasswordApi.resetPassword(payload);
      setData(res);
      return { success: true, data: res };
    } catch (err) {
      const status = err?.response?.status ?? null;
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.message ||
        (status === 404 ? 'API reset-password không tồn tại (404).' : 'Gửi yêu cầu reset mật khẩu thất bại.');
      setError(msg);
      return { success: false, error: msg, status };
    } finally {
      setLoading(false);
    }
  }, []);

  return { requestResetPassword, loading, error, data, setError };
};

