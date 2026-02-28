import React from 'react';

const SidebarLeft = ({ files = [], currentItemId, onSelectItem }) => {
  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0f172a] flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white">Danh sách File</h2>
        <p className="text-xs text-slate-400 mt-1">Tổng: {files.length} file</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {files.map((item) => {
          const isActive = currentItemId === item.id;
          return (
            <div 
              key={item.id}
              onClick={() => onSelectItem && onSelectItem(item.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${isActive ? 'border-blue-500 bg-[#1e293b]' : 'border-slate-800 hover:border-slate-600'}`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium truncate pr-2 ${isActive ? 'text-white' : 'text-slate-300'}`}>{item.id}{item.ext}</span>
                {item.status === 'Done' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium shrink-0">Done</span>}
                {item.status === 'Rejected' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium shrink-0">Rejected</span>}
              </div>
              {item.status === 'Rejected' && item.note && <p className="text-xs text-red-400 mt-2">✕ {item.note}</p>}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default SidebarLeft;