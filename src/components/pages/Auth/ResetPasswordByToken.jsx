import { useResetPasswordByToken } from '../../../hooks/auth/useResetPasswordByToken';

function ShieldIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 ring-1 ring-blue-500/30">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-blue-500">
        <path
          d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function ResetPasswordByToken() {
  const {
    tokenMissing,
    newPassword,
    confirmPassword,
    showPassword,
    toggleShowPassword,
    fieldError,
    canSubmit,
    loading,
    error,
    successMessage,
    onBlurNewPassword,
    onBlurConfirmPassword,
    onChangeNewPassword,
    onChangeConfirmPassword,
    submit,
    goToLogin,
  } = useResetPasswordByToken();

  return (
    <div className="min-h-screen w-full bg-[#050B1A] relative flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <ShieldIcon />
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">
              Đổi mật khẩu lần đầu
            </h1>
            <p className="mt-2 text-sm text-white/40 font-medium">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          {tokenMissing && (
            <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-200">
              Link đổi mật khẩu lần đầu không hợp lệ hoặc đã hết hạn.
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <div className="relative">
              <input
                value={newPassword}
                onChange={(e) => onChangeNewPassword(e.target.value)}
                onBlur={onBlurNewPassword}
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu mới"
                disabled={tokenMissing}
                className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/20
                  ${
                    fieldError.newPassword
                      ? 'border-rose-500/50'
                      : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                disabled={tokenMissing}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30 hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
              {fieldError.newPassword && (
                <p className="mt-2 text-xs font-medium text-rose-400">{fieldError.newPassword}</p>
              )}
            </div>

            <div>
              <input
                value={confirmPassword}
                onChange={(e) => onChangeConfirmPassword(e.target.value)}
                onBlur={onBlurConfirmPassword}
                type={showPassword ? 'text' : 'password'}
                placeholder="Xác nhận mật khẩu mới"
                disabled={tokenMissing}
                className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/20
                  ${
                    fieldError.confirmPassword
                      ? 'border-rose-500/50'
                      : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
              />
              {fieldError.confirmPassword && (
                <p className="mt-2 text-xs font-medium text-rose-400">{fieldError.confirmPassword}</p>
              )}
            </div>

            {error && (
              <p className="text-center text-xs font-medium text-rose-400 mt-4 bg-rose-400/10 py-2 rounded-lg">
                {error}
              </p>
            )}

            {successMessage && (
              <p className="text-center text-xs font-medium text-emerald-300 mt-4 bg-emerald-300/10 py-2 rounded-lg">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
            </button>

            <button
              type="button"
              onClick={goToLogin}
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3 text-xs font-bold text-white/60 hover:bg-white/[0.04]"
            >
              Back to login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
