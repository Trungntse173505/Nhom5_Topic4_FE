import { useLoginPage } from "../../../hooks/useLoginPage";
import ChangePasswordFirstLoginModal from "../../common/ChangePasswordFirstLoginModal";
import ForgotPasswordModal from "../../common/ForgotPasswordModal";

function ShieldIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 ring-1 ring-blue-500/30">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        className="text-blue-500"
      >
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

export default function Login() {
  const {
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
  } = useLoginPage();

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
              Data Labeling System
            </h1>
            <p className="mt-2 text-sm text-white/40 font-medium">
              Please sign in to your account
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => markTouched("username")}
                type="text"
                placeholder="Username"
                className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/20 
                  ${
                    touched.username && errors.username
                      ? "border-rose-500/50 focus:ring-rose-500/10"
                      : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4"
                  }`}
              />
            </div>

            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => markTouched("password")}
                type={showPw ? "text" : "password"}
                placeholder="Password"
                className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/20
                  ${
                    touched.password && errors.password
                      ? "border-rose-500/50"
                      : "border-white/10 focus:border-blue-500/50"
                  }`}
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30 hover:text-white/60"
              >
                {showPw ? "HIDE" : "SHOW"}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={openForgotPassword}
                className="text-xs font-bold text-white/40 hover:text-white/70"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {authLoading ? "Authenticating..." : "Sign In"}
            </button>

            {authError && (
              <p className="text-center text-xs font-medium text-rose-400 mt-4 bg-rose-400/10 py-2 rounded-lg">
                {authError}
              </p>
            )}
          </form>
        </div>
      </div>

      {pwModalOpen && (
        <ChangePasswordFirstLoginModal
          open={pwModalOpen}
          enabled={pwChangeRequired}
          oldPassword={password}
          username={username}
          force
          onSuccess={handlePasswordChangeSuccess}
          onSkip={closePwModal}
          onClose={closePwModal}
        />
      )}

      {forgotModalOpen && (
        <ForgotPasswordModal
          open={forgotModalOpen}
          defaultValue={username}
          onClose={closeForgotPassword}
        />
      )}
    </div>
  );
}
