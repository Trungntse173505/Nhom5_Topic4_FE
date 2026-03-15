import { useLoginPage } from "../../../hooks/auth/useLoginPage";
import { useGoogleLogin } from "../../../hooks/auth/useGoogleLogin"; // <-- Thêm import hook Google
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

  // <-- Gọi Hook Google ở đây
  const { loginWithGoogle, isGoogleLoading, googleError } = useGoogleLogin(); 

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
              disabled={!canSubmit || isGoogleLoading} // <-- Chặn nút nếu Google đang loading
              className="w-full rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {authLoading ? "Authenticating..." : "Sign In"}
            </button>

            {/* --- PHẦN GIAO DIỆN GOOGLE --- */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#050B1A] px-2 text-white/40">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={isGoogleLoading || authLoading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] py-3.5 text-sm font-medium text-white transition-all hover:bg-white/10 active:scale-[0.98] disabled:opacity-50"
            >
              {isGoogleLoading ? (
                "Connecting to Google..." 
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </>
              )}
            </button>
            {/* --- KẾT THÚC PHẦN GIAO DIỆN GOOGLE --- */}

            {/* Bắt lỗi chung cho cả 2 form */}
            {(authError || googleError) && (
              <p className="text-center text-xs font-medium text-rose-400 mt-4 bg-rose-400/10 py-2 rounded-lg">
                {authError || googleError}
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