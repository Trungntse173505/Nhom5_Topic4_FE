import { useMemo, useState } from 'react';
import { useForgotPassword } from '../../hooks/Admin/useForgotPassword';
export default function ForgotPasswordModal({ open, defaultValue, onClose }) {
    const { forgotPassword, loading, error, data, setError } = useForgotPassword();
    const [email, setEmail] = useState(defaultValue || '');
    const [touched, setTouched] = useState(false);
    const successMessage = useMemo(() => {

        if (!data) return null;
        return data?.message || data?.Message || 'Yêu cầu đã được gửi. Vui lòng kiểm tra email.';
    }, [data]);
    const fieldError = useMemo(() => {
        const v = String(email || '').trim();
        if (!touched) return null;
        if (!v) return 'Vui lòng nhập email.';
        if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v)) return 'Email không hợp lệ.';
        return null;
    }, [email, touched]);

    const canSubmit = open && !loading && !fieldError;
    async function onSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;
        const res = await forgotPassword({ email });
        if (!res.success) return;
    }

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
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
                        <h2 className="text-lg font-bold text-white">Quên mật khẩu</h2>
                        <p className="mt-1 text-xs text-white/50">
                            Nhập email để hệ thống gửi hướng dẫn đặt lại mật khẩu về email của bạn.
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setTouched(true)}
                            type="text"
                            placeholder="Email"
                            className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20
                ${fieldError ? 'border-rose-500/50' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'}`}

                        />
                        {fieldError && <p className="mt-2 text-xs font-medium text-rose-400">{fieldError}</p>}
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
                        {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
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
