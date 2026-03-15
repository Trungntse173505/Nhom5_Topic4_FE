import { useState, useEffect, useRef } from "react";
import { supabase } from "../../api/supabaseClient"; 
import authApi from "../../api/authApi"; 
import { useNavigate } from "react-router-dom";
import { updateUserPresence } from "../../services/firebase";

export const useGoogleLogin = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const navigate = useNavigate();
  const isLoggingIn = useRef(false);

  // Map đúng các trang theo Role như hệ thống của bạn
  const roleToPath = {
    admin: '/admin',
    manager: '/manager',
    annotator: '/annotator',
    reviewer: '/reviewer',
  };

  const loginWithGoogle = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    isLoggingIn.current = false;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/login" },
    });
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          if (isLoggingIn.current) return;
          isLoggingIn.current = true;
          setIsGoogleLoading(true);

          try {
            const googleToken = session.access_token;
            // axiosClient đã bóc sẵn response.data rồi nên apiRes chính là {success, data...}
            const apiRes = await authApi.loginAuthgg({ token: googleToken });
            
            // Logic bóc tách "chống đạn" giống hệt useLogin của bạn
            const data = apiRes?.data ?? apiRes;
            const token = data?.token || apiRes?.token;
            const user = data?.user || apiRes?.user;
            
            // Kiểm tra xem có Token hệ thống chưa
            if (token && user) {
              // 1. Lưu token hệ thống
              localStorage.setItem("token", token);
              
              // 2. Lưu User theo đúng định dạng id, role, fullName mà App bạn cần
              const finalUser = {
                id: user.userId || user.UserId || user.id,
                role: user.roleName || user.RoleName || user.role,
                fullName: user.fullName || user.FullName || user.name
              };
              localStorage.setItem("user", JSON.stringify(finalUser));

              // 3. Firebase Presence (Đèn xanh Online)
              try {
                if (finalUser.id && finalUser.role) {
                  await updateUserPresence(finalUser.id, finalUser.role, true);
                }
              } catch (e) {}

              // 4. Thoát Supabase sau khi đã lấy xong Token BE
              setTimeout(() => supabase.auth.signOut(), 1000);

              // 5. Chuyển về đúng trang của Role
              const targetPath = roleToPath[String(finalUser.role || '').toLowerCase()] || '/admin';
              navigate(targetPath);
              
            } else {
              throw new Error(apiRes?.message || "Hệ thống không trả về Token.");
            }
          } catch (error) {
            console.error("Google Login Error:", error);
            setGoogleError(error.response?.data?.message || "Tài khoản chưa được Admin cấp phép.");
            isLoggingIn.current = false;
            await supabase.auth.signOut(); 
          } finally {
            setIsGoogleLoading(false);
          }
        }
      }
    );
    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  return { loginWithGoogle, isGoogleLoading, googleError };
};