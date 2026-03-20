import { useCallback, useState } from 'react';
import authFirstLoginApi from '../../api/authFirstLoginApi';

const buildPayload = ({ oldPassword, newPassword }) => ({
  oldPassword: oldPassword ?? '',
  newPassword: newPassword ?? '',
});

export const useChangePasswordFirstLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const changePasswordFirstLogin = useCallback(async ({ oldPassword, newPassword }) => {
    setLoading(true);
    setError(null);

    try {
      const payload = buildPayload({ oldPassword, newPassword });
      const res = await authFirstLoginApi.changePasswordFirstLogin(payload);
      return { success: true, data: res };
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Đổi mật khẩu thất bại.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    changePasswordFirstLogin,
    loading,
    error,
  };
};
