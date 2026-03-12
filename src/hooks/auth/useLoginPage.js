import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserPresence } from '../../services/firebase';
import { useLogin } from './useLogin';

export const useLoginPage = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading, error: authError } = useLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwChangeRequired, setPwChangeRequired] = useState(false);
  const [pendingRoleName, setPendingRoleName] = useState(null);
  const [passwordChangedFor, setPasswordChangedFor] = useState(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const roleToPath = useMemo(
    () => ({
      admin: '/admin',
      manager: '/manager',
      annotator: '/annotator',
      reviewer: '/reviewer',
    }),
    []
  );

  const continueToApp = useCallback(
    (roleName) => {
      navigate(roleToPath[String(roleName || '').toLowerCase()] || '/admin');
    },
    [navigate, roleToPath]
  );

  const errors = useMemo(() => {
    const e = {};
    if (!String(username).trim()) e.username = 'Username is required.';
    if (!password) e.password = 'Password is required.';
    else if (String(password).length < 5) e.password = 'Password must be at least 5 chars.';
    return e;
  }, [username, password]);

  const canSubmit = useMemo(() => Object.keys(errors).length === 0 && !authLoading, [errors, authLoading]);

  const openForgotPassword = useCallback(() => setForgotModalOpen(true), []);
  const closeForgotPassword = useCallback(() => setForgotModalOpen(false), []);

  const toggleShowPassword = useCallback(() => setShowPw((v) => !v), []);
  const markTouched = useCallback((key) => setTouched((t) => ({ ...t, [key]: true })), []);

  const closePwModal = useCallback(() => setPwModalOpen(false), []);

  const handlePasswordChangeSuccess = useCallback(
    async ({ newPassword } = {}) => {
      setPwModalOpen(false);
      setPwChangeRequired(false);
      setPasswordChangedFor(String(username || '').trim() || null);
      if (newPassword) setPassword(newPassword);

      if (pendingRoleName) {
        continueToApp(pendingRoleName);
        return;
      }

      if (!newPassword) return;
      const relogin = await login({ username, password: newPassword });
      if (relogin.success && relogin.user?.roleName) {
        continueToApp(relogin.user.roleName);
      }
    },
    [pendingRoleName, continueToApp, login, username]
  );

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!canSubmit) return;

      const res = await login({ username, password });
      if (!res.success) return;

      const requirePasswordChange = Boolean(res.requirePasswordChange ?? res.user?.requirePasswordChange);
      const userId = res.user?.userId;
      const roleName = res.user?.roleName;

      const currentUserKey = String(username || '').trim() || null;
      const alreadyChangedForThisUser = currentUserKey && passwordChangedFor === currentUserKey;

      if (requirePasswordChange && !alreadyChangedForThisUser) {
        setPendingRoleName(roleName || null);
        setPwChangeRequired(true);
        setPwModalOpen(true);
        return;
      }

      try {
        if (userId && roleName) {
          await updateUserPresence(userId, roleName, true);
        }
      } catch {
        // ignore presence errors
      }

      if (roleName) continueToApp(roleName);
    },
    [canSubmit, login, username, password, continueToApp, passwordChangedFor]
  );

  return {
    username,
    setUsername,
    password,
    setPassword,
    showPw,
    toggleShowPassword,
    touched,
    markTouched,
    errors,
    canSubmit,
    onSubmit,
    authLoading,
    authError,
    pwModalOpen,
    pwChangeRequired,
    closePwModal,
    handlePasswordChangeSuccess,
    forgotModalOpen,
    openForgotPassword,
    closeForgotPassword,
  };
};
