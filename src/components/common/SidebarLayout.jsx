// components/common/SidebarLayout.jsx
import { useNavigate, useLocation, Outlet } from "react-router-dom";

export default function SidebarLayout({ menuItems, title, menuLabel, userInfo, basePath }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === basePath) return location.pathname === basePath;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen w-full bg-[#0B1120] text-white font-sans overflow-hidden">
      <aside className="w-64 border-r border-white/5 bg-[#0B1120] flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20">
            {userInfo.avatar}
          </div>
          <h1 className="text-lg font-bold tracking-wide text-white">{title}</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            {menuLabel}
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

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className={`w-8 h-8 rounded-full ${userInfo.color} flex items-center justify-center text-white font-bold text-sm`}>
              {userInfo.avatar}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{userInfo.name}</p>
              <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate("/login")}}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}