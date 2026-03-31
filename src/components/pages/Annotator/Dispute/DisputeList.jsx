import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Clock,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useAnnotatorDisputes } from "../../../../hooks/Annotator/useAnnotatorDisputes";

const STATUS_MAP = {
  Pending: {
    text: "Đang xem xét",
    color: "text-amber-500",
    bg: "bg-amber-500",
    pulse: true,
  },
  Accepted: {
    text: "Chấp nhận",
    color: "text-emerald-500",
    bg: "bg-emerald-500",
    pulse: false,
  },
  Rejected: {
    text: "Từ chối",
    color: "text-rose-500",
    bg: "bg-rose-500",
    pulse: false,
  },
};

const DisputeItem = memo(({ task, onDetail }) => {
  // 👉 FIX LỖI: Quét mọi trường hợp đặt tên ID của Backend
  const id =
    task.disputeId || task.disputeID || task.id || task.taskId || task.taskID;
  const statusInfo = STATUS_MAP[task.status] || STATUS_MAP["Pending"];

  return (
    <div className="group bg-[#1e293b] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-amber-500/40 transition-all duration-300 shadow-xl">
      <div className="flex-1 space-y-3 w-full">
        <div className="flex items-center gap-3">
          <span className="bg-slate-900 text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-500/20 uppercase tracking-widest shrink-0">
            {/* Cắt 8 ký tự đầu của ID cho đẹp */}#
            {(task.taskId || task.taskID || id || "TASK")
              ?.toString()
              .substring(0, 8)}
          </span>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors uppercase truncate max-w-md">
            {task.taskName || "Nhiệm vụ không tên"}
          </h3>
        </div>
      </div>

      <button
        onClick={() => {
          // 👉 TRẠM KIỂM SOÁT LỖI
          console.log("👉 Dữ liệu Task nhận được từ API:", task);
          console.log("👉 ID lọc được chuẩn bị gửi đi:", id);

          if (!id) {
            alert(
              "Lỗi: Dữ liệu Backend trả về bị thiếu ID khiếu nại! Sếp mở F12 tab Console để xem log nhé.",
            );
            return; // Chặn không cho navigate nếu mất ID
          }
          onDetail(id);
        }}
        className="w-full md:w-auto bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 group/btn active:scale-95 shrink-0"
      >
        Xem chi tiết
        <ArrowRight
          size={16}
          className="group-hover/btn:translate-x-1 transition-transform"
        />
      </button>
    </div>
  );
});

const DisputeList = () => {
  const navigate = useNavigate();
  const { disputes, isLoading } = useAnnotatorDisputes();

  const handleNavigate = React.useCallback(
    (id) => {
      if (id) navigate(`/annotator/disputes/${id}`);
    },
    [navigate],
  );

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight uppercase">
            <ShieldAlert className="text-amber-500" size={36} />
            Khiếu Nại Của Tôi
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium italic">
            Theo dõi tiến độ phúc khảo.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-amber-500/50" />
            <p>Đang tải dữ liệu khiếu nại...</p>
          </div>
        ) : disputes.length > 0 ? (
          disputes.map((task, idx) => (
            <DisputeItem
              key={task.disputeId || task.id || task.taskId || idx}
              task={task}
              onDetail={handleNavigate}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

const EmptyState = memo(() => (
  <div className="bg-[#1e293b] border border-dashed border-slate-700 rounded-[2rem] p-20 text-center mt-10">
    <div className="bg-slate-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-600 shadow-inner">
      <MessageSquare size={40} />
    </div>
    <h3 className="text-2xl font-bold text-white tracking-tight">
      Mọi thứ đều ổn!
    </h3>
    <p className="text-slate-500 mt-2">
      Bạn chưa có đơn khiếu nại nào trong hệ thống.
    </p>
  </div>
));

export default DisputeList;
