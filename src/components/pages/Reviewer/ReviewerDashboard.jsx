import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  FolderOpen,
  Filter,
  FileText,
  Headphones,
  Image as ImageIcon,
  Loader2,
  Trophy,
  XCircle,
  MessageSquareWarning,
} from "lucide-react";
import { useTasks } from "../../../hooks/Reviewer/useTasks";
import { useScore } from "../../../hooks/Reviewer/useScore";

const TYPE_ICONS = {
  text: <FileText size={16} className="text-blue-400" />,
  audio: <Headphones size={16} className="text-amber-400" />,
  image: <ImageIcon size={16} className="text-green-400" />,
};

const STATUS_STYLES = {
  PendingReview: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Approved: "bg-green-500/20 text-green-400 border border-green-500/30",
  InProgress: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const ACTION_STYLES = {
  PendingReview: {
    label: "Kiểm duyệt",
    cls: "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 text-white",
  },
  Approved: {
    label: "Xem lại",
    cls: "bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 cursor-not-allowed opacity-50 text-slate-300",
  },
  InProgress: {
    label: "Đang làm lại",
    cls: "bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 cursor-not-allowed opacity-50 text-slate-300",
  },
};

const STAT_CARDS = [
  { icon: FolderOpen, color: "blue", label: "Tổng Task", key: "totalTasks" },
  { icon: CheckCircle2, color: "green", label: "Đã Duyệt", key: "doneTasks" },
  { icon: XCircle, color: "yellow", label: "Chờ Duyệt", key: "pendingTasks" },
];

const FILTERS = ["All", "Pending", "Done"];

const ReviewerDashboard = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const { tasks, isLoading, error, refetch } = useTasks();
  const { myScore, isLoadingScore } = useScore();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (refetch) refetch();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [refetch]);

  if (isLoading && (!tasks || tasks.length === 0))
    return (
      <div className="relative w-full h-full flex flex-col flex-1 overflow-hidden bg-[#0B1120]">
        {/* NỀN CỰC QUANG (Chỉ chiếm không gian của thẻ cha) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AuroraBackground />
        </div>
        <div className="z-10 flex-1 flex items-center justify-center text-white">
          <Loader2 className="animate-spin w-8 h-8 mr-3 text-blue-400" /> Đang
          tải dữ liệu...
        </div>
      </div>
    );

  if (error && (!tasks || tasks.length === 0))
    return (
      <div className="relative w-full h-full flex flex-col flex-1 overflow-hidden bg-[#0B1120]">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AuroraBackground />
        </div>
        <div className="z-10 flex-1 flex flex-col items-center justify-center text-white">
          <XCircle className="text-red-500 w-12 h-12 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <p className="text-slate-300">Lỗi tải dữ liệu: {error}</p>
          <button
            onClick={refetch}
            className="mt-4 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 font-medium transition-all"
          >
            Thử lại
          </button>
        </div>
      </div>
    );

  const stats = {
    totalTasks: tasks?.length || 0,
    pendingTasks:
      tasks?.filter(
        (t) => t.status === "PendingReview" || t.status === "Pending",
      ).length || 0,
    doneTasks: tasks?.filter((t) => t.status === "Approved").length || 0,
  };

  const filteredTasks =
    tasks?.filter((task) => {
      if (filter === "All") return true;
      if (filter === "Pending")
        return task.status === "PendingReview" || task.status === "Pending";
      if (filter === "Done") return task.status === "Approved";
      return true;
    }) || [];

  return (
    // ĐÃ FIX LỖI MẤT LAYOUT: Thay "fixed" bằng "absolute" để Aurora chỉ đè trong khung chứa nó (Dashboard), không đè lên Sidebar
    <div className="relative w-full h-full flex flex-col flex-1 overflow-hidden bg-[#0B1120]">
      {/* NỀN AURORA (Chỉ nằm trọn trong khung Dashboard) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AuroraBackground />
        {/* Lớp phủ mờ để chữ dễ đọc hơn */}
        <div className="absolute inset-0 bg-[#0B1120]/60"></div>
      </div>

      {/* KHUNG NỘI DUNG CHÍNH (Nổi lên trên lớp nền và tự do cuộn) */}
      <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
        <div className="text-slate-200 p-8 max-w-7xl mx-auto flex flex-col min-h-full">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 mt-4">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
              Dashboard Kiểm Duyệt
            </h1>
            <button
              onClick={() => navigate("/reviewer/score")}
              className="flex items-center gap-4 bg-[#151D2F]/80 backdrop-blur-md border border-white/10 hover:border-yellow-500/50 p-3 pr-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.15)] group"
            >
              <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400 group-hover:scale-110 transition-transform">
                <Trophy size={28} />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                  Điểm Tín Nhiệm
                </p>
                <p className="text-2xl font-black text-yellow-400">
                  {isLoadingScore ? (
                    <Loader2 className="animate-spin inline-block w-5 h-5 mr-1" />
                  ) : (
                    myScore
                  )}{" "}
                  <span className="text-sm font-medium text-slate-500">
                    pts
                  </span>
                </p>
              </div>
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
            {STAT_CARDS.map(({ icon: Icon, color, label, key }) => (
              <div
                key={key}
                className="bg-[#151D2F]/80 backdrop-blur-md border border-white/5 p-6 rounded-2xl flex items-center gap-4 hover:border-white/20 transition-all shadow-xl"
              >
                <div
                  className={`p-4 bg-${color}-500/20 rounded-xl text-${color}-400 shadow-[0_0_15px_rgba(var(--color-${color}-500),0.2)]`}
                >
                  <Icon size={28} />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-white transition-all duration-300 drop-shadow-md">
                    {stats[key]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="bg-[#151D2F]/80 backdrop-blur-md border border-white/5 rounded-t-2xl p-4 flex items-center justify-between border-b-0 shadow-lg shrink-0">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Filter size={20} className="text-blue-400" /> Danh Sách Task
              <span className="relative flex h-2 w-2 ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h2>
            <div className="flex gap-2">
              {FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === status
                      ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Task Table */}
          <div className="bg-[#151D2F]/80 backdrop-blur-md border border-white/5 rounded-b-2xl overflow-hidden shadow-xl mb-12">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/20 text-slate-400 text-sm border-b border-white/5">
                <tr>
                  {["Tên Task", "Annotator", "Trạng thái", "Deadline", ""].map(
                    (h, i) => (
                      <th
                        key={i}
                        className={`p-4 font-semibold tracking-wide uppercase text-[11px] ${i === 4 ? "text-right w-px" : ""}`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    let currentStatus = task.status;
                    if (
                      currentStatus === "Pending" ||
                      currentStatus === "Submitted"
                    ) {
                      currentStatus = "PendingReview";
                    }

                    const action =
                      ACTION_STYLES[currentStatus] ??
                      ACTION_STYLES.PendingReview;
                    const statusStyle =
                      STATUS_STYLES[currentStatus] ??
                      "bg-gray-500/20 text-gray-400 border border-gray-500/30";

                    let statusText = "Chưa rõ";
                    if (currentStatus === "PendingReview")
                      statusText = "Chờ duyệt";
                    if (currentStatus === "Approved") statusText = "Đã duyệt";
                    if (currentStatus === "InProgress")
                      statusText = "Đang làm lại";

                    const theTaskId = task.taskId || task.taskID;

                    const annotatorName = task.annotatorName || "Ẩn danh";
                    const initialLetter =
                      annotatorName !== "Ẩn danh"
                        ? annotatorName.charAt(0).toUpperCase()
                        : "A";

                    return (
                      <tr
                        key={theTaskId}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors animate-in fade-in duration-500 last:border-0"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3 font-bold text-white mb-1">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              {TYPE_ICONS.image}
                            </div>
                            {task.taskName ||
                              `Task ${theTaskId?.substring(0, 5)}`}
                          </div>
                          <p className="text-xs text-slate-400 ml-10 font-medium">
                            ID: {theTaskId?.substring(0, 8)}... • Vòng{" "}
                            <span className="text-white">
                              {task.currentRound || 0}
                            </span>
                          </p>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                            <div className="w-6 h-6 rounded-full bg-[#0f172a] border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                              {initialLetter}
                            </div>
                            {annotatorName}
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-block transition-colors duration-500 shadow-sm ${statusStyle}`}
                          >
                            {statusText}
                          </span>
                          {task.rejectCount > 0 && (
                            <p className="text-xs text-rose-400 mt-2 font-semibold flex items-center gap-1">
                              <MessageSquareWarning size={12} /> Đã từ chối{" "}
                              {task.rejectCount} lần
                            </p>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                            <Clock size={14} className="text-blue-400" />
                            {task.deadline
                              ? new Date(task.deadline).toLocaleDateString(
                                  "vi-VN",
                                )
                              : "N/A"}
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() =>
                              currentStatus === "PendingReview" &&
                              navigate(`/reviewer/workspace/${theTaskId}`)
                            }
                            disabled={currentStatus !== "PendingReview"}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${action.cls}`}
                          >
                            {action.label}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Filter size={40} className="mb-3 opacity-20" />
                        <p className="text-lg font-medium text-slate-400">
                          Trống rỗng!
                        </p>
                        <p className="text-sm mt-1">
                          Không tìm thấy task nào với bộ lọc "{filter}"
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerDashboard;
