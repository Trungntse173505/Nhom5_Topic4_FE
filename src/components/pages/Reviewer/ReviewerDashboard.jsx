import React, { useState, useEffect, useMemo } from "react";
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
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { useTasks } from "../../../hooks/Reviewer/useTasks";
import { useScore } from "../../../hooks/Reviewer/useScore";
import { AuroraBackground } from "../../common/aurora-background";
import { CardSpotlight } from "../../common/card-spotlight";

const TYPE_ICONS = {
  text: <FileText size={16} className="text-blue-400" />,
  audio: <Headphones size={16} className="text-amber-400" />,
  image: <ImageIcon size={16} className="text-green-400" />,
};

// ĐỊNH DẠNG MÀU SẮC TRẠNG THÁI (TIẾNG VIỆT)
const STATUS_STYLES = {
  New: "bg-sky-500/20 text-sky-400 border border-sky-500/30",           // Trạng thái Mới
  PendingReview: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Approved: "bg-green-500/20 text-green-400 border border-green-500/30",
  Rejected: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  InProgress: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  Fail: "bg-red-500/20 text-red-400 border border-red-500/30",
};

// ĐỊNH DẠNG NÚT BẤM HÀNH ĐỘNG
const ACTION_STYLES = {
  New: {
    label: "Chưa nộp",
    cls: "bg-slate-700/50 border border-slate-600 cursor-not-allowed opacity-50 text-slate-300",
  },
  PendingReview: {
    label: "Kiểm duyệt",
    cls: "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 text-white",
  },
  Approved: {
    label: "Đã xong",
    cls: "bg-slate-700/50 border border-slate-600 cursor-not-allowed opacity-50 text-slate-300",
  },
  Rejected: {
    label: "Chờ sửa",
    cls: "bg-slate-700/50 border border-slate-600 cursor-not-allowed opacity-50 text-slate-300",
  },
  InProgress: {
    label: "Đang sửa",
    cls: "bg-slate-700/50 border border-slate-600 cursor-not-allowed opacity-50 text-slate-300",
  },
  Fail: {
    label: "Đã đóng",
    cls: "bg-slate-700/50 border border-slate-600 cursor-not-allowed opacity-50 text-slate-300",
  },
};

// ĐÃ FIX: Viết tường minh class để không bị lỗi Tailwind
const STAT_CARDS = [
  { icon: FolderOpen, colorClass: "bg-blue-500/20 text-blue-400", label: "Tổng Task", key: "totalTasks" },
  { icon: CheckCircle2, colorClass: "bg-green-500/20 text-green-400", label: "Đã Duyệt", key: "doneTasks" },
  { icon: AlertCircle, colorClass: "bg-yellow-500/20 text-yellow-400", label: "Chờ Duyệt", key: "pendingTasks" },
];

