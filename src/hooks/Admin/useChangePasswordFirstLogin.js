import { useCallback, useState } from 'react';
import authFirstLoginApi from '../../api/authFirstLoginApi';

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

  return { changePasswordFirstLogin, loading, error, data, setError };
};

