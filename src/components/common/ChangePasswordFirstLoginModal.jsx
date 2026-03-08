import { useEffect, useMemo, useState } from 'react';
import { useChangePasswordFirstLogin } from '../../hooks/Admin/useChangePasswordFirstLogin';

export default function ChangePasswordFirstLoginModal({
  open,
  oldPassword,
  username,
  onSuccess,
  onSkip,
  onClose,
}) {
  const {
    shouldPromptForCurrentUser,
    markPromptSeenForCurrentUser,
    changePasswordFirstLogin,
    loading,
    error,
  } = useChangePasswordFirstLogin();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ newPassword: false, confirmPassword: false });

  useEffect(() => {
    if (!open) return;
    if (!shouldPromptForCurrentUser()) {
      onClose?.();
      return;
    }
    markPromptSeenForCurrentUser();
  }, [open, onClose, shouldPromptForCurrentUser, markPromptSeenForCurrentUser]);

  const errors = useMemo(() => {
    const e = {};
    if (!newPassword) e.newPassword = 'New password is required.';
    else if (newPassword.length < 5) e.newPassword = 'Password must be at least 5 chars.';
    if (!confirmPassword) e.confirmPassword = 'Please confirm your new password.';
    else if (confirmPassword !== newPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  }, [newPassword, confirmPassword]);

  const canSubmit = open && Object.keys(errors).length === 0 && !loading;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const res = await changePasswordFirstLogin({ oldPassword, newPassword });
    if (res.success) {
      onSuccess?.(res.data);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onClose?.()}
      />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1226]/95 p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Đổi mật khẩu lần đầu</h2>
            <p className="mt-1 text-xs text-white/50">
              {username ? `Tài khoản: ${username}` : 'Vui lòng đổi mật khẩu trước khi tiếp tục.'}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-xs font-bold text-white/40 hover:text-white/70"
            onClick={() => onClose?.()}
            disabled={loading}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, newPassword: true }))}
              type="password"
              placeholder="New password"
              className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20
                ${
                  touched.newPassword && errors.newPassword
                    ? 'border-rose-500/50'
                    : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'
                }`}
            />
            {touched.newPassword && errors.newPassword && (
              <p className="mt-2 text-xs font-medium text-rose-400">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
              type="password"
              placeholder="Confirm new password"
              className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20
                ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-rose-500/50'
                    : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'
                }`}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-2 text-xs font-medium text-rose-400">{errors.confirmPassword}</p>
            )}
          </div>

          {error && (
            <p className="text-center text-xs font-medium text-rose-400 bg-rose-400/10 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
          </button>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3 text-xs font-bold text-white/60 hover:bg-white/[0.04] disabled:opacity-50"
              onClick={() => onSkip?.()}
              disabled={loading}
            >
              Bỏ qua
            </button>
            <button
              type="button"
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3 text-xs font-bold text-white/60 hover:bg-white/[0.04] disabled:opacity-50"
              onClick={() => onClose?.()}
              disabled={loading}
            >
              Đóng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
