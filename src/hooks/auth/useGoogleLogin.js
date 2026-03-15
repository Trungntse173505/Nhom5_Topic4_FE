import { useState, useEffect, useRef } from "react";
import { supabase } from "../../api/supabaseClient"; 
import authApi from "../../api/authApi"; 
import { useNavigate } from "react-router-dom";
import { updateUserPresence } from "../../services/firebase";

export const useGoogleLogin = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const navigate = useNavigate();
  
  // CHỐT CHẶN BẢO VỆ GỌI API 2 LẦN
  const isLoggingIn = useRef(false); 

  const roleToPath = {
    admin: '/admin',
    manager: '/manager',
    annotator: '/annotator',
    reviewer: '/reviewer',
  };

  const loginWithGoogle = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    isLoggingIn.current = false; // Reset lại chốt

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/login", 
      },
    });

    if (error) {
      setGoogleError("Không thể kết nối với Google.");
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          
          // NẾU ĐÃ GỌI API RỒI THÌ ĐÁ VĂNG LẦN GỌI THỨ 2 CỦA REACT
          if (isLoggingIn.current) return; 
          isLoggingIn.current = true; // Sập chốt

          setIsGoogleLoading(true);
          setGoogleError(null);       
          try {
            const googleToken = session.access_token;
            const apiRes = await authApi.loginAuthgg({ token: googleToken });
            
            const raw = apiRes?.data ?? apiRes;
            const isSuccess = raw?.success === true || raw?.Success === true;

            if (isSuccess) {
              const payloadData = raw?.data ?? raw;
              const token = payloadData?.token || payloadData?.Token;
              const user = payloadData?.user || payloadData?.User;

              if (token && user) {
                // 1. Lưu token hệ thống
                localStorage.setItem("token", token);
                
                // 2. Ép cấu trúc User
                const finalUser = {
                  id: user.userId || user.UserId || user.id,
                  role: user.roleName || user.RoleName || user.role,
                  fullName: user.fullName || user.FullName || user.name
                };
                localStorage.setItem("user", JSON.stringify(finalUser));

                // 3. Bật đèn Firebase
                try {
                  if (finalUser.id && finalUser.role) {
                    await updateUserPresence(finalUser.id, finalUser.role, true);
                  }
                } catch (e) {}

                // 4. Delay SignOut lại một chút để không phá vỡ luồng đang chạy
                setTimeout(() => supabase.auth.signOut(), 1000);

                // 5. Đá về đúng trang
                const targetPath = roleToPath[String(finalUser.role || '').toLowerCase()] || '/';
                navigate(targetPath);
              }
            } else {
              setGoogleError(raw?.message || raw?.Message || "Xác thực thất bại từ hệ thống.");
              isLoggingIn.current = false; // Mở chốt nếu lỗi
              await supabase.auth.signOut();
            }
          } catch (error) {
            console.error("Google Login Error:", error);
            setGoogleError("Lỗi hệ thống trong quá trình đăng nhập.");
            isLoggingIn.current = false; // Mở chốt nếu lỗi
            await supabase.auth.signOut(); 
          } finally {
            setIsGoogleLoading(false);
          }
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return {
    loginWithGoogle,
    isGoogleLoading,
    googleError,
  };
};