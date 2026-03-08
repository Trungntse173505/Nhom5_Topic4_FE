import { useCallback, useState } from 'react';
2
import authForgotPasswordApi from '../../api/authForgotPasswordApi';
3

4
const buildPayload = ({ emailOrUsername }) => {
    const value = String(emailOrUsername ?? '').trim();
    return {
        email: value,
        Email: value,
        username: value,
        Username: value,
    };

};

export const useForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const forgotPassword = useCallback(async ({ emailOrUsername }) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const payload = buildPayload({ emailOrUsername })
            const res = await authForgotPasswordApi.forgotPassword(payload);
            setData(res);
            return { success: true, data: res };
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.Message ||
                err?.message ||
                'Gửi yêu cầu quên mật khẩu thất bại.';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);
    return { forgotPassword, loading, error, data, setError };
};