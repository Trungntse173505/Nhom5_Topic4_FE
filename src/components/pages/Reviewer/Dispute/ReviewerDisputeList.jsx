import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useReviewerDisputes } from '../../../../hooks/Reviewer/useReviewerDisputes'; 
import { CardSpotlight } from '../../../common/card-spotlight';

const DisputeItem = React.memo(({ task, navigate }) => {
  return (
    <CardSpotlight
      className="group bg-[#1e293b] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-600 transition-all duration-300 shadow-xl"
    >
      <div className="flex-1 space-y-3 relative z-10 w-full">
        <div className="flex items-center gap-3">
          <span className="bg-slate-900 text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-500/20 uppercase tracking-widest">
            #{task.taskID?.substring(0, 8)}
          </span>
          <h3 className="text-xl font-bold text-white transition-colors uppercase">
            {task.taskName}
          </h3>
        </div>
        
        <div className="bg-[#0f172a]/50 p-3 rounded-xl border border-slate-800/50">
          <p className="text-sm text-slate-400 flex items-start gap-2">
            <MessageSquare size={16} className="text-rose-500 mt-0.5 shrink-0" />
            <span className="italic">"{task.reason}"</span>
          </p>
        </div>

        <div className="flex items-center gap-5 text-xs font-medium pt-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock size={14} />
            <span>Ngày tạo: {new Date(task.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
          {task.status?.toLowerCase() === 'pending' ? (
            <div className="flex items-center gap-1.5 text-amber-500/80">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-bold">Đang chờ Manager xử lý</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-green-500/80">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="font-bold">Đã có kết quả ({task.status})</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/50 relative z-10">
        <button 
          onClick={() => navigate(`/reviewer/disputes/${task.disputeID}`)}
          className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn active:scale-95"
        >
          Xem chi tiết
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </CardSpotlight>
  );
});

const ReviewerDisputeList = () => {
  const navigate = useNavigate();
  const { disputes, isLoading } = useReviewerDisputes();

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight text-white uppercase">
            <AlertTriangle className="text-rose-500" size={36} />
            Task Bị Khiếu Nại
          </h1>
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-400">Đang tải dữ liệu...</p>
      ) : disputes.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {disputes.map((task) => (
            <DisputeItem key={task.disputeID} task={task} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-dashed border-slate-700 rounded-[2rem] p-20 text-center mt-10">
          <h3 className="text-2xl font-bold text-white tracking-tight">Tuyệt vời!</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm leading-relaxed">
            Không có task nào bạn review bị khiếu nại.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewerDisputeList;