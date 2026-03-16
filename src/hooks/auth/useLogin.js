import { useState } from 'react';
import authApi from '../../api/authApi';

const pick = (obj, keys) => {
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) return obj[k];
  }
  return undefined;
};

const pickFirst = (sources, keys) => {
  for (let i = 0; i < sources.length; i += 1) {
    const v = pick(sources[i], keys);
    if (v !== undefined) return v;
  }
  return undefined;
};

const pickCaseInsensitive = (sources, aliases) => {
  if (!Array.isArray(aliases) || aliases.length === 0) return undefined;
  const aliasSet = new Set(aliases.map((a) => String(a).toLowerCase()));
  for (let i = 0; i < sources.length; i += 1) {
    const src = sources[i];
    if (!src || typeof src !== 'object') continue;
    const foundKey = Object.keys(src).find((k) => aliasSet.has(String(k).toLowerCase()));
    if (foundKey !== undefined) return src[foundKey];
  }
  return undefined;
};

const normalizeLoginResponse = (apiRes) => {
  const raw = apiRes?.data ?? apiRes;
  const data = raw?.data ?? raw;
  const sourcePriority = [raw, data, data?.error, raw?.error];

  const success = pick(raw, ['success', 'Success']);
  const token = pickFirst([data, raw], ['token', 'Token']);
  const user = pickFirst([data, raw], ['user', 'User']);

  const requirePasswordChangeRaw = pickCaseInsensitive([raw, data, user], [
    'requirePasswordChange',
    'mustChangePassword',
    'forcePasswordChange',
    'firstLogin',
    'isFirstLogin',
  ]);
  const requirePasswordChange = Boolean(requirePasswordChangeRaw);

  const message = pickFirst(sourcePriority, ['message', 'Message']);

  const ok = typeof success === 'boolean' ? success : Boolean(token || user);

  return { ok, token, user, requirePasswordChange, message };
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  try {
    const json = atob(b64 + pad);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const buildUserFromToken = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload !== 'object') return null;

  const role =
    payload.role ||
    payload.roles ||
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    null;
  const userId =
    payload.userId ||
    payload.UserId ||
    payload.sub ||
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    payload.nameid ||
    payload['nameid'] ||
    null;

  if (!role && !userId) return null;

  return {
    userId: userId ? String(userId) : undefined,
    roleName: role ? String(Array.isArray(role) ? role[0] : role) : undefined,
    fullName: payload.fullName || payload.FullName || payload.name || payload.Name || undefined,
  };
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
        const fallbackUser = !userWithFlags && token ? buildUserFromToken(token) : null;
        const finalUser = userWithFlags || fallbackUser;

        if (token) localStorage.setItem('token', token);
        if (finalUser) {
          localStorage.setItem('user', JSON.stringify({
            id: finalUser.userId,    
            role: finalUser.roleName, 
            fullName: finalUser.fullName 
          }));
        }

        setLoading(false);
        return { success: true, user: finalUser, requirePasswordChange, token };
      } else {
        const msg = normalized.message || "Sai tài khoản hoặc mật khẩu";
        setError(msg);
        return { success: false, error: msg };
      }
    } catch (err) {
      setLoading(false);
      const errMsg =
        err.response?.data?.message ||
        "Đăng nhập thất bại. Kiểm tra lại kết nối Azure.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  return { login, loading, error };
};
