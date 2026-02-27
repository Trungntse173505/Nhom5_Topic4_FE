import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProjectManagement() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => navigate("/login");

  const projects = [
    {
      id: 1,
      name: "Phân loại biển báo giao thông",
      type: "Image",
      status: "Active",
      progress: 75,
      totalTasks: 2000,
    },
    {
      id: 2,
      name: "Gán nhãn cảm xúc hội thoại",
      type: "Text",
      status: "Active",
      progress: 40,
      totalTasks: 1000,
    },
    {
      id: 3,
      name: "Phân tách âm thanh đường phố",
      type: "Audio",
      status: "Closed",
      progress: 100,
      totalTasks: 500,
    },
  ];

  const filteredProjects =
    filter === "All" ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="min-h-screen w-full bg-[#0B1120] text-white font-sans relative">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-[#0B1120] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A855F7] shadow-lg shadow-purple-500/20 text-white">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-wide text-white">
              Manager Dashboard
            </h1>
            <p className="text-sm text-gray-400">test@gmail.com</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Project Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage all labeling projects in the system
            </p>

            {/* Bộ lọc (Filters) */}
            <div className="flex gap-2 mt-4">
              {["All", "Active", "Closed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-[#151D2F] text-gray-400 border border-white/5 hover:bg-white/5"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Nút mở Modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all"
          >
            + Create New Project
          </button>
        </div>

        {/* Danh sách dự án */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/manager/projects/${proj.id}`)}
              className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm hover:border-white/10 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {proj.name}
                </h3>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${proj.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"}`}
                >
                  {proj.status}
                </span>
              </div>
              <div className="text-sm text-gray-400 mb-6">
                Type: <span className="text-gray-200">{proj.type}</span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2 text-gray-400">
                  <span>Progress</span>
                  <span>
                    {proj.progress}% (
                    {Math.floor((proj.totalTasks * proj.progress) / 100)}/
                    {proj.totalTasks})
                  </span>
                </div>
                <div className="w-full bg-[#0B1120] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${proj.status === "Active" ? "bg-blue-500" : "bg-gray-500"}`}
                    style={{ width: `${proj.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Tạo Dự Án */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#151D2F] border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              Create New Project
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Enter project name..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Data Type
                </label>
                <select className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500">
                  <option>Image</option>
                  <option>Text</option>
                  <option>Audio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 h-24 resize-none"
                  placeholder="Brief description..."
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
