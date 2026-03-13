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
} from "lucide-react";
import { useTasks } from "../../../hooks/Reviewer/useTasks";
import { useScore } from "../../../hooks/useScore";

const TYPE_ICONS = {
  text: <FileText size={16} className="text-blue-400" />,
  audio: <Headphones size={16} className="text-amber-400" />,
  image: <ImageIcon size={16} className="text-green-400" />,
};

const STATUS_STYLES = {
  PendingReview: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Approved: "bg-green-500/20 text-green-400 border-green-500/30",
  InProgress: "bg-red-500/20 text-red-400 border-red-500/30",
};

const ACTION_STYLES = {
  PendingReview: {
    label: "Kiểm duyệt",
    cls: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20",
  },
  Approved: {
    label: "Xem lại",
    cls: "bg-slate-700 hover:bg-slate-600 border border-slate-600 cursor-not-allowed opacity-50",
  },
  InProgress: {
    label: "Đang làm lại",
    cls: "bg-slate-700 hover:bg-slate-600 border border-slate-600 cursor-not-allowed opacity-50",
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

  // ĐÃ THÊM: LOGIC TỰ ĐỘNG CẬP NHẬT REAL-TIME NGẦM (POLLING MỖI 5 GIÂY)
  useEffect(() => {
    // Cài đặt đồng hồ: Cứ 5000ms (5 giây) là tự gọi refetch kéo data mới
    const intervalId = setInterval(() => {
      if (refetch) refetch();
    }, 5000);

    // Dọn dẹp đồng hồ khi sếp rời khỏi trang Dashboard để tránh tốn RAM
    return () => clearInterval(intervalId);
  }, [refetch]);

  // ĐÃ FIX: Chỉ hiện Loader full màn hình khi VÀO LẦN ĐẦU (tasks chưa có data).
  // Chứ không cứ 5s update ngầm nó lại giật giật nháy màn hình 1 lần thì tiền đình mất.
  if (isLoading && (!tasks || tasks.length === 0))
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        <Loader2 className="animate-spin w-8 h-8 mr-3" /> Đang tải dữ liệu...
      </div>
    );

  if (error && (!tasks || tasks.length === 0))
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
        <XCircle className="text-red-500 w-12 h-12 mb-4" />
        <p>Lỗi tải dữ liệu: {error}</p>
        <button
          onClick={refetch}
          className="mt-4 bg-blue-600 px-4 py-2 rounded"
        >
          Thử lại
        </button>
      </div>
    );

  // Bọc lót các trạng thái API có thể trả về khác nhau
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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Dashboard Kiểm Duyệt</h1>
        <button
          onClick={() => navigate("/reviewer/score")}
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
              {isLoadingScore ? (
                <Loader2 className="animate-spin inline-block w-5 h-5 mr-1" />
              ) : (
                myScore
              )}{" "}
              <span className="text-sm font-medium text-slate-500">pts</span>
            </p>
          </div>
        </button>
      </div>

      {/* Stat Cards */}
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
              <p className="text-3xl font-bold text-white transition-all duration-300">
                {stats[key]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-t-2xl p-4 flex items-center justify-between border-b-0">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Filter size={20} className="text-blue-400" /> Danh Sách Task
          {/* Nháy đèn nhỏ biểu thị đang update realtime */}
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-[#0f172a] text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-b-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0f172a]/50 text-slate-400 text-sm">
            <tr>
              {["Tên Task", "Annotator", "Trạng thái", "Deadline", ""].map(
                (h, i) => (
                  <th
                    key={i}
                    className={`p-4 font-medium ${i === 4 ? "text-right w-px" : ""}`}
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
                  ACTION_STYLES[currentStatus] ?? ACTION_STYLES.PendingReview;
                const statusStyle =
                  STATUS_STYLES[currentStatus] ??
                  "bg-gray-500/20 text-gray-400";

                let statusText = "Chưa rõ";
                if (currentStatus === "PendingReview") statusText = "Chờ duyệt";
                if (currentStatus === "Approved") statusText = "Đã duyệt";
                if (currentStatus === "InProgress") statusText = "Đang làm lại";

                const theTaskId = task.taskId || task.taskID;

                return (
                  <tr
                    key={theTaskId}
                    className="border-t border-slate-700 hover:bg-slate-800/50 transition-colors animate-in fade-in duration-500"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-bold text-white mb-1">
                        {TYPE_ICONS.image}
                        {task.taskName || `Task ${theTaskId?.substring(0, 5)}`}
                      </div>
                      <p className="text-xs text-slate-400 ml-6">
                        {theTaskId?.substring(0, 8)}... • Vòng{" "}
                        {task.currentRound || 0}
                      </p>
                    </td>

                    <td className="p-4">
                      <p className="text-sm text-slate-300 font-medium">
                        Ẩn danh
                      </p>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block border transition-colors duration-500 ${statusStyle}`}
                      >
                        {statusText}
                      </span>
                      {task.rejectCount > 0 && (
                        <p className="text-xs text-red-400 mt-2 font-medium">
                          ⚠️ Đã từ chối {task.rejectCount} lần
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-300">
                        <Clock size={14} className="text-slate-500" />
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString("vi-VN")
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
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-lg ${action.cls}`}
                      >
                        {action.label}
                      </button>
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
      </div>
    </div>
  );
};

export default ReviewerDashboard;
