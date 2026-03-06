import SidebarLayout from "../../common/SidebarLayout";

const menuItems = [
  { path: "/manager", label: "Dự án", icon: "📁" },
  { path: "/manager/labels", label: "Thư viện Nhãn", icon: "🏷️" },
  { path: "/manager/disputes", label: "Khiếu nại & Tranh chấp", icon: "⚖️" },
  { path: "/manager/quality", label: "Điểm Chất lượng", icon: "⭐" },
  { path: "/manager/export", label: "Xuất Dữ liệu", icon: "📥" },
];

export default function ManagerGlobalLayout() {
  return (
    <SidebarLayout
      menuItems={menuItems}
      title="LabelMaster"
      menuLabel="Danh mục Quản lý"
      basePath="/manager"
      userInfo={{
        name: "Quản lý",
        email: "test@gmail.com",
        avatar: "Q", // Chữ cái đầu của tên (Q trong Quản lý)
        color: "bg-purple-500",
      }}
    />
  );
}
