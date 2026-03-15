import { useState, useEffect } from "react";
import { supabase } from "../../api/supabaseClient"; 
import authApi from "../../api/authApi"; 

export const useGoogleLogin = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  
  const loginWithGoogle = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);

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
          setIsGoogleLoading(true);
          setGoogleError(null);       
          try {
            const googleToken = session.access_token;
            const response = await authApi.loginAuthgg({
              token: googleToken
            });
            const responseData = response.data || response;
            if (responseData.success) {
              const { token, user } = responseData.data;
              localStorage.setItem("token", token);
              localStorage.setItem("user", JSON.stringify(user));
              // navigate("/dashboard"); 
              // hoặc: window.location.href = "/dashboard";
            } else {
              setGoogleError(responseData.message || "Xác thực thất bại từ hệ thống.");
              await supabase.auth.signOut();
            }
          } catch (error) {
            console.error("Google Login Error:", error);
            setGoogleError(
              error.response?.data?.message || 
              "Tài khoản của bạn chưa được cấp phép trong hệ thống."
            );
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
  }, []);

  return {
    loginWithGoogle,
    isGoogleLoading,
    googleError,
  };
};