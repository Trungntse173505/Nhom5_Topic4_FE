import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../../hooks/useLogin";

function ShieldIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 ring-1 ring-blue-500/30">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        className="text-blue-500"
        aria-hidden="true"
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
  const navigate = useNavigate();
  const { login, loading: authLoading, error: authError } = useLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  const errors = useMemo(() => {
    const e = {};
    if (!username.trim()) e.username = "Username is required.";

    if (!password) e.password = "Password is required.";
    else if (password.length < 5)
      e.password = "Password must be at least 5 characters.";
    return e;
  }, [username, password]);

  const canSubmit = Object.keys(errors).length === 0 && !authLoading;

  function normalizeRole(rawRole) {
    if (rawRole === null || rawRole === undefined) return "";

    if (typeof rawRole === "number") {
      const roleById = {
        0: "admin",
        1: "manager",
        2: "annotator",
        3: "reviewer",
      };
      return roleById[rawRole] || "";
    }

    const normalized = String(rawRole).toLowerCase();
    if (normalized.startsWith("role_")) return normalized.slice("role_".length);
    return normalized;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (!canSubmit) return;

    const res = await login({ username, password });
    if (!res.success || !res.user) return;

      const roleToPath = {
        admin: "/admin",
        reviewer: "/reviewer",
      };

      // Lấy path dựa trên role thật của User từ Database
      const normalizedRole = normalizeRole(res.user.role);
      const targetPath = roleToPath[normalizedRole] || "/admin";

      if (targetPath) {
        navigate(targetPath);
      }
  }

  return (
    <div className="min-h-screen w-full bg-[#050B1A]">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-white/[0.03] to-transparent" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex flex-col items-center text-center">
              <ShieldIcon />
              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
                Data Labeling System
              </h1>
              <p className="mt-2 text-sm text-white/60">Sign in</p>
            </div>

            <form onSubmit={onSubmit} className="mt-7 space-y-5">
              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Username
                </label>
                <div className="relative">
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                    type="text"
                    placeholder="Enter your username"
                    className={[
                      "w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-white outline-none",
                      "placeholder:text-white/30",
                      "border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10",
                      touched.username && errors.username
                        ? "border-rose-500/60 focus:border-rose-500/70 focus:ring-rose-500/10"
                        : "",
                    ].join(" ")}
                  />
                </div>
                {touched.username && errors.username && (
                  <p className="mt-2 text-xs text-rose-400">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Password
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className={[
                      "w-full rounded-xl border bg-white/[0.04] px-4 py-3 pr-12 text-sm text-white outline-none",
                      "placeholder:text-white/30",
                      "border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10",
                      touched.password && errors.password
                        ? "border-rose-500/60 focus:border-rose-500/70 focus:ring-rose-500/10"
                        : "",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/5 hover:text-white/80"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="mt-2 text-xs text-rose-400">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className={[
                  "mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg",
                  "bg-blue-600 hover:bg-blue-500 active:bg-blue-600",
                  "shadow-blue-600/20",
                  "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-blue-600",
                ].join(" ")}
              >
                {authLoading ? "Signing In..." : "Sign In"}
              </button>

              {authError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {authError}
                </div>
              )}
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-white/30">
            © {new Date().getFullYear()} Data Labeling System
          </p>
        </div>
      </div>
    </div>
  );
}
