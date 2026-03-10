import React, { useState, useEffect } from "react";
import SidebarLayout from "../../common/SidebarLayout";
// NHỚ IMPORT API VÀO ĐÂY (Sếp check lại đường dẫn ../../api/authApi cho đúng folder nhé)
import authApi from "../../../api/authApi";

const menuItems = [
  { path: "/manager", label: "Dự án", icon: "📁" },
  { path: "/manager/labels", label: "Thư viện Nhãn", icon: "🏷️" },
  { path: "/manager/disputes", label: "Khiếu nại & Tranh chấp", icon: "⚖️" },
  { path: "/manager/quality", label: "Điểm Chất lượng", icon: "⭐" },
  { path: "/manager/export", label: "Xuất Dữ liệu", icon: "📥" },
];

export default function ManagerGlobalLayout() {
  // STATE lưu thông tin user truyền cho Sidebar
  const [userInfo, setUserInfo] = useState({
    name: "Đang tải...",
    email: "Đang lấy thông tin...",
    avatar: "...",
    color: "bg-purple-500",
  });

  // GỌI API LẤY THÔNG TIN USER KHI LOAD LAYOUT
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Kiểm tra token

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
            avatar: displayName.charAt(0).toUpperCase(), // Tự động lấy chữ cái đầu tiên làm Avatar
            color: "bg-purple-500",
          });
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin Sidebar:", error);
        setUserInfo({
          name: "Lỗi kết nối",
          email: "Vui lòng đăng nhập lại",
          avatar: "!",
          color: "bg-rose-500", // Báo lỗi thì đổi avatar sang màu đỏ cho ngầu
        });
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <SidebarLayout
      menuItems={menuItems}
      title="LabelMaster"
      menuLabel="Danh mục Quản lý"
      basePath="/manager"
      userInfo={userInfo} // Truyền cái state đã gọi API xuống đây
    />
  );
}
