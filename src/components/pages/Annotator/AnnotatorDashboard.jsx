// AnnotatorDashboard.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  Clock,
  Trophy,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useTasks } from "../../../hooks/Annotator/useTasks";
import { useReputation } from "../../../hooks/Annotator/useReputation";
import { useStartTask } from "../../../hooks/Annotator/useStartTask";
import { useResubmitTask } from "../../../hooks/Annotator/useResubmitTask";
import { useDisputeTask } from "../../../hooks/Annotator/useDisputeTask";

import DisputeModal from "./Dispute/DisputeModal";

import {
  TYPE_ICONS,
  STATUS_NAME,
  STATUS_STYLES,
  ACTION_STYLES,
  STAT_CARDS,
  FILTERS,
} from "./Config";

const TASKS_PER_PAGE = 10;

// 👉 HÀM BƠM ẢNH LÊN CLOUDINARY (Upload Unsigned)
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "react_upload"); // ⚠️ Nhớ đổi tên Preset của sếp vào đây
  formData.append("cloud_name", "dlgsidnr2");

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dlgsidnr2/image/upload",
      {
        method: "POST",
        body: formData,
      },
    );
    if (!res.ok) throw new Error("Upload Cloudinary bị từ chối");
    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error("Lỗi up ảnh lên Cloudinary:", error);
    throw new Error("Tải ảnh thất bại");
  }
};

