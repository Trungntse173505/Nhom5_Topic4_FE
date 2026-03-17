import { useEffect, useState } from "react";
import SidebarLayout from "../../common/SidebarLayout";
import authApi from "../../../api/authApi";

const menuItems = [
  { path: "/admin", label: "Overview", icon: "📊" },
  { path: "/admin/users", label: "Người dùng", icon: "👥" },
  { path: "/admin/logs", label: "Nhật ký hoạt động", icon: "📋" },
  { path: "/admin/config", label: "Cấu hình hệ thống", icon: "⚙️" },
  { path: "/admin/rules", label: "Quy tắc (Rules)", icon: "⚖️" },
];

const colorPalette = ["bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500"];
const pickColorFromName = (name = "") => {
  const clean = String(name || "").trim();
  if (!clean) return "bg-purple-500";
  let hash = 0;
  for (let i = 0; i < clean.length; i += 1) hash = (hash + clean.charCodeAt(i) * 17) % 9973;
  return colorPalette[hash % colorPalette.length];
};

export default function AdminGlobalLayout() {
  const [userInfo, setUserInfo] = useState({
    name: "Đang tải...",
    email: "Đang lấy thông tin...",
    avatar: "…",
    color: "bg-purple-500",
  });

  useEffect(() => {
    const fetchUser = async () => {
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
        const res = await authApi.getMe();
        const data = res?.data || res;
        const displayName = data?.fullName || data?.userName || "Admin";
        const email = data?.email || "Không rõ email";
        const color = pickColorFromName(displayName);
        setUserInfo({
          name: displayName,
          email,
          avatar: displayName.charAt(0).toUpperCase(),
          color,
        });
      } catch (error) {
        setUserInfo({
          name: "Lỗi kết nối",
          email: "Vui lòng đăng nhập lại",
          avatar: "!",
          color: "bg-rose-500",
        });
      }
    };

    fetchUser();
  }, []);

  return (
    <SidebarLayout
      menuItems={menuItems}
      title="LabelMaster"
      menuLabel="Menu"
      basePath="/admin"
      userInfo={userInfo}
    />
  );
}
