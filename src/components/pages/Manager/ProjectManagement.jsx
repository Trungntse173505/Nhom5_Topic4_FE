import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectManagement } from "../../../hooks/useProjectManagement";

// IMPORT HIỆU ỨNG TỪ THƯ MỤC COMMON
import { CardSpotlight } from "../../common/card-spotlight";
// IMPORT NÚT BẤM ANIMATED
import { AnimatedButton } from "../../common/AnimatedButton";

export default function ProjectManagement() {
  const navigate = useNavigate();

  const { projects, isLoadingProjects, isCreating, createNewProject } =
    useProjectManagement();

  const [filter, setFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    topic: "", // Giữ state này để push lên BE, mặc định là ""
    type: "Image",
    description: "",
    guideline: "",
  });

  const handleLogout = () => navigate("/login");

  // LOGIC LỌC ĐÃ ĐƯỢC FIX BỌC LÓT (Bắt cả Open lẫn Active)
  const filteredProjects = projects.filter((p) => {
    if (filter === "All") return true;
    if (filter === "Open") return p.status === "Open" || p.status === "Active";
    if (filter === "Closed") return p.status === "Closed";
    return p.status === filter;
  });

  const handleSubmit = async () => {
    // Chỉ check bắt buộc Tên dự án, không check topic nữa
    if (!formData.name) {
      alert("Vui lòng nhập Tên dự án!");
      return;
    }

    const isSuccess = await createNewProject(formData);
    if (isSuccess) {
      setIsModalOpen(false);
      setFormData({
        name: "",
        topic: "",
        type: "Image",
        description: "",
        guideline: "",
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1120] text-white font-sans relative">
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
              Bảng Điều Khiển
            </h1>
            <p className="text-sm text-gray-400">test@gmail.com</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
        >
          Đăng xuất
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Quản Lý Dự Án</h1>
            <p className="text-sm text-gray-400 mt-1">
              Quản lý tất cả các dự án dán nhãn trong hệ thống
            </p>

            <div className="flex gap-2 mt-4">
              {["All", "Open", "Closed"].map((f) => {
                const labelVN =
                  f === "All"
                    ? "Tất cả"
                    : f === "Open"
                      ? "Đang hoạt động"
                      : "Đã đóng";
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filter === f
                        ? "bg-blue-600 text-white"
                        : "bg-[#151D2F] text-gray-400 border border-white/5 hover:bg-white/5"
                    }`}
                  >
                    {labelVN}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all"
          >
            + Tạo Dự Án Mới
          </button>
        </div>

        {isLoadingProjects ? (
          <div className="flex justify-center items-center py-10">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="ml-3 text-gray-400">Đang tải dữ liệu...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-[#151D2F] rounded-xl border border-white/5">
            Chưa có dự án nào khớp với bộ lọc này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => (
              <CardSpotlight
                key={proj.projectID || Math.random()}
                onClick={() => navigate(`/manager/projects/${proj.projectID}`)}
                className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm hover:border-white/10 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white group-hover/spotlight:text-blue-400 transition-colors">
                    {proj.projectName || "Dự án không tên"}
                  </h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      proj.status === "Open" || proj.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {proj.status === "Open" || proj.status === "Active"
                      ? "Đang mở"
                      : "Đã đóng"}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mb-6">
                  Loại:{" "}
                  <span className="text-gray-200">
                    {proj.projectType || "Không xác định"}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2 text-gray-400">
                    <span>Tiến độ</span>
                    <span>0% (0/0)</span>
                  </div>
                  <div className="w-full bg-[#0B1120] h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-2 rounded-full ${
                        proj.status === "Open" || proj.status === "Active"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                      style={{ width: `0%` }}
                    ></div>
                  </div>
                </div>
              </CardSpotlight>
            ))}
          </div>
        )}
      </main>

      {/* MODAL TẠO DỰ ÁN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#151D2F] border border-white/10 rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Tạo Dự Án Mới</h2>
            <div className="space-y-4">
              {/* ĐÃ XÓA TRƯỜNG NHẬP "CHỦ ĐỀ", CHỈ GIỮ LẠI TÊN DỰ ÁN */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tên Dự Án <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Nhập tên dự án..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Loại Dữ Liệu
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="Image">Ảnh (Image)</option>
                  <option value="Text">Văn bản (Text)</option>
                  <option value="Audio">Âm thanh (Audio)</option>
                  <option value="Video">Video</option>
                  <option value="Mixed">Hỗn hợp (Mixed)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 h-20 resize-none"
                  placeholder="Mô tả ngắn gọn về dự án..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Đường dẫn Hướng dẫn (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={formData.guideline}
                  onChange={(e) =>
                    setFormData({ ...formData, guideline: e.target.value })
                  }
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Nhập đường dẫn tài liệu..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isCreating}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>

              <AnimatedButton onClick={handleSubmit} disabled={isCreating}>
                Tạo Dự Án
              </AnimatedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
