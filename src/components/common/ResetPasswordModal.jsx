import { useMemo, useState } from 'react';
import { useResetPassword } from '../../hooks/Admin/useResetPassword';

export default function ResetPasswordModal({ open, email, onClose, onSuccess }) {
  const { resetPassword, loading, error, data, setError } = useResetPassword();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ token: false, newPassword: false, confirmPassword: false });

  const emailValue = useMemo(() => String(email || '').trim(), [email]);

  const fieldError = useMemo(() => {
    const e = {};
    const tokenValue = String(token || '').trim();

    if (touched.token && !tokenValue) e.token = 'Vui lòng nhập token.';
    if (touched.newPassword) {
      if (!newPassword) e.newPassword = 'Vui lòng nhập mật khẩu mới.';
      else if (String(newPassword).length < 5) e.newPassword = 'Mật khẩu phải có ít nhất 5 ký tự.';
    }
    if (touched.confirmPassword) {
      if (!confirmPassword) e.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
      else if (confirmPassword !== newPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    return e;
  }, [token, newPassword, confirmPassword, touched]);

  const canSubmit = useMemo(() => {
    if (!open || loading) return false;
    if (!emailValue) return false;
    if (!String(token || '').trim()) return false;
    if (!String(newPassword || '')) return false;
    if (confirmPassword !== newPassword) return false;
    return Object.keys(fieldError).length === 0;
  }, [open, loading, emailValue, token, newPassword, confirmPassword, fieldError]);

  const successMessage = useMemo(() => {
    if (!data) return null;
    return data?.message || data?.Message || 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.';
  }, [data]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) {
      setTouched({ token: true, newPassword: true, confirmPassword: true });
      return;
    }

    const res = await resetPassword({ email: emailValue, token, newPassword });
    if (res.success) onSuccess?.(res.data);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => {
          setError(null);
          onClose?.();
        }}
      />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1226]/95 p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Đặt lại mật khẩu</h2>
            <p className="mt-1 text-xs text-white/50">
              Nhập token (từ email) và mật khẩu mới cho <span className="text-white/70">{emailValue}</span>.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-xs font-bold text-white/40 hover:text-white/70"
            onClick={() => {
              setError(null);
              onClose?.();
            }}
            disabled={loading}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, token: true }))}
              type="text"
              placeholder="Token"
              className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20
                ${fieldError.token ? 'border-rose-500/50' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'}`}
            />
            {fieldError.token && <p className="mt-2 text-xs font-medium text-rose-400">{fieldError.token}</p>}
          </div>

          <div>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, newPassword: true }))}
              type="password"
              placeholder="Mật khẩu mới"
              className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20
                ${fieldError.newPassword ? 'border-rose-500/50' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'}`}
            />
            {fieldError.newPassword && (
              <p className="mt-2 text-xs font-medium text-rose-400">{fieldError.newPassword}</p>
            )}
          </div>

          <div>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20
                ${fieldError.confirmPassword ? 'border-rose-500/50' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'}`}
            />
            {fieldError.confirmPassword && (
              <p className="mt-2 text-xs font-medium text-rose-400">{fieldError.confirmPassword}</p>
            )}
          </div>

          {error && (
            <p className="text-center text-xs font-medium text-rose-400 bg-rose-400/10 py-2 rounded-lg">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-center text-xs font-medium text-emerald-300 bg-emerald-300/10 py-2 rounded-lg">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
          </button>

          <button
            type="button"
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3 text-xs font-bold text-white/60 hover:bg-white/[0.04] disabled:opacity-50"
            onClick={() => {
              setError(null);
              onClose?.();
            }}
            disabled={loading}
          >
            Đóng
          </button>
        </form>
      </div>
    </div>
  );
}

