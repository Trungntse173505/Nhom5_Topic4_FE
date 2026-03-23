
const ABSTRACT_API_KEY =
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_VALIDATE_API_KEY : process?.env?.VITE_VALIDATE_API_KEY) ||
  'VALIDATE_API_KEY';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const readApiBool = (value) => {
  if (value && typeof value === 'object' && 'value' in value) {
    return value.value;
  }
  return value;
};

export const checkEmailExists = async (email) => {
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
      `https://emailreputation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${encodeURIComponent(email)}`
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

    // 2. Đánh giá tồn tại dựa trên các trường trả về (hỗ trợ cả schema Email Validation và Email Reputation)
    const deliverabilityRaw =
      data?.deliverability ||
      data?.email_deliverability?.status ||
      data?.email_reputation?.deliverability;

    const isDeliverable = String(deliverabilityRaw || '').toUpperCase() === 'DELIVERABLE';

    const smtpValue = readApiBool(
      data?.is_smtp_valid ??
      data?.email_deliverability?.is_smtp_valid ??
      data?.email_reputation?.is_smtp_valid
    );
    const smtpOk = smtpValue === true;
    const smtpInvalid = smtpValue === false;

    const formatValue = readApiBool(
      data?.is_valid_format ??
      data?.email_deliverability?.is_format_valid
    );
    const formatOk = formatValue === true;

    const disposable =
      data?.is_disposable_email?.value === true ||
      data?.email_quality?.is_disposable === true ||
      data?.email_reputation?.is_disposable === true;

    if (disposable) {
      return { isValid: false, message: 'Vui lòng không sử dụng email ảo.' };
    }

    if (smtpInvalid) {
      return { isValid: false, message: 'Email này không xác thực được qua SMTP.' };
    }

    if (isDeliverable || smtpOk) {
      return { isValid: true, message: 'Email này tồn tại thật!' };
    }

    if (formatOk) {
      return { isValid: false, message: 'Email có định dạng đúng nhưng không xác nhận được tồn tại trên máy chủ.' };
    }

    return { isValid: false, message: 'Email này có vẻ không tồn tại trên hệ thống mail.' };
  } catch (error) {
    // Nếu API lỗi (hết quota, mất mạng), chặn để tránh tạo user sai
    console.error('Email Verification Error:', error);
    return { isValid: false, message: 'Không thể xác thực email. Vui lòng thử lại.' };
  }
};

// Giữ hàm cũ để tương thích với các nơi đã gọi
export const verifyRealEmail = checkEmailExists;
