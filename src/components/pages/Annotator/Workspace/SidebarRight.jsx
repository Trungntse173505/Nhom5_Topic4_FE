import React, { useState } from 'react';
import DisputeModal from './DisputeModal';

const SidebarRight = ({ selectedLabel, setSelectedLabel, taskStatus = 'Rejected' }) => {
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);

  const labels = [
    { name: 'Vehicle', color: 'bg-blue-500' },
    { name: 'Pedestrian', color: 'bg-green-500' },
    { name: 'Traffic Sign', color: 'bg-yellow-500' },
  ];

  const handleDisputeSubmit = (reason) => {
    console.log("Đã gửi khiếu nại với lý do:", reason);
    alert("Gửi khiếu nại thành công! Chờ Manager xử lý.");
    // Sau này thay bằng API gọi xuống Backend
  };

  return (
    <aside className="w-64 border-l border-slate-800 bg-[#0f172a] p-4 flex flex-col shrink-0">
      <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase">Select Label</h3>
      <div className="flex flex-col gap-2 mb-8">
        {labels.map(label => (
          <button
            key={label.name}
            onClick={() => setSelectedLabel(label.name)}
            className={`flex items-center gap-3 p-3 rounded-lg border text-sm font-medium transition-all ${
              selectedLabel === label.name ? 'border-slate-500 bg-[#1e293b] text-white' : 'border-transparent text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <span className={`w-3 h-3 rounded-sm ${label.color}`}></span>
            {label.name}
          </button>
        ))}
      </div>

      {/* Button Khiếu nại (Chỉ hiện khi Task bị Reject) */}
      {taskStatus === 'Rejected' && (
        <div className="mt-auto border-t border-slate-800 pt-4">
          <button 
            onClick={() => setIsDisputeOpen(true)}
            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-lg text-sm border border-red-500/20 transition-colors shadow-lg shadow-red-500/5"
          >
            Khiếu nại (Dispute)
          </button>
          <p className="text-[10px] text-slate-500 mt-2 text-center leading-relaxed">
            Nếu Reviewer bắt lỗi sai, hãy khiếu nại để lấy lại điểm.
          </p>
        </div>
      )}

      {/* Nhúng Modal vào Sidebar */}
      <DisputeModal 
        isOpen={isDisputeOpen} 
        onClose={() => setIsDisputeOpen(false)} 
        onSubmit={handleDisputeSubmit}
      />
    </aside>
  );
};

export default SidebarRight;