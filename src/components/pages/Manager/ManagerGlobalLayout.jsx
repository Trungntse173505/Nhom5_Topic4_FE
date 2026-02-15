import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

export default function ManagerGlobalLayout() {
  const navigate = useNavigate();
  const location = useLocation(); // Để biết đang ở trang nào mà highlight menu

  const handleLogout = () => {
    navigate("/login");
  };

  const menuItems = [
    { path: "/manager", label: "Projects", icon: "📁" },
    { path: "/manager/disputes", label: "Disputes", icon: "⚖️" },
    { path: "/manager/quality", label: "Quality Score", icon: "⭐" },
    { path: "/manager/export", label: "Export Data", icon: "📥" },
  ];

  // Kiểm tra xem menu nào đang active
  const isActive = (path) => {
    if (path === "/manager") {
      return location.pathname === "/manager";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen w-full bg-[#0B1120] text-white font-sans overflow-hidden">
      {/* Sidebar Tổng (Global Sidebar) */}
      <aside className="w-64 border-r border-white/5 bg-[#0B1120] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20">
            L
          </div>
          <h1 className="text-lg font-bold tracking-wide text-white">
            LabelMaster
          </h1>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Manager Menu
          </p>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                Manager User
              </p>
              <p className="text-xs text-gray-500 truncate">test@gmail.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area (Nơi render 4 file kia) */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />{" "}
        {/* React Router sẽ tự động ném nội dung các trang vào đây */}
      </main>
    </div>
  );
}
