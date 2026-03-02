import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProjectManagement() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State lưu thông tin form
  const [formData, setFormData] = useState({
    name: "",
    type: "Image",
    description: "",
    guideline: "",
  });

  // State lưu file người dùng chọn
  const [datasetFiles, setDatasetFiles] = useState([]);

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

  // --- HÀM XỬ LÝ UPLOAD CLOUDINARY & CALL API BE ---
  const handleCreateProject = async () => {
    if (!formData.name || datasetFiles.length === 0) {
      alert("Vui lòng nhập tên dự án và chọn ít nhất 1 file dataset!");
      return;
    }

    const UPLOAD_PRESET = "react_upload";
    const CLOUD_NAME = "dlgsidnr2";

    try {
      setIsUploading(true);
      const uploadedUrls = [];

      // Dùng Promise.all để upload HÀNG LOẠT file cùng lúc lên Cloudinary
      const uploadPromises = Array.from(datasetFiles).map(async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);

        // --- THÊM PHÂN LOẠI THƯ MỤC Ở ĐÂY ---
        // Phân loại vào folder tương ứng: Datasets/Image, Datasets/Mixed...
        const folderName = `Datasets/${formData.type}`;
        data.append("folder", folderName);
        // ------------------------------------

        // Đẩy thẳng lên API của Cloudinary (dùng auto để tự động nhận dạng mọi file)
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          {
            method: "POST",
            body: data,
          },
        );

        const result = await response.json();

        if (result.secure_url) {
          uploadedUrls.push(result.secure_url);
        } else {
          console.error("Lỗi upload từ Cloudinary:", result);
        }
      });

      await Promise.all(uploadPromises);

      // SAU KHI CÓ LINK CLOUDINARY -> TẠO PAYLOAD GỬI BACKEND
      const payloadToBackend = {
        projectName: formData.name,
        projectType: formData.type,
        description: formData.description,
        guideline: formData.guideline,
        datasetUrls: uploadedUrls, // Mảng chứa các link Cloudinary
      };

      console.log("DỮ LIỆU GỬI CHO BE LÀ:", payloadToBackend);

      // Nối các link lại với nhau để hiển thị cho ông xem tận mắt
      const links = uploadedUrls.join("\n\n");
      alert(`Upload thành công lên Cloudinary!\n\nLink của ông đây:\n${links}`);

      setIsModalOpen(false);

      // Reset form
      setFormData({ name: "", type: "Image", description: "", guideline: "" });
      setDatasetFiles([]);
    } catch (error) {
      console.error("Lỗi khi upload Cloudinary:", error);
      alert("Có lỗi xảy ra khi upload file!");
    } finally {
      setIsUploading(false);
    }
  };

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

      {/* MODAL TẠO DỰ ÁN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#151D2F] border border-white/10 rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              Create New Project
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Enter project name..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Data Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="Image">Image</option>
                  <option value="Text">Text</option>
                  <option value="Audio">Audio</option>
                  <option value="Video">Video</option>
                  {/* --- THÊM TYPE MIXED Ở ĐÂY --- */}
                  <option value="Mixed">Mixed (Hỗn hợp)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 h-20 resize-none"
                  placeholder="Brief description..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Project Guidelines
                </label>
                <textarea
                  value={formData.guideline}
                  onChange={(e) =>
                    setFormData({ ...formData, guideline: e.target.value })
                  }
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 h-20 resize-none"
                  placeholder="Instructions for annotators..."
                ></textarea>
              </div>

              {/* INPUT UPLOAD FILE */}
              <div className="border border-dashed border-white/20 p-4 rounded-lg bg-[#0B1120]">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Upload Dataset (Multiple Files){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setDatasetFiles(e.target.files)}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
                />
                {datasetFiles.length > 0 && (
                  <p className="mt-2 text-xs text-emerald-400">
                    Đã chọn {datasetFiles.length} file.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    Uploading...
                  </>
                ) : (
                  "Save & Upload"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
