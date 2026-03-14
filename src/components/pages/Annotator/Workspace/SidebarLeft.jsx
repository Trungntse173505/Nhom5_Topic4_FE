import React from 'react';
import { Image as ImageIcon, AlertTriangle, CheckCircle } from 'lucide-react';

// SỬA CHỖ NÀY: Thêm prop taskStatus
const SidebarLeft = ({ files = [], currentItemId, onSelectItem, taskStatus }) => {
  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0f172a] flex flex-col h-full overflow-hidden shrink-0">
      
      {/* --- PHẦN HEADER --- */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white">Danh sách File</h2>
        <p className="text-xs text-slate-400 mt-1">Tổng: {files.length} file</p>
      </div>

      {/* --- PHẦN DANH SÁCH FILE --- */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {files.map(({ id, name, status }) => {
          const isActive = currentItemId === id;
          const containerClass = isActive 
            ? 'border-blue-500 bg-[#1e293b]' 
            : 'border-slate-800 hover:border-slate-600';
            
          const iconClass = isActive 
            ? 'text-blue-400' 
            : 'text-slate-500';
            
          const textClass = isActive 
            ? 'text-white' 
            : 'text-slate-300';

          return (
            <div 
              key={id}
              onClick={() => onSelectItem?.(id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${containerClass}`}
            >
              <div className="flex justify-between items-center gap-2">
                {/* Icon bên trái */}
                <ImageIcon size={14} className={iconClass} />
                
                {/* Tên file */}
                <span className={`text-sm font-medium truncate flex-1 ${textClass}`} title={name}>
                  {name}
                </span>
                
                {/*Thay đổi logic hiển thị Icon */}
                {taskStatus === 'Rejected' ? (
                  // Ưu tiên 1: Nếu toàn bộ Task bị từ chối, hiện cảnh báo đỏ
                  <AlertTriangle size={14} className="text-red-500 shrink-0" title="Task bị từ chối, cần kiểm tra lại" />
                ) : status === 'Done' ? (
                  // Ưu tiên 2: Nếu Task bình thường và file đã làm xong
                  <CheckCircle size={14} className="text-green-500 shrink-0" />
                ) : status === 'Rejected' && (
                  <AlertTriangle size={14} className="text-red-500 shrink-0" title="Bị báo lỗi" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      
    </aside>
  );
};

export default SidebarLeft;