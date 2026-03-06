import React from 'react';
import { Tag } from 'lucide-react';

const SidebarRight = ({ 
  availableLabels = [], 
  selectedLabel, 
  setSelectedLabel, 
  actualType, 
  annotations = [], 
  setAnnotations 
}) => {
  
  // LOGIC DÀNH RIÊNG CHO VIDEO: Render nút bấm to, dạt sang trái
  if (actualType === 'video') {
    // Lấy nhãn đầu tiên trong mảng annotations (vì video chỉ có 1 nhãn duy nhất)
    const currentAnnotatedLabel = annotations.length > 0 ? annotations[0].label : null;

    const handleSelectVideoLabel = (name) => {
      // Chốt luôn tọa độ 0 để lừa API Backend
      setAnnotations([{
        id: `video-label-${Date.now()}`,
        x: 0, y: 0, width: 0, height: 0,
        label: name
      }]);
      setSelectedLabel(name); 
    };

    return (
      <aside className="w-64 border-l border-slate-800 bg-[#0f172a] p-4 flex flex-col shrink-0 text-left">
        <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Tag size={16} className="text-blue-400" /> Phân loại Video
        </h3>
        
        <div className="flex flex-col gap-3">
          {availableLabels.map(({ name, color }) => {
            const isSelected = currentAnnotatedLabel === name;
            return (
              <button
                key={name}
                onClick={() => handleSelectVideoLabel(name)}
                className={`py-3.5 px-4 rounded-xl font-bold text-sm transition-all border-2 text-left flex justify-between items-center ${
                  isSelected 
                    ? 'text-white shadow-lg' 
                    : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 bg-[#1e293b]'
                }`}
                style={{ 
                  backgroundColor: isSelected ? color : undefined,
                  borderColor: isSelected ? color : undefined,
                  boxShadow: isSelected ? `0 4px 15px ${color}40` : 'none'
                }}
              >
                <span className="truncate">{name}</span>
                {isSelected && (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0">
                    Đã chọn
                  </span>
                )}
              </button>
            );
          })}
          {availableLabels.length === 0 && <p className="text-xs text-slate-500 italic">Chưa có nhãn.</p>}
        </div>
      </aside>
    );
  }

  // GIAO DIỆN MẶC ĐỊNH CHO ẢNH (Chấm tròn nhỏ)
  return (
    <aside className="w-64 border-l border-slate-800 bg-[#0f172a] p-4 flex flex-col shrink-0 text-left">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <Tag size={16} className="text-green-400" /> Bộ Nhãn
      </h3>
      
      <div className="flex flex-col gap-2">
        {availableLabels.map(({ name, color }) => (
          <button
            key={name}
            onClick={() => setSelectedLabel(name)}
            className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all text-left ${
              selectedLabel === name ? 'bg-[#1e293b] text-white shadow-lg' : 'border-transparent text-slate-400 hover:bg-slate-800/50'
            }`}
            style={{ borderColor: selectedLabel === name ? color : 'transparent' }}
          >
            <span 
              className="w-3 h-3 rounded-full shrink-0" 
              style={{ backgroundColor: color, boxShadow: selectedLabel === name ? `0 0 12px ${color}99` : 'none' }}
            ></span>
            <span className="truncate">{name}</span>
          </button>
        ))}
        {availableLabels.length === 0 && <p className="text-xs text-slate-500 italic font-normal">Chưa cấu hình nhãn.</p>}
      </div>
    </aside>
  );
};

export default SidebarRight;