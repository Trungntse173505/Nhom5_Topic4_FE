import { useCallback, useState } from 'react';
import authForgotPasswordApi from '../../api/authForgotPasswordApi';

const extractErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  const msg =
    data?.message ||
    data?.Message ||
    (typeof data === 'string' ? data : null) ||
    null;
  if (msg) return String(msg);

  const errors = data?.errors;
  if (errors && typeof errors === 'object') {
    const parts = Object.values(errors)
      .flat()
      .filter(Boolean)
      .map((x) => String(x));
    if (parts.length) return parts.join(' ');
  }

  return err?.message ? String(err.message) : fallback;
};

const buildPayload = ({ email }) => {
  const value = String(email ?? '').trim();
  return { email: value };
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
      const res = await authForgotPasswordApi.forgotPassword(payload);
      setData(res);
      return { success: true, data: res };
    } catch (err) {
      const status = err?.response?.status ?? null;
      const fallback =
        status === 404 ? 'API forgot-password không tồn tại (404).' : 'Gửi yêu cầu quên mật khẩu thất bại.';
      const msg = extractErrorMessage(err, fallback);
      setError(msg);
      return { success: false, error: msg, status };
    } finally {
      setLoading(false);
    }
  }, []);

  return { forgotPassword, loading, error, data, setError };
};
