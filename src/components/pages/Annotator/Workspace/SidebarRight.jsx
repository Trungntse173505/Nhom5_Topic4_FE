import React from 'react';
import { Tag } from 'lucide-react';

const SidebarRight = ({ availableLabels = [], selectedLabel, setSelectedLabel, actualType, annotations = [], setAnnotations }) => {
  const isVideo = actualType === 'video';

  return (
    <aside className="w-64 border-l border-slate-800 bg-[#0f172a] p-4 flex flex-col shrink-0 text-left">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <Tag size={16} className={isVideo ? "text-blue-400" : "text-green-400"} /> 
        {isVideo ? "Phân loại Video" : "Bộ Nhãn"}
      </h3>
      
      <div className={`flex flex-col ${isVideo ? "gap-3" : "gap-2"}`}>
        {availableLabels.map(({ name, color }) => {
          // Gộp logic kiểm tra nhãn đang chọn
          const isSelected = isVideo ? annotations[0]?.label === name : selectedLabel === name;
          
          return isVideo ? (
            <button
              key={name}
              onClick={() => {
                setAnnotations([{ id: `video-label-${Date.now()}`, x: 0, y: 0, width: 0, height: 0, label: name }]);
                setSelectedLabel(name);
              }}
              className={`py-3.5 px-4 rounded-xl font-bold text-sm transition-all border-2 text-left flex justify-between items-center ${
                isSelected ? 'text-white shadow-lg' : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 bg-[#1e293b]'
              }`}
              style={isSelected ? { backgroundColor: color, borderColor: color, boxShadow: `0 4px 15px ${color}40` } : {}}
            >
              <span className="truncate">{name}</span>
              {isSelected && <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0">Đã chọn</span>}
            </button>
          ) : (
            <button
              key={name}
              onClick={() => setSelectedLabel(name)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                isSelected ? 'bg-[#1e293b] text-white shadow-lg' : 'border-transparent text-slate-400 hover:bg-slate-800/50'
              }`}
              style={{ borderColor: isSelected ? color : 'transparent' }}
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: isSelected ? `0 0 12px ${color}99` : 'none' }}></span>
              <span className="truncate">{name}</span>
            </button>
          );
        })}
        
        {/* Hiển thị text báo trống tương ứng */}
        {availableLabels.length === 0 && (
          <p className="text-xs text-slate-500 italic font-normal">
            {isVideo ? "Chưa có nhãn." : "Chưa cấu hình nhãn."}
          </p>
        )}
      </div>
    </aside>
  );
};

export default SidebarRight;