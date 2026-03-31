import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import {
  FILE_TYPE_COLORS,
  FILE_TYPE_LABELS,
  FILE_TYPE_ICONS,
  groupDataByType,
} from "../../../../utils/fileTypeDetector";

const ReviewerSidebarLeft = ({ items = [], currentIndex, onSelectIndex }) => {
  // Gắn globalIndex vào mỗi item để khi phân nhóm vẫn biết index gốc là bao nhiêu
  const itemsWithIndex = useMemo(() => {
    return items.map((item, idx) => ({ ...item, globalIndex: idx }));
  }, [items]);

  // Nhóm file theo loại
  const groupedData = useMemo(() => groupDataByType(itemsWithIndex), [itemsWithIndex]);

  // Trạng thái mở/đóng các nhóm (Mặc định mở hết)
  const [expandedGroups, setExpandedGroups] = useState({
    IMAGE: true,
    VIDEO: true,
    AUDIO: true,
    TEXT: true,
    OTHER: true,
  });

  const toggleGroup = (typeKey, e) => {
    e.stopPropagation();
    setExpandedGroups((prev) => ({
      ...prev,
      [typeKey]: !prev[typeKey],
    }));
  };

  return (
    <aside className="w-72 border-r border-slate-800 bg-[#0f172a] flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-4 border-b border-slate-800 text-left bg-[#1e293b]">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">Danh sách File</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Tổng số: {items.length} file cần duyệt</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 text-left custom-scrollbar">
        {Object.entries(groupedData).map(([typeKey, itemsInGroup]) => {
          if (itemsInGroup.length === 0) return null;

          const isExpanded = expandedGroups[typeKey];
          const typeColor = FILE_TYPE_COLORS[typeKey] || FILE_TYPE_COLORS.OTHER;
          const typeLabel = FILE_TYPE_LABELS[typeKey] || typeKey;
          const typeIcon = FILE_TYPE_ICONS[typeKey] || FILE_TYPE_ICONS.OTHER;

          return (
            <div key={typeKey} className="flex flex-col gap-2">
              {/* Header của Group */}
              <button
                onClick={(e) => toggleGroup(typeKey, e)}
                className="flex items-center justify-between w-full p-2 hover:bg-white/5 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-white/5 shadow-sm ${typeColor}`}>
                    {typeIcon} {typeLabel}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    ({itemsInGroup.length})
                  </span>
                </div>
                <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              </button>

              {/* Danh sách File trong Group */}
              {isExpanded && (
                <div className="flex flex-col gap-1.5 pl-1">
                  {itemsInGroup.map((item, indexWithinGroup) => {
                    const isActive = currentIndex === item.globalIndex;
                    
                    // Logic đếm số lượng lỗi trong file này
                    const errorCount = item.annotations?.filter(a => a.isApproved === false).length || 0;
                    const isAllChecked = item.annotations?.every(a => a.isApproved !== null) && item.annotations?.length > 0;

                    // ✅ Format tên hiển thị thân thiện (Ảnh 1, Ảnh 2...) thay vì Data_ID dài ngoằn
                    const friendlyName = `${typeLabel} ${indexWithinGroup + 1}`;
                    const displayTitle = item.displayName || item.fileName || friendlyName;

                    return (
                      <div 
                        key={item.itemID || item.globalIndex}
                        onClick={() => onSelectIndex(item.globalIndex)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden ${
                          isActive 
                            ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                            : 'border-slate-800/50 bg-[#1e293b]/50 hover:border-slate-600 hover:bg-[#1e293b]'
                        }`}
                      >
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>}
                        
                        <div className="flex items-start justify-between gap-3 pl-1">
                          <div className="flex-1 min-w-0">
                            <span 
                              className={`text-sm font-semibold truncate block ${isActive ? 'text-white' : 'text-slate-300'}`} 
                              title={item.fileName || item.displayName || item.itemID}
                            >
                              {displayTitle}
                            </span>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                                {item.annotations?.length || 0} nhãn
                              </span>
                            </div>
                          </div>
                          
                          {/* Trạng thái duyệt nhanh */}
                          <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
                            {isAllChecked && errorCount === 0 && (
                              <CheckCircle size={16} className="text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                            )}
                            {errorCount > 0 && (
                              <div className="flex items-center gap-1 text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">
                                <span className="text-[10px] font-bold">{errorCount}</span>
                                <XCircle size={16} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ReviewerSidebarLeft;