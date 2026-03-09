import { useCallback, useState } from 'react';
import authForgotPasswordApi from '../../api/authForgotPasswordApi';

const ENDPOINT_CANDIDATES = [
  '/api/Auth/forgot-password'
];

const buildPayload = ({ email }) => {
  const value = String(email ?? '').trim();
  return { email: value, Email: value };
};

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const forgotPassword = useCallback(async ({ email }) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const payload = buildPayload({ email });

      let lastError;
      for (let i = 0; i < ENDPOINT_CANDIDATES.length; i += 1) {
        const url = ENDPOINT_CANDIDATES[i];
        try {
          const silent = i > 0;
          const res = silent
            ? await authForgotPasswordApi.forgotPasswordWithUrl(url, payload, { silent: true })
            : await authForgotPasswordApi.forgotPasswordWithUrl(url, payload);
          setData(res);
          return { success: true, data: res };
        } catch (err) {
          lastError = err;
          const status = err?.response?.status ?? null;
          if (status !== 404) break;
        }
      }

      throw lastError;
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