const FILTERS = [
  { id: "All", label: "Tất cả" },
  { id: "New", label: "Mới" },
  { id: "Pending", label: "Chờ duyệt" },
  { id: "Rejected", label: "Đã trả về" },
  { id: "Done", label: "Hoàn thành" },
];

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

  const stats = useMemo(() => ({
    totalTasks: tasks?.length || 0,
    pendingTasks: tasks?.filter((t) => t.status === "PendingReview" || t.status === "Pending").length || 0,
    doneTasks: tasks?.filter((t) => t.status === "Approved").length || 0,
  }), [tasks]);

  const filteredTasks = useMemo(() => tasks?.filter((task) => {
    if (filter === "All") return true;
    if (filter === "New") return task.status === "New";
    if (filter === "Pending") return task.status === "PendingReview" || task.status === "Pending";
    if (filter === "Rejected") return task.status === "Rejected";
    if (filter === "Done") return task.status === "Approved";
    return true;
  }) || [], [tasks, filter]);

  if (isLoading && (!tasks || tasks.length === 0))
    return (
      <div className="relative w-full h-full flex flex-col flex-1 overflow-hidden bg-[#0B1120]">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AuroraBackground />
        </div>
        <div className="z-10 flex-1 flex items-center justify-center text-white">
          <Loader2 className="animate-spin w-8 h-8 mr-3 text-blue-400" /> Đang tải dữ liệu...
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

  return (
    <div className="relative w-full h-full flex flex-col flex-1 overflow-hidden bg-[#0B1120]">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AuroraBackground />
        <div className="absolute inset-0 bg-[#0B1120]/60"></div>
      </div>

      <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
        <div className="text-slate-200 p-8 max-w-7xl mx-auto flex flex-col min-h-full text-left">
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
                  {isLoadingScore ? <Loader2 className="animate-spin inline-block w-5 h-5 mr-1" /> : myScore} 
                  <span className="text-sm font-medium text-slate-500 ml-1">pts</span>
                </p>
              </div>
            </button>
          </div>

          {/* Stat Cards - ĐÃ FIX LỖI GIAO DIỆN BỊ KÉO GIÃN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
            {STAT_CARDS.map(({ icon: Icon, colorClass, label, key }) => (
              <CardSpotlight
                key={key}
                className="bg-[#151D2F]/80 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-all shadow-xl"
              >
                {/* Dùng flex-row ép nằm ngang, và set cứng w-14 h-14 để vuông vức */}
                <div className="flex flex-row items-center gap-5 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon size={28} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-slate-400 font-medium mb-1">{label}</p>
                    <p className="text-3xl font-bold text-white drop-shadow-md">{stats[key]}</p>
                  </div>
                </div>
              </CardSpotlight>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="bg-[#151D2F]/80 backdrop-blur-md border border-white/5 rounded-t-2xl p-4 flex items-center justify-between border-b-0 shadow-lg shrink-0">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Filter size={20} className="text-blue-400" /> Danh Sách Task
            </h2>
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === f.id
                      ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Task Table */}
          <div className="bg-[#151D2F]/80 backdrop-blur-md border border-white/5 rounded-b-2xl overflow-hidden shadow-xl mb-12">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/20 text-slate-400 text-sm border-b border-white/5">
                <tr>
                  {["Tên Task", "Người làm", "Trạng thái", "Hạn chót", ""].map((h, i) => (
                    <th key={i} className={`p-4 font-semibold tracking-wide uppercase text-[11px] ${i === 4 ? "text-right w-px" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    let currentStatus = task.status;
                    if (currentStatus === "Pending" || currentStatus === "Submitted") currentStatus = "PendingReview";

                    const action = ACTION_STYLES[currentStatus] || ACTION_STYLES.New;
                    const statusStyle = STATUS_STYLES[currentStatus] || "bg-gray-500/20 text-gray-400 border border-gray-500/30";

                    let statusText = "Chưa rõ";
                    if (currentStatus === "New") statusText = "Mới";
                    if (currentStatus === "PendingReview") statusText = "Chờ duyệt";
                    if (currentStatus === "Approved") statusText = "Đã duyệt";
                    if (currentStatus === "Rejected") statusText = "Đã trả về";
                    if (currentStatus === "InProgress") statusText = "Đang sửa";
                    if (currentStatus === "Fail") statusText = "Thất bại";

                    const theTaskId = task.taskId || task.taskID;
                    const annotatorName = task.annotatorName || "Chưa gán";

                    return (
                      <tr key={theTaskId} className="border-b border-white/5 hover:bg-white/5 transition-colors last:border-0">
                        <td className="p-4">
                          <div className="flex items-center gap-3 font-bold text-white mb-1">
                            <div className="p-2 bg-blue-500/10 rounded-lg">{TYPE_ICONS.image}</div>
                            {task.taskName || `Task ${theTaskId?.substring(0, 5)}`}
                          </div>
                          <p className="text-xs text-slate-400 ml-10">ID: {theTaskId?.substring(0, 8)}... • Vòng: {task.currentRound || 0}</p>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                              {annotatorName.charAt(0).toUpperCase()}
                            </div>
                            {annotatorName}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-block shadow-sm ${statusStyle}`}>
                            {statusText}
                          </span>
                        </td>

                        <td className="p-4 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-blue-400" />
                            {task.deadline ? new Date(task.deadline).toLocaleDateString("vi-VN") : "N/A"}
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => currentStatus === "PendingReview" && navigate(`/reviewer/workspace/${theTaskId}`)}
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
                    <td colSpan="5" className="p-12 text-center text-slate-500 italic">
                      Không tìm thấy task nào phù hợp.
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