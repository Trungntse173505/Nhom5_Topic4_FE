import SidebarLayout from "../../common/SidebarLayout";

const menuItems = [
  { path: "/admin", label: "Overview", icon: "📊" },
  { path: "/admin/users", label: "Users", icon: "👥" },
  { path: "/admin/logs", label: "Activity Logs", icon: "📋" },
  { path: "/admin/config", label: "System Config", icon: "⚙️" },
  { path: "/admin/storage", label: "Storage Control", icon: "💾" },
];

export default function AdminGlobalLayout() {
  return (
    <SidebarLayout
      menuItems={menuItems}
      title="LabelMaster"
      menuLabel="Menu"
      basePath="/admin"
      userInfo={{ name: "Admin User", email: "admin@example.com", avatar: "A", color: "bg-blue-500" }}
    />
  );
}