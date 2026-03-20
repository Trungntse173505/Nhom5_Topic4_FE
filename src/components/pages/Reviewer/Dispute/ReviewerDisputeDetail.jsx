import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, ShieldCheck, History, FileText, AlertCircle } from 'lucide-react';
import { useReviewerDisputes } from '../../../../hooks/Reviewer/useReviewerDisputes';

const ReviewerDisputeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { disputes, isLoading } = useReviewerDisputes();

  const detail = useMemo(() => {
    return disputes.find(d => d.disputeID === id);
  }, [disputes, id]);

  if (isLoading) return <div className="p-8 text-white">Đang tải chi tiết...</div>;
  if (!detail) return <div className="p-8 text-white">Không tìm thấy khiếu nại này.</div>;

  const isPending = detail.status?.toLowerCase() === 'pending';

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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
                Task #{detail.taskID?.substring(0, 8)}
              </span>
              <span className={`flex items-center gap-1.5 text-sm font-bold ${isPending ? 'text-amber-500' : 'text-green-500'}`}>
                <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                {isPending ? 'Đang chờ Manager phán quyết' : `Đã chốt kết quả: ${detail.status}`}
              </span>
            </div>

            <h1 className="text-2xl font-black text-white mb-6">{detail.taskName}</h1>

            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={16} className="text-rose-500" /> Lý do Annotator khiếu nại
              </h3>
              <div className="bg-rose-500/5 p-5 rounded-2xl border border-rose-500/10 leading-relaxed text-rose-200/90">
                {detail.reason}
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-slate-800">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={16} className={isPending ? 'text-slate-400' : 'text-green-500'} /> 
                Phản hồi từ Quản lý
              </h3>
              <div className={`p-5 rounded-2xl border text-sm leading-relaxed ${
                isPending 
                  ? 'bg-slate-800/50 border-slate-700 text-slate-400 italic' 
                  : 'bg-green-500/5 border-green-500/10 text-green-200/90'
              }`}>
                {detail.managerComment || (isPending ? "Đang trong quá trình rà soát..." : "Không có ghi chú thêm.")}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <History size={18} className="text-slate-400" /> Tiến trình xử lý
            </h3>
            
            <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-4 h-4 bg-[#1e293b] border-2 border-slate-700 rounded-full flex items-center justify-center z-10">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                </div>
                <p className="text-xs text-slate-500 mb-1">{new Date(detail.createdAt).toLocaleDateString('vi-VN')}</p>
                <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <FileText size={14}/> Annotator gửi khiếu nại
                </p>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-4 h-4 bg-[#1e293b] border-2 border-slate-700 rounded-full flex items-center justify-center z-10">
                  <div className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                </div>
                <p className="text-xs text-slate-500 mb-1">{detail.resolvedAt ? new Date(detail.resolvedAt).toLocaleDateString('vi-VN') : 'Hiện tại'}</p>
                <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <ShieldCheck size={14}/> {isPending ? 'Manager đang xem xét' : `Đã đóng (${detail.status})`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
             <div className="flex gap-3">
                <AlertCircle size={20} className="text-slate-400 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Đây là thông tin được hệ thống gửi tự động để bạn nắm bắt tình hình các task mình đã đánh giá. Quyết định của Manager là quyết định cuối cùng.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerDisputeDetail;