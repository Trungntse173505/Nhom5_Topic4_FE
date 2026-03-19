import React, { useRef, useState, useEffect, useCallback } from "react";
import { Music, Trash2, RotateCcw } from "lucide-react";
import TagList from "./TagList";

const AudioEditor = ({
  availableLabels = [],
  annotations,
  setAnnotations,
  fileData,
}) => {
  const { url } = fileData || {};
  const audioRef = useRef(null);
  const [isPlay, setIsPlay] = useState(false);

  useEffect(() => {
    setIsPlay(false);
    audioRef.current?.load();
  }, [url]);

  const handleUndo = () => {
    if (annotations.length > 0) setAnnotations(annotations.slice(0, -1));
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc muốn xóa TOÀN BỘ nhãn âm thanh?")) {
      setAnnotations([]);
    }
  };

  // TỐI ƯU: Dùng useCallback để Component con (TagList) không bị mất tác dụng memo
  const handleDeleteBox = useCallback((annId) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== annId));
  }, [setAnnotations]);

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 bg-[#0b1220]">
        Vui lòng chọn một file Audio để bắt đầu.
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#1e293b] flex flex-col relative group">
      {/* THANH CÔNG CỤ (UNDO / DELETE) */}
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

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* KHU VỰC TRÌNH PHÁT NHẠC */}
        <div className="bg-black/40 border border-slate-700/50 rounded-3xl p-10 flex flex-col items-center justify-center max-w-md w-full relative overflow-hidden shadow-2xl mb-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div
            className={`mb-6 p-5 rounded-full transition-all duration-500 ${
              isPlay ? "bg-blue-500/20 text-blue-400 animate-pulse" : "bg-slate-800 text-slate-400"
            }`}
          >
            <Music size={48} />
          </div>
          <audio
            ref={audioRef}
            src={url}
            onEnded={() => setIsPlay(false)}
            controls
            className="w-full h-10 mt-4 outline-none rounded-full"
            onPlay={() => setIsPlay(true)}
            onPause={() => setIsPlay(false)}
          />
        </div>

        {/* DANH SÁCH CÁC NHÃN */}
        <TagList
          annotations={annotations}
          availableLabels={availableLabels}
          onDeleteTag={handleDeleteBox}
        />
      </div>
    </div>
  );
};

export default AudioEditor;