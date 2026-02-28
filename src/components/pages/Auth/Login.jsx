import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "annotator", label: "Annotator" },
  { value: "reviewer", label: "Reviewer" },
];

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

export default function Login() {
  const navigate = useNavigate();

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const errors = useMemo(() => {
    const e = {};

    if (!email.trim()) {
      e.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      e.email = "Email is invalid.";
    }

    if (!password) {
      e.password = "Password is required.";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }

    return e;
  }, [email, password]);

  const canSubmit = Object.keys(errors).length === 0 && !authLoading;

  async function login({ email, role }) {
    localStorage.setItem("auth", JSON.stringify({ email, role }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;

    try {
      setAuthError("");
      setAuthLoading(true);

      const roleToPath = {
        admin: "/admin",
        manager: "/manager",
        annotator: "/annotator",
        reviewer: "/reviewer",
      };

      const targetPath = roleToPath[role];

      if (!targetPath) {
        setAuthError("Role is not supported yet.");
        return;
      }

      await login({ email, role });
      navigate(targetPath);
    } catch (err) {
      setAuthError(err?.message || "Sign in failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#050B1A]">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
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
              {/* Email */}
              <div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl px-4 py-3"
                />
                {touched.email && errors.email && (
                  <p className="mt-2 text-xs text-rose-400">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    type={showPw ? "text" : "password"}
                    placeholder="Password"
                    className="w-full rounded-xl px-4 py-3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/60"
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

              {/* Role */}
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl px-4 py-3"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-xl py-3 bg-blue-600 text-white"
              >
                {authLoading ? "Signing In..." : "Sign In"}
              </button>

              {authError && (
                <div className="text-red-400 text-sm">{authError}</div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}