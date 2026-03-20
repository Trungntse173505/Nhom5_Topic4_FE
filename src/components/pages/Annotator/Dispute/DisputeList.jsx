import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, ArrowRight, ShieldAlert } from 'lucide-react';

const DisputeItem = memo(({ task, onDetail }) => (
  <div className="group bg-[#1e293b] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-amber-500/40 transition-all duration-300 shadow-xl">
    <div className="flex-1 space-y-3">
      <div className="flex items-center gap-3">
        <span className="bg-slate-900 text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-500/20 uppercase tracking-widest">
          #{task.taskID}
        </span>
        <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors uppercase truncate max-w-md">
          {task.taskName}
        </h3>
      </div>
      
      <div className="bg-[#0f172a]/50 p-3 rounded-xl border border-slate-800/50">
        <p className="text-sm text-slate-400 flex items-start gap-2 line-clamp-2">
          <MessageSquare size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <span className="italic">"{task.disputeReason}"</span>
        </p>
      </div>

      <div className="flex items-center gap-5 text-xs text-slate-500 font-medium pt-1">
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>Hạn chót: {task.deadline}</span>
        </div>
      </div>
    </div>

    <button 
      onClick={() => onDetail(task.taskID)}
      className="w-full md:w-auto bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 group/btn active:scale-95"
    >
      Xem chi tiết 
      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
    </button>
  </div>
));

const DisputeList = () => {
  const navigate = useNavigate();

  const disputedTasks = [
    { taskID: "TASK-102", taskName: "Phân loại thực thể trong văn bản y tế", deadline: "2026-03-15", disputeReason: "Reviewer đánh sai nhãn 'Triệu chứng'..." },
    { taskID: "TASK-089", taskName: "Gán nhãn hành động trong Video thể thao", deadline: "2026-03-12", disputeReason: "Video bị giật lag..." }
  ];

  const handleNavigate = React.useCallback((id) => {
    navigate(`/annotator/disputes/${id}`);
  }, [navigate]);

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight uppercase">
            <ShieldAlert className="text-amber-500" size={36} />
            Khiếu Nại Của Tôi
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium italic italic">Theo dõi tiến độ phúc khảo.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5">
        {disputedTasks.length > 0 ? (
          disputedTasks.map((task) => (
            <DisputeItem key={task.taskID} task={task} onDetail={handleNavigate} />
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
    <h3 className="text-2xl font-bold text-white tracking-tight">Mọi thứ đều ổn!</h3>
  </div>
));

export default DisputeList;