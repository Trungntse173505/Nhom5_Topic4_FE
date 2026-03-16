import axiosClient from "./axiosClient";

const authApi = {
  
  // Gửi email, password lên để lấy  token
  loginAuth: (payload) => axiosClient.post("/api/Auth/login", payload),


  // Gọi api này để lấy thông tin user
  getMe: () => axiosClient.get("/api/Auth/me"),

  // API log supabase
  loginAuthgg: (payload) => axiosClient.post("/api/Auth/google-login", payload)
};

export default authApi;
