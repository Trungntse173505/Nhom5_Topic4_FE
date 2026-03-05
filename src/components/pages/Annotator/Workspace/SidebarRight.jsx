import React from 'react';

const SidebarRight = ({ availableLabels = [], selectedLabel, setSelectedLabel }) => (
  <aside className="w-64 border-l border-slate-800 bg-[#0f172a] p-4 flex flex-col shrink-0">
    <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Bộ Nhãn (Labels)</h3>
    
    {availableLabels.length === 0 ? (
       <p className="text-sm text-slate-500 italic">Dự án chưa cấu hình nhãn.</p>
    ) : (
      <div className="flex flex-col gap-2">
        {availableLabels.map(({ name, color }) => (
          <button
            key={name}
            onClick={() => setSelectedLabel(name)}
            className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all ${
              selectedLabel === name ? 'bg-[#1e293b] text-white shadow-lg' : 'border-transparent text-slate-400 hover:bg-slate-800/50'
            }`}
            style={{ borderColor: selectedLabel === name ? color : 'transparent' }}
          >
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color, boxShadow: selectedLabel === name ? `0 0 12px ${color}99` : 'none' }}
            ></span>
            {name}
          </button>
        ))}
      </div>
    )}
  </aside>
);

export default SidebarRight;