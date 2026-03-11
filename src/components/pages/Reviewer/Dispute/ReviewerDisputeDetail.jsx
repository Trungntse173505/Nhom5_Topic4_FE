import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, ShieldCheck, History, FileText, AlertCircle } from 'lucide-react';

const ReviewerDisputeDetail = () => {
  const navigate = useNavigate();

  // Giả lập dữ liệu chi tiết
  const detail = {
    taskID: "TASK-102",
    taskName: "Phân loại thực thể trong văn bản y tế",
    annotatorID: "ANN-8821",
    status: "Pending", // Pending, Resolved
    createdAt: "2026-03-08 14:30",
    annotatorReason: "Reviewer đánh sai nhãn 'Triệu chứng' ở dòng số 5. Theo tài liệu hướng dẫn mục 2.1, các từ chỉ cảm giác của bệnh nhân đều phải dán nhãn này. Mong xem xét lại.",
    adminFeedback: "Quản lý kỹ thuật đang trong quá trình rà soát lại kết quả của Task này. Vui lòng chờ kết quả.", // Sẽ là quyết định cuối cùng nếu status = Resolved
    history: [
      { time: "2026-03-09 10:00", action: "Manager đang tiến hành rà soát lại kết quả", icon: <ShieldCheck size={14}/> },
      { time: "2026-03-08 14:30", action: `Annotator ANN-8821 đã gửi khiếu nại`, icon: <FileText size={14}/> },
    ]
  };

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
        <span>Quay lại danh sách</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
                #{detail.taskID}
              </span>
              <span className={`flex items-center gap-1.5 text-sm font-bold ${detail.status === 'Pending' ? 'text-amber-500' : 'text-green-500'}`}>
                <div className={`w-2 h-2 rounded-full ${detail.status === 'Pending' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                {detail.status === 'Pending' ? 'Đang chờ Manager phán quyết' : 'Đã có kết quả'}
              </span>
            </div>

            <h1 className="text-2xl font-black text-white mb-6">{detail.taskName}</h1>

            {/* Nội dung khiếu nại của Annotator */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={16} className="text-rose-500" /> Lý do Annotator khiếu nại
              </h3>
              <div className="bg-rose-500/5 p-5 rounded-2xl border border-rose-500/10 leading-relaxed text-rose-200/90">
                {detail.annotatorReason}
              </div>
            </div>

            {/* Phản hồi/Quyết định từ Manager */}
            <div className="space-y-4 pt-8 border-t border-slate-800">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={16} className={detail.status === 'Pending' ? 'text-slate-400' : 'text-green-500'} /> 
                Quyết định từ Quản lý (Manager)
              </h3>
              <div className={`p-5 rounded-2xl border text-sm leading-relaxed ${
                detail.status === 'Pending' 
                  ? 'bg-slate-800/50 border-slate-700 text-slate-400 italic' 
                  : 'bg-green-500/5 border-green-500/10 text-green-200/90'
              }`}>
                {detail.adminFeedback}
              </div>
            </div>

          </div>
        </div>

        {/* CỘT PHẢI: TRẠNG THÁI & LỊCH SỬ */}
        <div className="space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <History size={18} className="text-slate-400" /> Tiến trình xử lý
            </h3>
            
            <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {detail.history.map((item, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-0 top-1 w-4 h-4 bg-[#1e293b] border-2 border-slate-700 rounded-full flex items-center justify-center z-10">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{item.time}</p>
                  <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                     {item.action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
             <div className="flex gap-3">
                <AlertCircle size={20} className="text-slate-400 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Đây là thông vị được hệ thống gửi tự động để bạn nắm bắt tình hình các task mình đã đánh giá. Quyết định của Manager là quyết định cuối cùng.
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReviewerDisputeDetail;