import { useCallback, useMemo, useState } from 'react';
import { useResetPassword } from './useResetPassword';

const extractValue = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).length > 0) return String(v);
  }
  return null;
};

export const useResetPasswordModal = ({ open, email, onSuccess, onClose }) => {
  const { resetPassword, loading, error, data, setError } = useResetPassword();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ otp: false, newPassword: false, confirmPassword: false });

  const emailValue = useMemo(() => String(email ?? '').trim(), [email]);

  const reset = useCallback(() => {
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setTouched({ otp: false, newPassword: false, confirmPassword: false });
    setError(null);
  }, [setError]);

  const close = useCallback(() => {
    reset();
    onClose?.();
  }, [reset, onClose]);

  const fieldError = useMemo(() => {
    const next = {};
    const otpValue = String(otp || '').trim();

    if (touched.otp && !otpValue) next.otp = 'Vui lòng nhập OTP.';
    if (touched.newPassword) {
      if (!newPassword) next.newPassword = 'Vui lòng nhập mật khẩu mới.';
      else if (String(newPassword).length < 5) next.newPassword = 'Mật khẩu phải có ít nhất 5 ký tự.';
    }
    if (touched.confirmPassword) {
      if (!confirmPassword) next.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
      else if (confirmPassword !== newPassword) next.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    return next;
  }, [otp, newPassword, confirmPassword, touched]);

  const canSubmit = useMemo(() => {
    if (!open || loading) return false;
    if (!emailValue) return false;
    if (!String(otp || '').trim()) return false;
    if (!String(newPassword || '')) return false;
    if (confirmPassword !== newPassword) return false;
    return Object.keys(fieldError).length === 0;
  }, [open, loading, emailValue, otp, newPassword, confirmPassword, fieldError]);

  const successMessage = useMemo(() => {
    if (!data) return null;
    return data?.message ?? 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.';
  }, [data]);

  const responseFields = useMemo(() => {
    if (!data) return null;
    return {
      email: extractValue(data, ['email', 'Email']),
      otp: extractValue(data, ['otp', 'OTP', 'token', 'Token']),
      password: extractValue(data, ['password', 'Password', 'newPassword', 'NewPassword']),
    };
  }, [data]);

  const touchAll = useCallback(() => {
    setTouched({ otp: true, newPassword: true, confirmPassword: true });
  }, []);

  const touchField = useCallback((key) => {
    setTouched((t) => ({ ...t, [key]: true }));
  }, []);

  const onBlurOtp = useCallback(() => touchField('otp'), [touchField]);
  const onBlurNewPassword = useCallback(() => touchField('newPassword'), [touchField]);
  const onBlurConfirmPassword = useCallback(() => touchField('confirmPassword'), [touchField]);

  const onChangeOtp = useCallback((value) => setOtp(value), []);
  const onChangeNewPassword = useCallback((value) => setNewPassword(value), []);
  const onChangeConfirmPassword = useCallback((value) => setConfirmPassword(value), []);

  const submit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (!canSubmit) {
        touchAll();
        return { success: false };
      }

      const res = await resetPassword({ email: emailValue, otp, newPassword });
      if (res.success) {
        const msg = res?.data?.message ?? 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.';
        window.alert(msg);
        onSuccess?.(res.data);
      }
      return res;
    },
    [canSubmit, touchAll, resetPassword, emailValue, otp, newPassword, onSuccess],
  );

  return {
    emailValue,
    otp,
    newPassword,
    confirmPassword,
    fieldError,
    canSubmit,
    loading,
    error,
    successMessage,
    responseFields,
    close,
    onBlurOtp,
    onBlurNewPassword,
    onBlurConfirmPassword,
    onChangeOtp,
    onChangeNewPassword,
    onChangeConfirmPassword,
    submit,
  };
};
