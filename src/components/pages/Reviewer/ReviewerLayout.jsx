import React, { useState, useEffect } from "react";
import SidebarLayout from "../../common/SidebarLayout";
import authApi from "../../../api/authApi";

// 1. IMPORT HIỆU ỨNG AURORA
import { AuroraBackground } from "../../common/aurora-background";

const menuItems = [
  { path: "/reviewer", label: "Dashboard", icon: "🔍" },
  { path: "/reviewer/disputes", label: "Khiếu Nại", icon: "⚖️" }, 
  { path: "/reviewer/credit-score", label: "Điểm Tín Nhiệm", icon: "🏆" },
];

export default function ReviewerLayout() {
  const [userInfo, setUserInfo] = useState({
    name: "Đang tải...",
    email: "",
    avatar: "R",
    color: "bg-purple-500",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.getMe();
        const data = response.data || response;

        const firstLetter = data.fullName
          ? data.fullName.charAt(0).toUpperCase()
          : "R";

        setUserInfo({
          name: data.fullName || "Reviewer",
          email: data.email || "",
          avatar: firstLetter,
          color: "bg-purple-500",
        });

        if (data.score !== undefined) {
          localStorage.setItem("reviewerScore", data.score);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin Reviewer:", error);
        setUserInfo({
          name: "Reviewer",
          email: "",
          avatar: "R",
          color: "bg-purple-500",
        });
      }
    };

    fetchUser();
  }, []);

  return (
    // ĐÃ FIX: Thêm h-screen và overflow-hidden để khóa cứng khung, không bị scroll 2 lớp
    <AuroraBackground className="font-sans relative w-full h-screen !justify-start !items-start !p-0 overflow-hidden">
      {/* LỚP PHỦ MỜ (OVERLAY): Giúp text và thẻ Card nổi lên, nền cực quang chìm xuống ảo ma hơn */}
      <div className="absolute inset-0 bg-[#0B1120]/60 z-0 pointer-events-none"></div>

      <div className="w-full flex h-full z-20 relative">
        <SidebarLayout
          menuItems={menuItems}
          title="LabelMaster"
          menuLabel="Menu"
          basePath="/reviewer"
          userInfo={userInfo}
        />
      </div>
    </AuroraBackground>
  );
}