const AnnotatorDashboard = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [disputeTaskData, setDisputeTaskData] = useState(null);
  const [actionTaskId, setActionTaskId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  const {
    tasks,
    loading: loadingTasks,
    refresh: refreshTasks,
  } = useTasks(null);
  const { currentScore, loading: loadingRep } = useReputation();
  const { start, isStarting } = useStartTask();
  const { resubmit, isResubmitting } = useResubmitTask();
  const { dispute } = useDisputeTask();

  const isLoading = loadingTasks || loadingRep;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const filteredTasks = useMemo(() => {
    if (filter === "All") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
  const currentTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
    return filteredTasks.slice(startIndex, startIndex + TASKS_PER_PAGE);
  }, [filteredTasks, currentPage]);

  const stats = useMemo(
    () => ({
      totalTasks: tasks.length,
      completedTasks: tasks.filter(
        (t) => t.status === "Done" || t.status === "Approved",
      ).length,
      rejectedTasks: tasks.filter((t) => t.status === "Rejected").length,
    }),
    [tasks],
  );

  const handleActionClick = useCallback(
    async (task) => {
      const taskType = task.type || "image";
      if (task.status === "New") {
        setActionTaskId(task.taskID);
        try {
          await start(task.taskID);
          navigate(`/annotator/workspace/${task.taskID}?type=${taskType}`);
        } catch (err) {
          alert("Không thể bắt đầu Task này. Vui lòng thử lại!");
          setActionTaskId(null);
        }
      } else {
        navigate(`/annotator/workspace/${task.taskID}?type=${taskType}`);
      }
    },
    [start, navigate],
  );

  // 👉 HÀM NHẬN DỮ LIỆU TỪ MODAL (CÓ CHỨA MẢNG FILE ẢNH)
  const handleDisputeSubmit = useCallback(
    async (reason, selectedFiles = []) => {
      try {
        setIsUploadingEvidence(true);
        let evidenceUrls = [];

        // Chạy vòng lặp đẩy từng tấm ảnh lên Cloudinary
        if (selectedFiles.length > 0) {
          const uploadPromises = selectedFiles.map((file) =>
            uploadToCloudinary(file),
          );
          evidenceUrls = await Promise.all(uploadPromises);
        }

        // Xong xuôi thì gửi Link ảnh (evidenceUrls) + Reason về cho Backend
        await dispute(disputeTaskData.taskID, reason, evidenceUrls);

        alert(
          "Đã gửi khiếu nại thành công! Quản lý sẽ xem xét lại kết quả của bạn.",
        );
        setDisputeTaskData(null);
        refreshTasks();
      } catch (err) {
        alert(
          err?.response?.data ||
            err.message ||
            "Không thể gửi khiếu nại lúc này.",
        );
      } finally {
        setIsUploadingEvidence(false);
      }
    },
    [dispute, disputeTaskData, refreshTasks],
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        <Loader2 className="animate-spin w-8 h-8 mr-3" /> Đang tải dữ liệu từ
        Server...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8 relative">
      {/* TRUYỀN THUỘC TÍNH XUỐNG MODAL */}
      <DisputeModal
        isOpen={!!disputeTaskData}
        onClose={() => !isUploadingEvidence && setDisputeTaskData(null)}
        onSubmit={handleDisputeSubmit}
        isSubmitting={isUploadingEvidence}
      />

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Quản Lý Nhiệm Vụ</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/annotator/score")}
            className="flex items-center gap-4 bg-[#1e293b] border border-yellow-500/30 hover:border-yellow-500/60 p-3 pr-6 rounded-2xl transition-all shadow-lg shadow-yellow-500/10 group"
          >
            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform">
              <Trophy size={28} />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                Điểm Tín Nhiệm
              </p>
              <p className="text-2xl font-black text-yellow-400">
                {currentScore}{" "}
                <span className="text-sm font-medium text-slate-500">pts</span>
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {STAT_CARDS.map(({ icon: Icon, color, label, key }) => (
          <div
            key={key}
            className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl flex items-center gap-4"
          >
            <div
              className={`p-4 bg-${color}-500/20 rounded-xl text-${color}-500`}
            >
              <Icon size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">{label}</p>
              <p className="text-3xl font-bold text-white">{stats[key]}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-t-2xl p-4 flex items-center justify-between border-b-0">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Filter size={20} className="text-blue-400" /> Danh Sách Nhiệm Vụ
        </h2>
        <div className="flex gap-2">
          {FILTERS.map((status) => (
            <button
              key={status.status}
              onClick={() => setFilter(status.status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status.status
                  ? "bg-blue-600 text-white"
                  : "bg-[#0f172a] text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {status.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-b-2xl overflow-hidden flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0f172a]/50 text-slate-400 text-sm">
            <tr>
              {[
                "Mã / Tên Task",
                "Số lần nộp",
                "Trạng thái",
                "Deadline",
                "Hành động",
              ].map((h, i) => (
                <th
                  key={i}
                  className={`p-4 font-medium ${i === 4 ? "text-right" : i === 1 ? "w-1/4" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentTasks.length > 0 ? (
              currentTasks.map((task) => {
                const action =
                  ACTION_STYLES[task.status] ?? ACTION_STYLES.default;
                const IconType = TYPE_ICONS[task.type] || TYPE_ICONS.image;
                const isCurrentAction = actionTaskId === task.taskID;

                return (
                  <tr
                    key={task.taskID}
                    className="border-t border-slate-700 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-bold text-white mb-1">
                        {IconType}
                        {task.taskName}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-400">
                        Lần:{" "}
                        <span className="text-white font-bold">
                          {task.currentRound}/4
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${STATUS_STYLES[task.status]}`}
                      >
                        {STATUS_NAME[task.status] || task.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-300">
                        <Clock size={14} className="text-slate-500" />
                        {new Date(task.deadline).toLocaleDateString("vi-VN")}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          onClick={() => handleActionClick(task)}
                          disabled={isStarting || isCurrentAction}
                          className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-lg disabled:opacity-50 min-w-[120px] text-center flex items-center justify-center ${action.cls}`}
                        >
                          {isCurrentAction ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                          ) : (
                            action.label
                          )}
                        </button>

                        {task.status === "Rejected" && (
                          <button
                            onClick={() => setDisputeTaskData(task)}
                            className="text-xs text-amber-500 hover:text-amber-400 font-medium underline mt-1"
                          >
                            Khiếu nại kết quả
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  Không tìm thấy task nào với bộ lọc "{filter}"
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="border-t border-slate-700 p-4 bg-[#0f172a]/30 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Hiển thị{" "}
              <span className="font-semibold text-white">
                {(currentPage - 1) * TASKS_PER_PAGE + 1}
              </span>{" "}
              đến{" "}
              <span className="font-semibold text-white">
                {Math.min(currentPage * TASKS_PER_PAGE, filteredTasks.length)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-white">
                {filteredTasks.length}
              </span>{" "}
              task
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                aria-label="Trang trước"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                        currentPage === page
                          ? "bg-blue-600 text-white border border-blue-500"
                          : "border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                aria-label="Trang tiếp theo"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotatorDashboard;
