import { useCallback, useState } from 'react';
import authFirstLoginApi from '../../api/authFirstLoginApi';

const readCurrentUserId = () => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const id = parsed?.id ?? parsed?.userId ?? parsed?.userID ?? null;
    return id ? String(id) : null;
  } catch {
    return null;
  }
};

const firstLoginPromptKey = (userId) => `first_login_change_password_prompt_seen:${String(userId)}`;

const buildPayload = ({ oldPassword, newPassword }) => {
  const oldPw = oldPassword ?? '';
  const newPw = newPassword ?? '';

  return {
    oldPassword: oldPw,
    OldPassword: oldPw,
    currentPassword: oldPw,
    CurrentPassword: oldPw,
    newPassword: newPw,
    NewPassword: newPw,
    password: newPw,
    Password: newPw,
  };
};

export const useChangePasswordFirstLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const shouldPromptForCurrentUser = useCallback(() => {
    const userId = readCurrentUserId();
    if (!userId) return false;
    return localStorage.getItem(firstLoginPromptKey(userId)) !== '1';
  }, []);

  const markPromptSeenForCurrentUser = useCallback(() => {
    const userId = readCurrentUserId();
    if (!userId) return;
    localStorage.setItem(firstLoginPromptKey(userId), '1');
  }, []);

  const changePasswordFirstLogin = useCallback(async ({ oldPassword, newPassword }) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const payload = buildPayload({ oldPassword, newPassword });
      const res = await authFirstLoginApi.changePasswordFirstLogin(payload);
      setData(res);
      return { success: true, data: res };
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.message ||
        'Đổi mật khẩu thất bại.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    shouldPromptForCurrentUser,
    markPromptSeenForCurrentUser,
    changePasswordFirstLogin,
    loading,
    error,
    data,
    setError,
  };
};
