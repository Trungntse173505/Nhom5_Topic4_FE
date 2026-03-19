import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const token = useMemo(() => String(searchParams.get('token') ?? '').trim(), [searchParams]);
  const tokenMissing = useMemo(() => !token, [token]);

  const fieldError = useMemo(() => {
    const next = {};

    if (touched.newPassword) {
      if (!newPassword) next.newPassword = 'Vui lòng nhập mật khẩu mới.';
      else if (String(newPassword).length < 6) next.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    if (touched.confirmPassword) {
      if (!confirmPassword) next.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
      else if (confirmPassword !== newPassword) next.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    return next;
  }, [newPassword, confirmPassword, touched]);

  const canSubmit = useMemo(() => {
    if (tokenMissing || loading) return false;
    if (!String(newPassword || '')) return false;
    if (confirmPassword !== newPassword) return false;
    return Object.keys(fieldError).length === 0;
  }, [tokenMissing, loading, newPassword, confirmPassword, fieldError]);

  const successMessage = useMemo(() => {
    if (!data) return null;
    return data?.message ?? 'Đổi mật khẩu lần đầu thành công. Bạn có thể đăng nhập lại.';
  }, [data]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((value) => !value);
  }, []);

  const touchField = useCallback((key) => {
    setTouched((current) => ({ ...current, [key]: true }));
  }, []);

  const onBlurNewPassword = useCallback(() => touchField('newPassword'), [touchField]);
  const onBlurConfirmPassword = useCallback(() => touchField('confirmPassword'), [touchField]);

  const onChangeNewPassword = useCallback((value) => setNewPassword(value), []);
  const onChangeConfirmPassword = useCallback((value) => setConfirmPassword(value), []);

  const touchAll = useCallback(() => {
    setTouched({
      newPassword: true,
      confirmPassword: true,
    });
  }, []);

  const goToLogin = useCallback(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

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

  const submit = useCallback(
    async (e) => {
      e?.preventDefault?.();

      if (!canSubmit) {
        touchAll();
        return { success: false };
      }

      const res = await resetPasswordByToken({ token, newPassword });
      return res;
    },
    [canSubmit, touchAll, resetPasswordByToken, token, newPassword]
  );

  return {
    token,
    tokenMissing,
    newPassword,
    confirmPassword,
    showPassword,
    toggleShowPassword,
    fieldError,
    canSubmit,
    loading,
    error,
    successMessage,
    onBlurNewPassword,
    onBlurConfirmPassword,
    onChangeNewPassword,
    onChangeConfirmPassword,
    submit,
    goToLogin,
  };
};
