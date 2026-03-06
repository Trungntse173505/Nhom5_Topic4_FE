import SidebarLayout from "../../common/SidebarLayout";

const menuItems = [
  { path: "/reviewer", label: "Dashboard", icon: "🔍" },
];

export default function ReviewerLayout() {
  return (
    <SidebarLayout
      menuItems={menuItems}
      title="LabelMaster"
      menuLabel="Menu"
      basePath="/reviewer"
      userInfo={{ name: "Reviewer", email: "", avatar: "R", color: "bg-purple-500" }}
    />
  );
}
