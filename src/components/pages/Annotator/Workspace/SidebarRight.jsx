import React from 'react';

const SidebarRight = ({ selectedLabel, setSelectedLabel, dataType }) => {
  const getLabels = () => {
    if (dataType === 'text') {
      return [
        { name: 'Tích cực', color: 'bg-green-500' },
        { name: 'Tiêu cực', color: 'bg-red-500' },
        { name: 'Trung tính', color: 'bg-slate-400' },
        { name: 'Spam', color: 'bg-yellow-500' }
      ];
    }
    return [
      { name: 'Vehicle', color: 'bg-blue-500' },
      { name: 'Pedestrian', color: 'bg-green-500' },
      { name: 'Traffic Sign', color: 'bg-yellow-500' },
    ];
  };

  const labels = getLabels();

  return (
    <aside className="w-64 border-l border-slate-800 bg-[#0f172a] p-4 flex flex-col shrink-0">
      <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Bộ Nhãn (Labels)</h3>
      <div className="flex flex-col gap-2">
        {labels.map(label => (
          <button
            key={label.name}
            onClick={() => setSelectedLabel(label.name)} // CẬP NHẬT STATE Ở ĐÂY
            className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all ${
              selectedLabel === label.name 
                ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                : 'border-transparent text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <span className={`w-3 h-3 rounded-full ${label.color}`}></span>
            {label.name}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default SidebarRight;