import axiosClient from "./axiosClient";

const authApi = {
  // Gửi email, password lên để lấy token
  loginAuth: (payload) => axiosClient.post("/api/Auth/login", payload),

  // Gọi api này (đã có token đính kèm qua axiosClient) để lấy thông tin user
  getMe: () => axiosClient.get("/api/Auth/me"),
};

export default authApi;
