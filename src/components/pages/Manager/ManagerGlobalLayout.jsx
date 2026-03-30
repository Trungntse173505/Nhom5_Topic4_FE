import React, { useState, useEffect } from "react";
import SidebarLayout from "../../common/SidebarLayout";
import authApi from "../../../api/authApi";
import { AuroraBackground } from "../../common/aurora-background";

// Đẩy menu ra ngoài để không bị tạo lại mỗi lần render
const menuItems = [
  { path: "/manager", label: "Dự án", icon: "📁" },
  { path: "/manager/overview-project", label: "Tổng quan Project", icon: "📊" },
  { path: "/manager/labels", label: "Thư viện Nhãn", icon: "🏷️" },
  { path: "/manager/disputes", label: "Khiếu nại & Tranh chấp", icon: "⚖️" },
  { path: "/manager/quality", label: "Điểm Chất lượng", icon: "⭐" },
  { path: "/manager/export", label: "Xuất Dữ liệu", icon: "📥" },
];

const ManagerGlobalLayout = React.memo(() => {
  const [userInfo, setUserInfo] = useState({
    name: "Đang tải...",
    email: "Đang lấy thông tin...",
    avatar: "...",
    color: "bg-purple-500",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUserInfo({
            name: "Khách",
            email: "Chưa đăng nhập",
            avatar: "?",
            color: "bg-gray-500",
          });
          return;
        }

        const response = await authApi.getMe();
        const data = response.data || response;

        if (data) {
          const displayName = data.fullName || data.userName || "Quản lý";
          setUserInfo({
            name: displayName,
            email: data.email || "Không rõ email",
            avatar: displayName.charAt(0).toUpperCase(),
            color: "bg-purple-500",
          });
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin Sidebar:", error);
        setUserInfo({
          name: "Lỗi kết nối",
          email: "Vui lòng đăng nhập lại",
          avatar: "!",
          color: "bg-rose-500",
        });
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <AuroraBackground className="font-sans relative w-full h-screen !justify-start !items-start !p-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#0B1120]/60 z-0 pointer-events-none"></div>
      <div className="w-full flex h-full z-20 relative">
        <SidebarLayout
          menuItems={menuItems}
          title="LabelMaster"
          menuLabel="Danh mục Quản lý"
          basePath="/manager"
          userInfo={userInfo}
        />
      </div>
    </AuroraBackground>
  );
});

export default ManagerGlobalLayout;
