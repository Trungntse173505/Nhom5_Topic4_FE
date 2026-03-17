import { useCallback, useState } from 'react';
import authResetPasswordApi from '../../api/authResetPasswordApi';

const buildPayload = ({ email, otp, newPassword }) => {
  const emailValue = String(email ?? '').trim();
  const otpValue = String(otp ?? '').trim();
  const newPasswordValue = String(newPassword ?? '');

  return {
    email: emailValue,
    otp: otpValue,
    newPassword: newPasswordValue,
  };
};

const extractErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  const msg =
    data?.message ||
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

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const resetPassword = useCallback(async ({ email, otp, newPassword }) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const payload = buildPayload({ email, otp, newPassword });
      const res = await authResetPasswordApi.resetPassword(payload);
      setData(res);
      return { success: true, data: res };
    } catch (err) {
      const status = err?.response?.status ?? null;
      const fallback =
        status === 404 ? 'API reset-password không tồn tại (404).' : 'Đặt lại mật khẩu thất bại.';
      const msg = extractErrorMessage(err, fallback);
      setError(msg);
      return { success: false, error: msg, status };
    } finally {
      setLoading(false);
    }
  }, []);

  return { resetPassword, loading, error, data, setError };
};
