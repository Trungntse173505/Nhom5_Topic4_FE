import React, { useState } from 'react';
import { AlertTriangle, X, Send } from 'lucide-react';

const DisputeModal = ({ isOpen, onClose, onSubmit, taskName }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-[#0f172a]/50">
          <div className="flex items-center gap-3 text-amber-500">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-bold text-white">Khiếu nại kết quả Review</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-slate-300 mb-4">
            Bạn đang tạo khiếu nại cho ảnh/task này. Vui lòng giải thích rõ lý do bạn cho rằng Reviewer đã đánh giá sai. Manager sẽ là người phân xử cuối cùng.
          </p>
          
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg mb-4 text-xs text-amber-400/90 leading-relaxed">
            <strong>Lưu ý hệ thống:</strong> Nếu Manager xác nhận Reviewer đúng (bạn cố chấp/spam), bạn sẽ bị phạt <strong>-5 điểm</strong> tín nhiệm. Nếu bạn đúng, task sẽ được Approved và Reviewer sẽ bị phạt.
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ví dụ: Tôi đã vẽ sát viền xe theo đúng guideline mục 2.1, Reviewer bảo sai là không hợp lý..."
            className="w-full h-32 bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
          ></textarea>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-slate-700 bg-[#0f172a]/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={() => {
              onSubmit(reason);
              setReason(''); // Clear text sau khi gửi
              onClose();     // Đóng modal
            }}
            disabled={!reason.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-amber-600/20"
          >
            <Send size={16} /> Gửi Khiếu nại
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisputeModal;