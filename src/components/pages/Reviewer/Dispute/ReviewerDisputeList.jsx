import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useReviewerDisputes } from '../../../../hooks/Reviewer/useReviewerDisputes'; 

const ReviewerDisputeList = () => {
  const navigate = useNavigate();
  const { disputes, isLoading } = useReviewerDisputes();

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      <div className="mb-10">
        <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight text-white uppercase">
          <AlertTriangle className="text-rose-500" size={36} />
          Lịch Sử Khiếu Nại
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Danh sách các task do bạn duyệt bị Annotator khiếu nại lên Manager.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        </div>
      ) : disputes.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {disputes.map((task) => {
            const isPending = task.status?.toLowerCase() === 'pending';
            
            return (
              <div 
                key={task.disputeID} 
                className="group bg-[#1e293b] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-600 transition-all shadow-xl"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-900 text-blue-400 text-xs font-black px-3 py-1.5 rounded-lg border border-blue-500/20 uppercase tracking-widest">
                      #{task.taskID?.substring(0, 8) || "TASK"}
                    </span>
                    <h3 className="text-xl font-bold text-white uppercase">
                      {task.taskName}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-5 text-sm font-medium pt-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={16} />
                      <span>{task.createdAt ? new Date(task.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}</span>
                    </div>
                    {isPending ? (
                      <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-md">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="font-bold">Đang chờ phán quyết</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-md">
                        <ShieldCheck size={16} />
                        <span className="font-bold">Đã chốt ({task.status})</span>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/reviewer/disputes/${task.disputeID}`)}
                  className="w-full md:w-auto bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn active:scale-95"
                >
                  Xem chi tiết
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-dashed border-slate-700 rounded-[2rem] p-20 text-center mt-10">
          <h3 className="text-2xl font-bold text-white">Tuyệt vời!</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm">Không có task nào bị khiếu nại.</p>
        </div>
      )}
    </div>
  );
};

export default ReviewerDisputeList;