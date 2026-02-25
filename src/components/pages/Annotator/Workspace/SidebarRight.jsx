import React from 'react';

const SidebarRight = ({ selectedLabel, setSelectedLabel }) => {
  const labels = [
    { name: 'Vehicle', color: 'bg-blue-500' },
    { name: 'Pedestrian', color: 'bg-green-500' },
    { name: 'Traffic Sign', color: 'bg-yellow-500' },
  ];

  return (
    <aside className="w-64 border-l border-slate-800 bg-[#0f172a] p-4 flex flex-col">
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

      {/* Button Khiếu nại */}
      <div className="mt-auto border-t border-slate-800 pt-4">
        <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-lg text-sm border border-red-500/20 transition-colors">
          Khiếu nại (Dispute)
        </button>
        <p className="text-[10px] text-slate-500 mt-2 text-center">Chỉ dùng khi bị Reject sai</p>
      </div>
    </aside>
  );
};

export default SidebarRight;