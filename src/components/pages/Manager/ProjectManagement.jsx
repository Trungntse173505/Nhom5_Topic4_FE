import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectManagement } from "../../../hooks/Manager/useProjectManagement";

import authApi from "../../../api/authApi";
import { AnimatedButton } from "../../common/AnimatedButton";
import { AuroraBackground } from "../../common/aurora-background";

// -- Dữ liệu giả (Mock data) cho những trường API chưa cung cấp (TODO: Báo Backend) --
const labelSummary = [
  { category: "Entity", count: 18, detail: "nhãn cho văn bản" },
  { category: "Bounding Box", count: 24, detail: "nhãn cho ảnh / video" },
  { category: "Classification", count: 12, detail: "nhãn cho audio / text" },
  { category: "Multi-label", count: 9, detail: "nhiều nhãn trên một item" },
];

const userRows = [
  {
    name: "Nguyễn An",
    role: "Annotator",
    active: true,
    project: "Clinical Notes NER",
  },
  {
    name: "Trần Bình",
    role: "Annotator",
    active: true,
    project: "Road Scene Detection",
  },
  {
    name: "Lê Chi",
    role: "Reviewer",
    active: false,
    project: "Call Center Sentiment",
  },
  {
    name: "Phạm Duy",
    role: "Reviewer",
    active: true,
    project: "Video Event Tagging",
  },
];

