import { useCallback, useState } from 'react';
import authResetPasswordByTokenApi from '../../api/authResetPasswordByTokenApi';

const buildPayload = ({ token, newPassword }) => {
  const tokenValue = String(token ?? '').trim();
  const newPasswordValue = String(newPassword ?? '');

  return {
    token: tokenValue,
    newPassword: newPasswordValue,
  };
};

const extractErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  const msg = data?.message || (typeof data === 'string' ? data : null) || null;
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

export const useResetPasswordByToken = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const resetPasswordByToken = useCallback(async ({ token, newPassword }) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const payload = buildPayload({ token, newPassword });
      const res = await authResetPasswordByTokenApi.resetPasswordByToken(payload);
      setData(res);
      return { success: true, data: res };
    } catch (err) {
      const status = err?.response?.status ?? null;
      const fallback =
        status === 404
          ? 'API reset-password-by-token không tồn tại (404).'
          : 'Đổi mật khẩu lần đầu thất bại.';
      const msg = extractErrorMessage(err, fallback);
      setError(msg);
      return { success: false, error: msg, status };
    } finally {
      setLoading(false);
    }
  }, []);

  return { resetPasswordByToken, loading, error, data, setError };
};
