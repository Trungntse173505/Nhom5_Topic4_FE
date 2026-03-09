import { useMemo, useState } from 'react';
import { useForgotPassword } from '../../hooks/Admin/useForgotPassword';
import { useResetPassword } from '../../hooks/Admin/useResetPassword';

export default function ForgotPasswordModal({ open, defaultValue, onClose }) {
    const forgot = useForgotPassword();
    const reset = useResetPassword();

    const [step, setStep] = useState('request'); // 'request' | 'reset'
    const [email, setEmail] = useState(defaultValue || '');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [touched, setTouched] = useState({ email: false, token: false, newPassword: false, confirmPassword: false });

    const loading = forgot.loading || reset.loading;
    const error = forgot.error || reset.error;

    const setAllError = (val) => {
        forgot.setError(val);
        reset.setError(val);
    };

    const successMessage = useMemo(() => {
        const data = step === 'request' ? forgot.data : reset.data;
        if (!data) return null;
        return data?.message || data?.Message || (step === 'request'
            ? 'Đã gửi token. Vui lòng kiểm tra email.'
            : 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.');
    }, [forgot.data, reset.data, step]);

    const emailValue = useMemo(() => String(email || '').trim(), [email]);
    const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue), [emailValue]);

    const fieldError = useMemo(() => {
        const e = {};

        if (touched.email) {
            if (!emailValue) e.email = 'Vui lòng nhập email.';
            else if (!isEmailValid) e.email = 'Email không hợp lệ.';
        }

        if (step === 'reset') {
            const tokenValue = String(token || '').trim();
            if (touched.token) {
                if (!tokenValue) e.token = 'Vui lòng nhập token.';
            }
            if (touched.newPassword) {
                if (!newPassword) e.newPassword = 'Vui lòng nhập mật khẩu mới.';
                else if (String(newPassword).length < 5) e.newPassword = 'Mật khẩu phải có ít nhất 5 ký tự.';
            }
            if (touched.confirmPassword) {
                if (!confirmPassword) e.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
                else if (confirmPassword !== newPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp.';
            }
        }

        return e;
    }, [emailValue, isEmailValid, token, newPassword, confirmPassword, step, touched]);

    const canSubmit = useMemo(() => {
        if (!open || loading) return false;
        const okEmail = emailValue.length > 0 && isEmailValid;
        if (step === 'request') return okEmail;
        const okToken = !fieldError.token && String(token || '').trim().length > 0;
        const okNewPassword = !fieldError.newPassword && String(newPassword || '').length > 0;
        const okConfirm = !fieldError.confirmPassword && String(confirmPassword || '').length > 0;
        return okEmail && okToken && okNewPassword && okConfirm;
    }, [open, loading, step, fieldError, emailValue, isEmailValid, token, newPassword, confirmPassword]);

    async function onSubmit(e) {
        e.preventDefault();
        if (!canSubmit) {
            setTouched((t) => ({
                ...t,
                email: true,
                ...(step === 'reset' ? { token: true, newPassword: true, confirmPassword: true } : {}),
            }));
            return;
        }

        if (step === 'request') {
            const res = await forgot.forgotPassword({ email });
            if (res.success) setStep('reset');
            return;
        }

        await reset.resetPassword({ email, token, newPassword });
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
                            {step === 'request'
                                ? 'Nhập email để hệ thống gửi token đặt lại mật khẩu về email của bạn.'
                                : 'Nhập token (từ email) và mật khẩu mới để hoàn tất.'}
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

                    {step === 'reset' && (
                        <>
                            <div>
                                <input
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    onBlur={() => setTouched((t) => ({ ...t, token: true }))}
                                    type="text"
                                    placeholder="Token"
                                    className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20
                ${fieldError.token ? 'border-rose-500/50' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'}`}
                                />
                                {fieldError.token && <p className="mt-2 text-xs font-medium text-rose-400">{fieldError.token}</p>}
                            </div>
                            <div>
                                <input
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onBlur={() => setTouched((t) => ({ ...t, newPassword: true }))}
                                    type="password"
                                    placeholder="Mật khẩu mới"
                                    className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20
                ${fieldError.newPassword ? 'border-rose-500/50' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'}`}
                                />
                                {fieldError.newPassword && <p className="mt-2 text-xs font-medium text-rose-400">{fieldError.newPassword}</p>}
                            </div>
                            <div>
                                <input
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                                    type="password"
                                    placeholder="Xác nhận mật khẩu mới"
                                    className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20
                ${fieldError.confirmPassword ? 'border-rose-500/50' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/10 focus:ring-4'}`}
                                />
                                {fieldError.confirmPassword && <p className="mt-2 text-xs font-medium text-rose-400">{fieldError.confirmPassword}</p>}
                            </div>
                        </>
                    )}

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
                        {loading ? (step === 'request' ? 'Đang gửi...' : 'Đang đặt lại...') : (step === 'request' ? 'Gửi yêu cầu' : 'Đặt lại mật khẩu')}
                    </button>

                    <div className="flex items-center justify-between gap-3">
                        {step === 'reset' && (
                            <button
                                type="button"
                                className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3 text-xs font-bold text-white/60 hover:bg-white/[0.04] disabled:opacity-50"
                                onClick={() => {
                                    setAllError(null);
                                    setStep('request');
                                }}
                                disabled={loading}
                            >
                                Quay lại
                            </button>
                        )}
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
                    </div>
                </form>
            </div>
        </div>
    );

}
