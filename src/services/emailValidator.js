
const ABSTRACT_API_KEY =
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_VALIDATE_API_KEY : process?.env?.VITE_VALIDATE_API_KEY) ||
  'VALIDATE_API_KEY';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const verifyRealEmail = async (email) => {
  // 1. Kiểm tra định dạng cơ bản trước (để tiết kiệm lượt gọi API)
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, message: 'Định dạng email không hợp lệ.' };
  }

  // Nếu chưa cấu hình key hợp lệ, dừng ngay để không gọi API sai
  if (!ABSTRACT_API_KEY || ABSTRACT_API_KEY === 'VALIDATE_API_KEY') {
    return {
      isValid: false,
      message: 'Thiếu API key xác thực email. Vui lòng set VITE_VALIDATE_API_KEY trong .env',
    };
  }

  try {
    const response = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${encodeURIComponent(email)}`
    );
    const data = await response.json();

    // 0. Lỗi API key hoặc request thất bại -> chặn để tránh tạo user sai
    if (!response.ok || data?.error) {
      const msg =
        data?.error?.message ||
        data?.message ||
        'Không thể xác thực email. Vui lòng kiểm tra API key hoặc thử lại.';
      return { isValid: false, message: msg };
    }

    // 2. Kiểm tra phản hồi từ Server Email (SMTP)
    if (data.deliverability === 'UNDELIVERABLE') {
      return { isValid: false, message: 'Email này không tồn tại trên thực tế.' };
    }

    // 3. Kiểm tra xem có phải email rác (10 phút) không
    if (data?.is_disposable_email?.value === true) {
      return { isValid: false, message: 'Vui lòng không sử dụng email ảo.' };
    }

    return { isValid: true, message: 'Email hợp lệ.' };
  } catch (error) {
    // Nếu API lỗi (hết quota, mất mạng), chặn để tránh tạo user sai
    console.error('Email Verification Error:', error);
    return { isValid: false, message: 'Không thể xác thực email. Vui lòng thử lại.' };
  }
};
