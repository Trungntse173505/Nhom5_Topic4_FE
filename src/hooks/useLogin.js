import { useState } from 'react';
import authApi from '../components/api/authApi';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractToken = (data) => {
    return (
      data?.token ??
      data?.data?.token ??
      data?.jwt ??
      data?.data?.jwt ??
      data?.jwtToken ??
      data?.data?.jwtToken ??
      data?.accessToken ??
      data?.data?.accessToken ??
      null
    );
  };

  const extractUser = (data) => {
    const direct = data?.user ?? data?.data?.user;
    if (direct) return direct;

    const candidate = data?.data ?? data;
    if (!candidate || typeof candidate !== 'object') return null;

    const hasIdentityField =
      'role' in candidate ||
      'username' in candidate ||
      'email' in candidate ||
      'fullName' in candidate ||
      'id' in candidate;

    return hasIdentityField ? candidate : null;
  };

  const login = async ({ username, password }) => {
    setLoading(true);
    setError(null);
    try {
      const normalizedUsername = String(username || '').trim();

      const endpoints = [authApi.loginAuth, authApi.loginAuthLower];
      const attempts = [
        { username: normalizedUsername, password },
        { identifier: normalizedUsername, password },
        { login: normalizedUsername, password },
      ];

      let raw;
      let token;
      let user;
      let lastError;

      for (const callEndpoint of endpoints) {
        for (const payload of attempts) {
          try {
            raw = await callEndpoint(payload);
            token = extractToken(raw);
            user = extractUser(raw);
            const role = raw?.role ?? raw?.data?.role ?? null;

            if (!user && token) user = { username: normalizedUsername, role: role ?? 'admin' };
            lastError = null;
            break;
          } catch (err) {
            lastError = err;
            const status = err?.response?.status;
            if (status === 400 || status === 404) continue;
            throw err;
          }
        }
        if (!lastError) break;
      }

      if (lastError) throw lastError;

      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('auth', JSON.stringify(user));

      setLoading(false);
      return { success: Boolean(token || user), token, user, raw };
    } catch (err) {
      setLoading(false);
      const data = err?.response?.data;
      const firstModelError =
        data?.errors && typeof data.errors === 'object'
          ? Object.values(data.errors).flat().filter(Boolean)[0]
          : null;
      const errMsg =
        (typeof data === 'string' ? data : null) ||
        data?.Message ||
        data?.message ||
        data?.error ||
        data?.detail ||
        data?.title ||
        firstModelError ||
        'Sign in failed. Please check your credentials.';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  return { login, loading, error };
};
