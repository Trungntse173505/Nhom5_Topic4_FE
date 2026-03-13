import { useResetPasswordModal } from '../../hooks/Admin/useResetPasswordModal';

export default function ResetPasswordModal({ open, email, onClose, onSuccess }) {
  const {
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
  } = useResetPasswordModal({ open, email, onSuccess, onClose });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => {
          close();
        }}
      />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1226]/95 p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Đặt lại mật khẩu</h2>
            <p className="mt-1 text-xs text-white/50">
              Nhập email, OTP và mật khẩu mới để đặt lại mật khẩu.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-xs font-bold text-white/40 hover:text-white/70"
            onClick={() => {
              close();
            }}
            disabled={loading}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <input
              value={emailValue}
              type="text"
              placeholder="Email"
              disabled
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 outline-none placeholder:text-white/20 opacity-80 cursor-not-allowed"
            />
          </div>

          <div>
            <input
              value={otp}
              onChange={(e) => onChangeOtp(e.target.value)}
              onBlur={onBlurOtp}
              type="text"
              placeholder="OTP"
              className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20
                ${fieldError.otp ? 'border-rose-500/50' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'}`}
            />
            {fieldError.otp && <p className="mt-2 text-xs font-medium text-rose-400">{fieldError.otp}</p>}
          </div>

          <div>
            <input
              value={newPassword}
              onChange={(e) => onChangeNewPassword(e.target.value)}
              onBlur={onBlurNewPassword}
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
              onChange={(e) => onChangeConfirmPassword(e.target.value)}
              onBlur={onBlurConfirmPassword}
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

          {successMessage && responseFields && (responseFields.email || responseFields.otp || responseFields.password) && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/70 space-y-2">
              {responseFields.email && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/40">Email</span>
                  <span className="font-medium text-white/80 break-all">{responseFields.email}</span>
                </div>
              )}
              {responseFields.otp && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/40">OTP</span>
                  <span className="font-medium text-white/80 break-all">{responseFields.otp}</span>
                </div>
              )}
              {responseFields.password && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/40">Password</span>
                  <span className="font-medium text-white/80 break-all">{responseFields.password}</span>
                </div>
              )}
            </div>
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
              close();
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
