import React from "react";
import { X, Video } from "lucide-react";
import { getLabelDisplay } from "../../../../../utils/aiHelper";

const TagList = ({ annotations, availableLabels, onDeleteTag }) => {
  return (
    <div className="max-w-4xl w-full bg-[#0f172a]/50 p-6 rounded-xl border border-slate-700/50 min-h-[150px]">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Video size={18} className="text-blue-400" /> Nhãn Phân Loại Video
      </h3>

      {annotations.length === 0 ? (
        <div className="text-slate-500 text-sm text-center italic py-8 border border-dashed border-slate-600 rounded-lg">
          Chưa có nhãn nào được gán cho video này. Hãy chọn nhãn ở cột bên phải.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {annotations.map((ann, idx) => {
            const matchedDef = availableLabels.find((l) => l.name === ann.label);
            const color = matchedDef ? matchedDef.color : "#3b82f6"; // Giữ nguyên màu
            
            // 🔥 THÊM ICON ĐÚNG/SAI
            let statusIcon = "";
            if (ann.isApproved === "True") statusIcon = " ✓";
            else if (ann.isApproved === "False") statusIcon = " ✗";

            return (
              <div
                key={ann.id || idx}
                className="flex items-center gap-2 px-4 py-2 rounded-full border group relative"
                style={{ backgroundColor: `${color}20`, borderColor: `${color}50` }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-white text-sm font-bold tracking-wide">
                  {getLabelDisplay(ann.label)}{statusIcon}
                </span>

                <button
                  onClick={() => onDeleteTag(ann.id || idx)}
                  className="ml-2 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TagList;