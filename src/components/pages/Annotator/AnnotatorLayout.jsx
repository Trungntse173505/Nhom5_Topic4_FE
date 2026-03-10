import SidebarLayout from "../../common/SidebarLayout";

const menuItems = [
  { path: "/annotator", label: "Quản Lý Nhiệm Vụ", icon: "📋" },
  { path: "/annotator/score", label: "Điểm Cá Nhân", icon: "🏆" },
];

export default function AnnotatorLayout() {
  return (
    <SidebarLayout
      menuItems={menuItems}
      title="LabelMaster"
      menuLabel="Menu"
      basePath="/annotator"
      userInfo={{ name: "Annotator", email: "", avatar: "A", color: "bg-green-500" }}
    />
  );
}