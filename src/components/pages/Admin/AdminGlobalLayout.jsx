import SidebarLayout from "../../common/SidebarLayout";

const menuItems = [
  { path: "/admin", label: "Overview", icon: "📊" },
  { path: "/admin/users", label: "Người dùng", icon: "👥" },
  { path: "/admin/logs", label: "Nhật ký hoạt động", icon: "📋" },
  { path: "/admin/config", label: "Cấu hình hệ thống", icon: "⚙️" },
];

export default function AdminGlobalLayout() {
  return (
    <SidebarLayout
      menuItems={menuItems}
      title="LabelMaster"
      menuLabel="Menu"
      basePath="/admin"
      userInfo={{ name: "Admin User", avatar: "A", color: "bg-blue-500" }}
    />
  );
}