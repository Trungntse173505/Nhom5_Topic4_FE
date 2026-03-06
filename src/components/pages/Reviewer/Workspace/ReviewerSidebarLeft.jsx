import React from 'react';
import { Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';

const ReviewerSidebarLeft = ({ items = [], currentIndex, onSelectIndex }) => {
  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0f172a] flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-4 border-b border-slate-800 text-left">
        <h2 className="text-lg font-bold text-white">Danh sách File</h2>
        <p className="text-xs text-slate-400 mt-1">Tổng: {items.length} file</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 text-left">
        {items.map((item, index) => {
          const isActive = currentIndex === index;
          
          // Logic đếm số lượng lỗi trong file này
          const errorCount = item.annotations?.filter(a => a.isApproved === false).length || 0;
          const isAllChecked = item.annotations?.every(a => a.isApproved !== null) && item.annotations?.length > 0;

          return (
            <div 
              key={item.itemID}
              onClick={() => onSelectIndex(index)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${isActive ? 'border-blue-500 bg-[#1e293b]' : 'border-slate-800 hover:border-slate-600'}`}
            >
              <div className="flex items-start gap-2">
                <ImageIcon size={16} className={`mt-0.5 shrink-0 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium truncate block ${isActive ? 'text-white' : 'text-slate-300'}`} title={item.fileName}>
                    {item.fileName}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{item.annotations?.length || 0} box</p>
                </div>
                
                {/* Trạng thái duyệt nhanh */}
                {isAllChecked && errorCount === 0 && <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />}
                {errorCount > 0 && <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ReviewerSidebarLeft;