export default function ProjectManagement() {
  const navigate = useNavigate();

  const { projects, isLoadingProjects, isCreating, createNewProject } =
    useProjectManagement();

  const [filter, setFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: "Đang tải...",
    email: "Đang lấy thông tin...",
  });

  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    type: "Image",
    description: "",
    guideline: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUserInfo({ name: "Quản lý Dự Án", email: "Chưa đăng nhập" });
          return;
        }

        const response = await authApi.getMe();
        const data = response.data || response;

        if (data) {
          setUserInfo({
            name: data.fullName || data.userName || "Quản lý Dự Án",
            email: data.email || "Không rõ email",
          });
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin cá nhân:", error);
        setUserInfo({
          name: "Quản lý Dự Án",
          email: "Lỗi kết nối máy chủ",
        });
      }
    };

    fetchUserProfile();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (filter === "All") return true;
      if (filter === "Open")
        return p.status === "Open" || p.status === "Active";
      if (filter === "Closed")
        return p.status !== "Open" && p.status !== "Active";

      return p.status === filter;
    });
  }, [projects, filter]);

  const handleProjectClick = useCallback(
    (id) => {
      navigate(`/manager/projects/${id}`);
    },
    [navigate],
  );

  const handleSubmit = useCallback(async () => {
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
  }, [formData, createNewProject]);

  // --- Tính toán thống kê tự động dựa trên mảng `projects` thật ---
  const stats = useMemo(() => {
    const total = projects.length;
    let active = 0,
      pending = 0,
      closed = 0;

    projects.forEach((p) => {
      const s = p.status;
      if (s === "Active" || s === "Open") active++;
      else if (s === "Closed" || s === "Completed") closed++;
      else pending++; // Draft, Submitted, Reviewing...
    });

    return { total, active, pending, closed };
  }, [projects]);

  const projectStats = [
    {
      label: "Tổng dự án",
      value: stats.total.toString(),
      note: "đang theo dõi",
      tone: "bg-sky-500/10 text-sky-300",
    },
    {
      label: "Đang active",
      value: stats.active.toString(),
      note: "đang thực hiện gắn nhãn",
      tone: "bg-emerald-500/10 text-emerald-300",
    },
    {
      label: "Chờ nộp",
      value: stats.pending.toString(),
      note: "đợi annotator hoàn tất",
      tone: "bg-amber-500/10 text-amber-300",
    },
    {
      label: "Đã đóng",
      value: stats.closed.toString(),
      note: "đã bàn giao / kết thúc",
      tone: "bg-violet-500/10 text-violet-300",
    },
  ];

  return (
    <AuroraBackground className="font-sans relative w-full !justify-start !items-start !p-0">
      <div className="w-full flex flex-col min-h-screen z-20">
        <header className="w-full flex items-center justify-between px-8 h-[72px] bg-[#0B1120]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A855F7] shadow-lg shadow-purple-500/20 text-white shrink-0">
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
            <div className="flex flex-col justify-center">
              <h1 className="text-base sm:text-lg font-semibold tracking-wide text-white leading-tight">
                {userInfo.name === "Đang tải..."
                  ? userInfo.name
                  : `Xin chào, ${userInfo.name}`}
              </h1>
              <p className="text-xs sm:text-sm text-blue-400 leading-tight mt-0.5">
                {userInfo.email}
              </p>
            </div>
          </div>
        </header>

        <main className="w-full p-8 max-w-7xl mx-auto space-y-8 flex-1">
          {/* THỐNG KÊ (4 CARDS) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {projectStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/5 bg-[#151D2F]/90 backdrop-blur-sm p-5 shadow-sm hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-400">{item.label}</p>
                    <div className="mt-2 text-3xl font-bold text-white">
                      {item.value}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${item.tone}`}
                  >
                    overview
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-500">{item.note}</p>
              </div>
            ))}
          </section>

          {/* THANH CÔNG CỤ (TITTLE + FILTER + CREATE) */}
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Danh sách Project theo trạng thái
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Hiển thị project, loại dữ liệu, trạng thái và nhóm user đang xử
                lý. (Click vào dòng dự án để xem chi tiết)
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
                          : "bg-[#151D2F]/80 backdrop-blur text-gray-400 border border-white/5 hover:bg-white/5"
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
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all shrink-0"
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
            <div className="text-center py-10 text-gray-500 bg-[#151D2F]/80 backdrop-blur rounded-xl border border-white/5">
              Chưa có dự án nào khớp với bộ lọc này.
            </div>
          ) : (
            <section className="w-full">
              {/* DANH SÁCH DỰ ÁN */}
              <div className="rounded-2xl border border-white/5 bg-[#151D2F]/90 backdrop-blur-sm p-5 shadow-sm overflow-hidden flex flex-col min-w-0 w-full">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="text-gray-500 uppercase tracking-wider text-xs border-b border-white/10">
                        <th className="pb-3 font-medium min-w-[150px]">
                          Project
                        </th>
                        <th className="pb-3 font-medium px-2">Loại</th>
                        <th className="pb-3 font-medium px-2">Các Nhãn</th>
                        <th className="pb-3 font-medium px-2">Tiến độ</th>
                        <th className="pb-3 font-medium px-2">
                          Số người thực hiện
                        </th>
                        <th className="pb-3 font-medium text-right min-w-[90px]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((proj) => {
                        // Tính toán tiến độ thực tế thiệtt dựa trên số lượng item đã gắn nhãn và tổng số item, nếu API chưa cung cấp `rateComplete` chính xác
                        const totalItems = proj.totalDataItems || 0;
                        const labeledItems = proj.completedItems || 0;
                        let progressRate =
                          proj.rateComplete !== undefined
                            ? Math.round(proj.rateComplete)
                            : totalItems > 0
                              ? Math.round((labeledItems / totalItems) * 100)
                              : 0;
                        progressRate = Math.min(Math.max(progressRate, 0), 100);

                        return (
                          <tr
                            key={proj.projectID || Math.random()}
                            className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                            onClick={() => handleProjectClick(proj.projectID)}
                          >
                            <td className="py-4 pr-2">
                              <div className="font-medium text-white group-hover:text-blue-400 transition-colors break-words whitespace-normal max-w-[220px]">
                                {proj.projectName}
                              </div>
                            </td>
                            <td className="py-4 text-gray-300 px-2 whitespace-nowrap text-xs sm:text-sm">
                              {proj.projectType || "TBD"}
                            </td>
                            <td className="py-4 text-gray-300 px-2 whitespace-normal break-words text-xs min-w-[120px]">
                              {proj.labelCategories ||
                                proj.topic ||
                                "Chưa có nhãn"}
                            </td>
                            <td className="py-4 px-2 min-w-[120px]">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 flex-1 max-w-[80px] rounded-full bg-[#0B1120] overflow-hidden border border-white/5 hidden sm:block">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      proj.status === "Active" ||
                                      proj.status === "Open"
                                        ? "bg-emerald-500"
                                        : proj.status === "Submitted"
                                          ? "bg-sky-500"
                                          : proj.status === "Reviewing"
                                            ? "bg-amber-400"
                                            : "bg-violet-500"
                                    }`}
                                    style={{ width: `${progressRate}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-xs whitespace-nowrap ${progressRate === 100 ? "text-emerald-400" : "text-gray-300"}`}
                                >
                                  {progressRate}%
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-gray-400 text-xs px-2 whitespace-nowrap">
                              {proj.memberCount > 0 ? (
                                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                                  {proj.memberCount} thành viên
                                </span>
                              ) : (
                                "Trống"
                              )}
                            </td>
                            <td className="py-4 text-right pl-2">
                              <span
                                className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-medium shrink-0 min-w-[75px] ${
                                  proj.status === "Open" ||
                                  proj.status === "Active"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : proj.status === "Submitted"
                                      ? "bg-sky-500/10 text-sky-400"
                                      : "bg-gray-500/10 text-gray-400"
                                }`}
                              >
                                {proj.status === "Open" ||
                                proj.status === "Active"
                                  ? "Đang mở"
                                  : proj.status || "Đã đóng"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* MODAL TẠO DỰ ÁN */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#151D2F] border border-white/10 rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">
                Tạo Dự Án Mới
              </h2>
              <div className="space-y-4">
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
                    <option value="Image">Ảnh</option>
                    <option value="Text">Văn bản</option>
                    <option value="Audio">Âm thanh</option>
                    <option value="Video">Video</option>
                    <option value="Mixed">Hỗn hợp</option>
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
                    Hướng dẫn (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={formData.guideline}
                    onChange={(e) =>
                      setFormData({ ...formData, guideline: e.target.value })
                    }
                    className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                    placeholder="Nhập hướng dẫn..."
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
    </AuroraBackground>
  );
}
