import React, { useState } from 'react';
import { MessageSquare, Clock, AlertTriangle, ShieldCheck, Image as ImageIcon, X } from 'lucide-react';
import { useReviewerDisputes } from '../../../../hooks/Reviewer/useReviewerDisputes'; 

const ReviewerDisputeList = () => {
  const { disputes, isLoading } = useReviewerDisputes();
  const [selectedImage, setSelectedImage] = useState(null);

  const parseImages = (evidenceImages) => {
    if (!evidenceImages || evidenceImages.length === 0) return [];
    try {
      return JSON.parse(evidenceImages[0]);
    } catch (error) {
      console.error("Lỗi parse ảnh:", error);
      return [evidenceImages[0].replace(/[[\]"]/g, '')]; 
    }
  };

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight text-white uppercase">
            <AlertTriangle className="text-rose-500" size={36} />
            Lịch Sử Khiếu Nại
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Danh sách các task do bạn duyệt bị Annotator khiếu nại lên Manager.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        </div>
      ) : disputes.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {disputes.map((task) => {
            const images = parseImages(task.evidenceImages);
            const isPending = task.status?.toLowerCase() === 'pending' || task.status === 0;

            return (
              <div 
                key={task.disputeID} 
                className="group bg-[#1e293b] border border-slate-800/80 hover:border-slate-600 rounded-[2rem] p-7 transition-all duration-300 shadow-xl relative overflow-hidden flex flex-col h-full"
              >
                {/* Status Badge */}
                <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-xs font-black uppercase tracking-wider ${
                  isPending ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                }`}>
                  {isPending ? 'Đang chờ phán quyết' : `Đã chốt: ${task.status}`}
                </div>

                {/* Header info */}
                <div className="flex items-start gap-4 mb-6 pr-32">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <ShieldCheck size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white transition-colors uppercase leading-tight mb-1">
                      {task.taskName}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                      <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                        {task.projectName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {task.createdAt ? new Date(task.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lý do khiếu nại */}
                <div className="bg-[#0f172a]/80 p-5 rounded-2xl border border-rose-500/10 mb-5 flex-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-rose-500" /> Lý do từ Annotator
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "{task.reason || 'Không có ghi chú cụ thể.'}"
                  </p>
                </div>

                {/* Bằng chứng ảnh */}
                {images.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                      <ImageIcon size={14} className="text-blue-400" /> Bằng chứng đính kèm ({images.length})
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                      {images.map((img, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedImage(img)}
                          className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700 cursor-pointer hover:border-blue-500 hover:scale-105 transition-all shrink-0"
                        >
                          <img src={img} alt={`Evidence ${idx}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-dashed border-slate-700 rounded-[2rem] p-20 text-center mt-10">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={40} />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Thật tuyệt vời!</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
            Hiện tại không có bất kỳ task nào do bạn duyệt bị khiếu nại. Hãy tiếp tục giữ vững phong độ nhé!
          </p>
        </div>
      )}

      {/* Modal xem ảnh phóng to */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-[#0f172a]/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-rose-500 text-white rounded-full flex items-center justify-center transition-all"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="Enlarged Evidence" 
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl border border-slate-700 cursor-default"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default ReviewerDisputeList;