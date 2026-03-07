import React from 'react';
import { Image as ImageIcon, AlertTriangle, CheckCircle } from 'lucide-react';

const SidebarLeft = ({ files = [], currentItemId, onSelectItem }) => (
  <aside className="w-64 border-r border-slate-800 bg-[#0f172a] flex flex-col h-full overflow-hidden shrink-0">
    <div className="p-4 border-b border-slate-800">
      <h2 className="text-lg font-bold text-white">Danh sách File</h2>
      <p className="text-xs text-slate-400 mt-1">Tổng: {files.length} file</p>
    </div>
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
      {files.map(({ id, name, status }) => {
        const isActive = currentItemId === id;
        return (
          <div 
            key={id}
            onClick={() => onSelectItem?.(id)}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${isActive ? 'border-blue-500 bg-[#1e293b]' : 'border-slate-800 hover:border-slate-600'}`}
          >
            <div className="flex justify-between items-center gap-2">
              <ImageIcon size={14} className={isActive ? "text-blue-400" : "text-slate-500"} />
              <span className={`text-sm font-medium truncate flex-1 ${isActive ? 'text-white' : 'text-slate-300'}`} title={name}>
                {name}
              </span>
              {status === 'Done' && <CheckCircle size={14} className="text-green-500 shrink-0" />}
              {status === 'Rejected' && <AlertTriangle size={14} className="text-red-500 shrink-0" title="Bị báo lỗi" />}
            </div>
          </div>
        );
      })}
    </div>
  </aside>
);

export default SidebarLeft;