import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, ArrowRight, ShieldAlert } from 'lucide-react';

const DisputeList = () => {
  const navigate = useNavigate();

  // DỮ LIỆU CỨNG (MOCK DATA) - Sau này gọi API sẽ thay thế mảng này
  const disputedTasks = [
    {
      taskID: "TASK-102",
      taskName: "Phân loại thực thể trong văn bản y tế",
      deadline: "2026-03-15",
      disputeReason: "Reviewer đánh sai nhãn 'Triệu chứng', tôi đã làm đúng theo hướng dẫn mục 2.1",
    },
    {
      taskID: "TASK-089",
      taskName: "Gán nhãn hành động trong Video thể thao",
      deadline: "2026-03-12",
      disputeReason: "Video bị giật lag ở giây thứ 15, không thể xác định hành động chính xác",
    }
  ];

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      
      {/* HEADER TRANG */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight text-white uppercase">
            <ShieldAlert className="text-amber-500" size={36} />
            Khiếu Nại Của Tôi
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium italic">
            Theo dõi tiến độ giải quyết các yêu cầu phúc khảo của bạn.
          </p>
        </div>
        
        {/* Badge tổng số lượng đang chờ */}
        <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl hidden md:block">
          <span className="text-amber-500 font-bold text-sm">
            {disputedTasks.length} Đang chờ xử lý
          </span>
        </div>
      </div>

      {/* DANH SÁCH TASK KHIẾU NẠI */}
      {disputedTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {disputedTasks.map((task) => (
            <div 
              key={task.taskID} 
              className="group bg-[#1e293b] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-amber-500/40 transition-all duration-300 shadow-xl"
            >
              {/* Cột thông tin trái */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-900 text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-500/20 uppercase tracking-widest">
                    #{task.taskID}
                  </span>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors uppercase">
                    {task.taskName}
                  </h3>
                </div>
                
                {/* Nội dung khiếu nại ngắn gọn */}
                <div className="bg-[#0f172a]/50 p-3 rounded-xl border border-slate-800/50">
                  <p className="text-sm text-slate-400 flex items-start gap-2">
                    <MessageSquare size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <span className="italic">"{task.disputeReason}"</span>
                  </p>
                </div>

                {/* Thông tin phụ: Deadline & Status */}
                <div className="flex items-center gap-5 text-xs text-slate-500 font-medium pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>Hạn chót: {task.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-500/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-bold">Trạng thái: Đang xem xét</span>
                  </div>
                </div>
              </div>

              {/* Cột nút bấm bên phải */}
              <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/50">
                <button 
                  onClick={() => navigate(`/annotator/disputes/${task.taskID}`)}
                  className="flex-1 md:flex-none bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 group/btn active:scale-95"
                >
                  Xem chi tiết 
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* GIAO DIỆN KHI KHÔNG CÓ KHIẾU NẠI */
        <div className="bg-[#1e293b] border border-dashed border-slate-700 rounded-[2rem] p-20 text-center mt-10">
          <div className="bg-slate-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-600 shadow-inner">
            <MessageSquare size={40} />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Mọi thứ đều ổn!</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm leading-relaxed">
            Bạn hiện không có khiếu nại nào đang chờ xử lý. Chúc bạn làm việc hiệu quả!
          </p>
        </div>
      )}
    </div>
  );
};

export default DisputeList;