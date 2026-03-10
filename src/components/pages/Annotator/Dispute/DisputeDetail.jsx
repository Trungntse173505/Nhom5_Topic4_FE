import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ShieldCheck, History, FileText, AlertCircle } from 'lucide-react';

const DisputeDetail = () => {
  const navigate = useNavigate();

  // Giả lập dữ liệu chi tiết của 1 Task khiếu nại
  const detail = {
    taskID: "TASK-102",
    taskName: "Phân loại thực thể trong văn bản y tế",
    status: "Pending", // Pending, Resolved, Rejected
    createdAt: "2026-03-08 14:30",
    annotatorReason: "Reviewer đánh sai nhãn 'Triệu chứng' ở dòng số 5. Theo tài liệu hướng dẫn mục 2.1, các từ chỉ cảm giác của bệnh nhân đều phải dán nhãn này. Mong xem xét lại.",
    adminFeedback: "Yêu cầu của bạn đã được tiếp nhận. Quản lý kỹ thuật đang kiểm tra lại quy trình chấm điểm của Reviewer liên quan.",
    history: [
      { time: "2026-03-10 09:00", action: "Hệ thống tiếp nhận khiếu nại", icon: <ShieldCheck size={14}/> },
      { time: "2026-03-08 14:30", action: "Bạn đã gửi khiếu nại", icon: <FileText size={14}/> },
    ]
  };

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      {/* Nút quay lại */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
        <span>Quay lại danh sách</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
                #{detail.taskID}
              </span>
              <span className="flex items-center gap-1.5 text-amber-500 text-sm font-bold">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Đang xử lý
              </span>
            </div>

            <h1 className="text-2xl font-black text-white mb-6">{detail.taskName}</h1>

            {/* Nội dung khiếu nại của Annotator */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-500" /> Nội dung khiếu nại
              </h3>
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 leading-relaxed text-slate-300">
                {detail.annotatorReason}
              </div>
            </div>

            {/* Phản hồi từ Admin (Nếu có) */}
            <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-500" /> Phản hồi từ Quản lý
              </h3>
              <div className="bg-green-500/5 p-5 rounded-2xl border border-green-500/10 text-green-200/80 italic text-sm">
                {detail.adminFeedback || "Chưa có phản hồi mới."}
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TRẠNG THÁI & LỊCH SỬ */}
        <div className="space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <History size={18} className="text-slate-400" /> Lịch sử xử lý
            </h3>
            
            <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {detail.history.map((item, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-0 top-1 w-4 h-4 bg-[#1e293b] border-2 border-slate-700 rounded-full flex items-center justify-center z-10">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{item.time}</p>
                  <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
                     {item.action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Thẻ lưu ý */}
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
             <div className="flex gap-3">
                <AlertCircle size={20} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-200/60 leading-relaxed">
                  Quá trình phúc khảo thường mất từ 1-3 ngày làm việc. Kết quả sẽ được cập nhật trực tiếp vào điểm tín nhiệm của bạn.
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DisputeDetail;