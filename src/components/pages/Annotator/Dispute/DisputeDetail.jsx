import React, { useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ShieldCheck, History, FileText, AlertCircle } from 'lucide-react';

const HistoryItem = memo(({ item }) => (
  <div className="relative pl-8">
    <div className="absolute left-0 top-1 w-4 h-4 bg-[#1e293b] border-2 border-slate-700 rounded-full flex items-center justify-center z-10">
      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
    </div>
    <p className="text-xs text-slate-500 mb-1">{item.time}</p>
    <p className="text-sm font-bold text-slate-300 flex items-center gap-2">{item.action}</p>
  </div>
));

const DisputeDetail = () => {
  const navigate = useNavigate();

  const detail = useMemo(() => ({
    taskID: "TASK-102",
    taskName: "Phân loại thực thể trong văn bản y tế",
    annotatorReason: "Reviewer đánh sai nhãn 'Triệu chứng' ở dòng số 5...",
    adminFeedback: "Yêu cầu của bạn đã được tiếp nhận...",
    history: [
      { time: "2026-03-10 09:00", action: "Hệ thống tiếp nhận khiếu nại" },
      { time: "2026-03-08 14:30", action: "Bạn đã gửi khiếu nại" },
    ]
  }), []);

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
        <span>Quay lại</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">#{detail.taskID}</span>
              <span className="flex items-center gap-1.5 text-amber-500 text-sm font-bold">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Đang xử lý
              </span>
            </div>

            <h1 className="text-2xl font-black text-white mb-6 leading-tight">{detail.taskName}</h1>

            <div className="space-y-6">
              <div>
                <LabelHeader icon={<MessageSquare className="text-blue-500" size={16}/>} text="Nội dung khiếu nại" />
                <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 text-slate-300 text-sm leading-relaxed">
                  {detail.annotatorReason}
                </div>
              </div>

              <div>
                <LabelHeader icon={<ShieldCheck className="text-green-500" size={16}/>} text="Phản hồi từ Quản lý" />
                <div className="bg-green-500/5 p-5 rounded-2xl border border-green-500/10 text-green-200/80 italic text-sm">
                  {detail.adminFeedback || "Chưa có phản hồi mới."}
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <History size={18} className="text-slate-400" /> Lịch sử xử lý
            </h3>
            
            <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {detail.history.map((item, index) => (
                <HistoryItem key={index} item={item} />
              ))}
            </div>
          </div>
          
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3 italic">
            <AlertCircle size={20} className="text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-200/60 leading-snug">
              Phúc khảo thường mất 1-3 ngày làm việc. Kết quả sẽ cập nhật vào điểm tín nhiệm.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const LabelHeader = ({ icon, text }) => (
  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
    {icon} {text}
  </h3>
);

export default DisputeDetail;