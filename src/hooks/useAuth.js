import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Fix lỗi import: Lấy default export từ authApi
import authApi from "../api/authApi";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const login = async (email, password) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1. Gọi API (Truyền đúng dạng object payload { email, password })
      const response = await authApi.loginAuth({ email, password });

      // Tùy cách cấu hình axiosClient của sếp, data có thể nằm ở response.data hoặc chính là response
      const data = response.data || response;

      // 2. Lưu token
      const token = data.token || data.accessToken || data.data?.token;

      if (token) {
        localStorage.setItem("token", token);
      } else {
        throw new Error("Đăng nhập thành công nhưng không tìm thấy Token!");
      }

      // 3. Chuyển trang (Bỏ dòng alert đi cho mượt, tự động bay vào manager luôn)
      navigate("/manager");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      // Bắt lỗi thông minh hơn: Ưu tiên lấy message từ server trả về, nếu không có mới lấy lỗi mặc định
      const message =
        error.response?.data?.message ||
        error.message ||
        "Tài khoản hoặc mật khẩu không chính xác!";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, errorMsg, setErrorMsg };
};
