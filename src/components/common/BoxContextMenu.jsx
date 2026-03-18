// Đường dẫn: src/components/common/BoxContextMenu.jsx
import React from "react";
import { Trash2, Edit3, X } from "lucide-react";

// 👉 IMPORT HÀM DỊCH SANG TIẾNG VIỆT
import { getLabelDisplay } from "../../utils/aiHelper";

const BoxContextMenu = ({
  selectedAnn,
  availableLabels,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  onCancel,
  onChangeLabel,
  onDelete,
}) => {
  if (!selectedAnn) return null;

  return (
    <div
      className="absolute z-30 bg-[#0f172a] border border-slate-600 rounded-lg shadow-2xl p-2 flex flex-col gap-2 min-w-[180px] animate-in fade-in zoom-in duration-200"
      style={{
        left: Math.min(
          Math.max(
            Math.max(selectedAnn.x, selectedAnn.x + selectedAnn.width) + 10,
            10,
          ),
          CANVAS_WIDTH - 190,
        ),
        top: Math.min(
          Math.max(
            Math.min(selectedAnn.y, selectedAnn.y + selectedAnn.height),
            10,
          ),
          CANVAS_HEIGHT - 120,
        ),
      }}
    >
      <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-1">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
          <Edit3 size={12} /> Sửa Khung
        </span>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* DROPDOWN CHỌN NHÃN */}
      <select
        value={selectedAnn.label}
        onChange={(e) => onChangeLabel(selectedAnn.id, e.target.value)}
        className="bg-slate-800 text-white text-sm rounded px-2 py-2 outline-none border border-slate-600 focus:border-blue-500 cursor-pointer"
      >
        {availableLabels.map((label) => (
          <option key={label.id} value={label.name}>
            {/* 👉 Đeo mặt nạ hiển thị tiếng Việt ở đây */}
            {getLabelDisplay(label.name)}
          </option>
        ))}
      </select>

      <button
        onClick={() => onDelete(selectedAnn.id)}
        className="flex items-center justify-center gap-1.5 w-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white py-2 rounded text-sm transition-all border border-red-500/20 hover:border-red-500 mt-1"
      >
        <Trash2 size={14} /> Xóa Khung
      </button>
    </div>
  );
};

export default BoxContextMenu;
