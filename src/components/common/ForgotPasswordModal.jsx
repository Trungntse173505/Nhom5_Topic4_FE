import { useMemo, useState } from 'react';
import { useForgotPassword } from '../../hooks/Admin/useForgotPassword';

export default function ForgotPasswordModal({ open, defaultValue, onClose }) {
    const forgot = useForgotPassword();
    const [email, setEmail] = useState(defaultValue || '');
    const [touched, setTouched] = useState({ email: false });

    const loading = forgot.loading;
    const error = forgot.error;

    const setAllError = (val) => {
        forgot.setError(val);
    };

    const successMessage = useMemo(() => {
        const data = forgot.data;
        if (!data) return null;
        return data?.message || data?.Message || 'Đã gửi token. Vui lòng kiểm tra email.';
    }, [forgot.data]);

    const emailValue = useMemo(() => String(email || '').trim(), [email]);
    const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue), [emailValue]);

    const fieldError = useMemo(() => {
        const e = {};

        if (touched.email) {
            if (!emailValue) e.email = 'Vui lòng nhập email.';
            else if (!isEmailValid) e.email = 'Email không hợp lệ.';
        }

        return e;
    }, [emailValue, isEmailValid, touched]);

    const canSubmit = useMemo(() => {
        if (!open || loading) return false;
        const okEmail = emailValue.length > 0 && isEmailValid;
        return okEmail;
    }, [open, loading, emailValue, isEmailValid]);

    async function onSubmit(e) {
        e.preventDefault();
        if (!canSubmit) {
            setTouched((t) => ({
                ...t,
                email: true,
            }));
            return;
        }

        await forgot.forgotPassword({ email });
    }

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => {
                    setAllError(null);
                    onClose?.();
                }}
            />
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1226]/95 p-8 shadow-2xl">

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">Quên mật khẩu</h2>
                        <p className="mt-1 text-xs text-white/50">
                            Nhập email để hệ thống gửi token đặt lại mật khẩu về email của bạn.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="rounded-lg px-2 py-1 text-xs font-bold text-white/40 hover:text-white/70"
                        onClick={() => {
                            setAllError(null);
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
                            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                            type="text"
                            placeholder="Email"
                            className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20
                ${fieldError.email ? 'border-rose-500/50' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'}`}

                        />
                        {fieldError.email && <p className="mt-2 text-xs font-medium text-rose-400">{fieldError.email}</p>}
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
                            setAllError(null);
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
