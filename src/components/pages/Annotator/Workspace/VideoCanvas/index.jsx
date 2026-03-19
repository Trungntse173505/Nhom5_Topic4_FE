import React, { useRef } from "react";
import { Trash2, RotateCcw } from "lucide-react";
import TagList from "./TagList";

const VideoCanvas = ({
  availableLabels = [],
  annotations,
  setAnnotations,
  videoUrl,
}) => {
  const videoRef = useRef(null);

  const handleUndo = () => {
    if (annotations.length > 0) setAnnotations(annotations.slice(0, -1));
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc muốn xóa TOÀN BỘ nhãn trên video này?")) {
      setAnnotations([]);
    }
  };

  const handleDeleteTag = (annId) => {
    setAnnotations(annotations.filter((a) => a.id !== annId));
  };

  if (!videoUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 bg-[#0b1220]">
        Vui lòng chọn một file Video để bắt đầu.
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#1e293b] flex flex-col relative group overflow-y-auto">
      {/* THANH CÔNG CỤ */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={handleUndo}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 bg-[#0f172a]/80 backdrop-blur-md rounded-lg border border-slate-700 hover:text-white hover:bg-slate-800 transition-all shadow-xl"
        >
          <RotateCcw size={14} /> Hoàn tác
        </button>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-400 bg-[#0f172a]/80 backdrop-blur-md rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all shadow-xl"
        >
          <Trash2 size={14} /> Xóa sạch
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        
        {/* TRÌNH PHÁT VIDEO CHUẨN HTML5 */}
        <div className="bg-black border border-slate-700 rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full h-auto max-h-[500px] object-contain outline-none"
          />
        </div>

        {/* COMPONENT DANH SÁCH NHÃN CHUYÊN BIỆT */}
        <TagList 
          annotations={annotations}
          availableLabels={availableLabels}
          onDeleteTag={handleDeleteTag}
        />

      </div>
    </div>
  );
};

export default VideoCanvas;