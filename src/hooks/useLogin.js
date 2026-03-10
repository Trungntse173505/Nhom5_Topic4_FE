import { useState } from 'react';
import authApi from '../api/authApi';

const pick = (obj, keys) => {
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) return obj[k];
  }
  return undefined;
};

const normalizeLoginResponse = (apiRes) => {
  const raw = apiRes?.data ?? apiRes;
  const data = raw?.data ?? raw;
  const success = pick(raw, ['success', 'Success']);

  const token = pick(data, ['token', 'Token']) ?? pick(raw, ['token', 'Token']);
  const user = pick(data, ['user', 'User']) ?? pick(raw, ['user', 'User']);
  const requirePasswordChangeRaw =
    pick(raw, [
      'requirePasswordChange',
      'RequirePasswordChange',
      'mustChangePassword',
      'MustChangePassword',
      'forcePasswordChange',
      'ForcePasswordChange',
    ]) ??
    pick(data, [
      'requirePasswordChange',
      'RequirePasswordChange',
      'mustChangePassword',
      'MustChangePassword',
      'forcePasswordChange',
      'ForcePasswordChange',
    ]) ??
    pick(user, [
      'requirePasswordChange',
      'RequirePasswordChange',
      'mustChangePassword',
      'MustChangePassword',
      'forcePasswordChange',
      'ForcePasswordChange',
    ]);
  const requirePasswordChange = Boolean(requirePasswordChangeRaw);

  const message =
    pick(raw, ['message', 'Message']) ??
    pick(data, ['message', 'Message']) ??
    pick(raw?.error, ['message', 'Message']);

  const ok = typeof success === 'boolean' ? success : Boolean(token || user);

  return { ok, token, user, requirePasswordChange, message };
};

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async ({ username, password }) => {
    setLoading(true);
    setError(null);
    try {
      const apiRes = await authApi.loginAuth({ username, password });
      const normalized = normalizeLoginResponse(apiRes);

      if (normalized.ok) {
        const { token, user, requirePasswordChange } = normalized;
        const userWithFlags =
          user && typeof user === 'object'
            ? { ...user, requirePasswordChange }
            : user;

        if (token) localStorage.setItem('token', token);
        if (userWithFlags) {
          localStorage.setItem('user', JSON.stringify({
            id: userWithFlags.userId,    
            role: userWithFlags.roleName, 
            fullName: userWithFlags.fullName 
          }));
        }

        setLoading(false);
        return { success: true, user: userWithFlags, requirePasswordChange };
      } else {
        const msg = normalized.message || "Sai tài khoản hoặc mật khẩu";
        setError(msg);
        return { success: false, error: msg };
      }
    } catch (err) {
      setLoading(false);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        "Đăng nhập thất bại. Kiểm tra lại kết nối Azure.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  return { login, loading, error };
};
