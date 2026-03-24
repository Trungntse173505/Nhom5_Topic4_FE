import React from 'react';
import { Image as ImageIcon, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const SidebarLeft = ({ files = [], currentItemId, onSelectItem }) => {
  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0f172a] flex flex-col h-full overflow-hidden shrink-0">
      
      {/* --- PHẦN HEADER --- */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white">Danh sách File</h2>
        <p className="text-xs text-slate-400 mt-1">Tổng: {files.length} file</p>
      </div>

      {/* --- PHẦN DANH SÁCH FILE --- */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar">
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
                
                {/* 🔥 ICON TRẠNG THÁI CHUẨN UX */}
                {status === 'Error' && (
                  <XCircle size={15} className="text-red-500 shrink-0" title="Có nhãn làm sai (False), cần sửa!" />
                )}
                {status === 'Flagged' && (
                  <AlertTriangle size={15} className="text-amber-500 shrink-0" title="File đã báo lỗi (Flagged)" />
                )}
                {status === 'Done' && (
                  <CheckCircle size={15} className="text-emerald-500 shrink-0" title="Hoàn thành hợp lệ" />
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