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
  const navigate = useNavigate();

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // ĐÃ ĐỔI TÊN STATE TỪ email -> username
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  // 1. VALIDATION CƠ BẢN TRÊN FORM
  const errors = useMemo(() => {
    const e = {};
    const trimmedUsername = username.trim();

    // Không cần check có @ hay không nữa, chỉ cần không để trống là được
    if (!trimmedUsername) {
      e.username = "Username is required.";
    }

    if (!password) {
      e.password = "Password is required.";
    }

    return e;
  }, [username, password]);

  const canSubmit = Object.keys(errors).length === 0 && !authLoading;

  // 2. GỌI API LOGIN THỰC TẾ & BẮT LỖI
  async function login({ username, password, role }) {
    if (!window.navigator.onLine) {
      throw new Error("No internet connection.");
    }

    try {
      const response = await fetch(
        "https://swp-be-efc9d4and2d9fda3.japaneast-01.azurewebsites.net/api/Auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // ĐÃ SỬA CHUẨN MẬP THEO Ý BE: gửi 'username' thay vì 'email'
          body: JSON.stringify({ username, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid username or password.");
      }

      const token = data.token || data.accessToken || data.data?.token;
      if (token) localStorage.setItem("token", token);

      localStorage.setItem("auth", JSON.stringify({ username, role }));
    } catch (apiError) {
      if (apiError.message === "Failed to fetch") {
        throw new Error("Could not connect to server.");
      }
      throw apiError;
    }
  }

  // 3. XỬ LÝ SUBMIT FORM
  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ username: true, password: true });

    if (!canSubmit) {
      setAuthError("Please fix the errors above.");
      return;
    }

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
        throw new Error("Role is not supported yet.");
      }

      // Đã sửa biến truyền vào là username
      await login({ username: username.trim(), password, role });
      navigate(targetPath);
    } catch (err) {
      setAuthError(err?.message || "Sign in failed. Please try again.");
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
              {authError && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400 text-center">
                  {authError}
                </div>
              )}

              {/* Username Input */}
              <div>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                  type="text"
                  placeholder="Username"
                  className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none border transition-colors focus:bg-white/10 ${
                    touched.username && errors.username
                      ? "border-rose-500/50"
                      : "border-white/10 focus:border-blue-500/50"
                  }`}
                />
                {touched.username && errors.username && (
                  <p className="mt-2 text-xs text-rose-400">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    type={showPw ? "text" : "password"}
                    placeholder="Password"
                    className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none border transition-colors focus:bg-white/10 ${
                      touched.password && errors.password
                        ? "border-rose-500/50"
                        : "border-white/10 focus:border-blue-500/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40 hover:text-white"
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

              {/* Role Select */}
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500/50 focus:bg-white/10 [&>option]:text-gray-900"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex justify-center items-center gap-2 rounded-xl py-3.5 bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
