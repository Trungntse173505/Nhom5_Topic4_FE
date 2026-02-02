// src/pages/Auth/Login.jsx
import { useMemo, useState } from "react";

const ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "annotator", label: "Annotator" },
  { value: "reviewer", label: "Reviewer" },
];

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const errors = useMemo(() => {
    const e = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Email is invalid.";

    if (!password) e.password = "Password is required.";
    else if (password.length < 6) e.password = "Password must be at least 6 characters.";
    return e;
  }, [email, password]);

  const canSubmit = Object.keys(errors).length === 0 && !loading;

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;

    try {
      setLoading(true);

      // TODO: Replace with your API call
      // await authApi.login({ email, password, role });

      // Demo: simulate request
      await new Promise((r) => setTimeout(r, 700));

      console.log("LOGIN:", { email, password, role });
      // TODO: navigate to workspace based on role
      // navigate(`/${role}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#050B1A]">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        {/* changed here */}
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
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">Email</label>
                <div className="relative">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    type="email"
                    placeholder="user@company.com"
                    className={[
                      "w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-white outline-none",
                      "placeholder:text-white/30",
                      "border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10",
                      touched.email && errors.email
                        ? "border-rose-500/60 focus:border-rose-500/70 focus:ring-rose-500/10"
                        : "",
                    ].join(" ")}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="mt-2 text-xs text-rose-400">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">Password</label>
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
                  <p className="mt-2 text-xs text-rose-400">{errors.password}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value} className="bg-[#0B1224]">
                        {r.label}
                      </option>
                    ))}
                  </select>

                  {/* caret */}
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
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
                {loading ? "Signing In..." : "Sign In"}
              </button>
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
