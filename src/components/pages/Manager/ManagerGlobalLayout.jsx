import SidebarLayout from "../../common/SidebarLayout";

const menuItems = [
  { path: "/manager", label: "Projects", icon: "📁" },
  { path: "/manager/labels", label: "Label Library", icon: "🏷️" },
  { path: "/manager/disputes", label: "Disputes", icon: "⚖️" },
  { path: "/manager/quality", label: "Quality Score", icon: "⭐" },
  { path: "/manager/export", label: "Export Data", icon: "📥" },
];

export default function ManagerGlobalLayout() {
  return (
    <SidebarLayout
      menuItems={menuItems}
      title="LabelMaster"
      menuLabel="Menu"
      basePath="/manager"
      userInfo={{ name: "Manager User", email: "test@gmail.com", avatar: "M", color: "bg-purple-500" }}
    />
  );
}