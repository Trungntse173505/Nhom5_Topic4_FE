// src/hooks/useAuth.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const login = async (email, password) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1. Gọi API
      const data = await loginApi(email, password);

      // 2. Lưu token
      const token = data.token || data.accessToken || data.data?.token;
      if (token) localStorage.setItem("token", token);

      // 3. Báo thành công và chuyển trang
      alert("Đăng nhập thành công!");
      navigate("/manager");
    } catch (error) {
      // Bắt lỗi từ api và gán vào state errorMsg
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, errorMsg, setErrorMsg };
};
