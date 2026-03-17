// Đường dẫn: src/pages/Annotator/Workspace/AudioEditor.jsx
import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Music,
  Volume2,
  Trash2,
  RotateCcw,
  X,
  Edit3,
} from "lucide-react";

const AudioEditor = ({
  selectedLabel,
  availableLabels = [],
  annotations,
  setAnnotations,
  fileData,
}) => {
  const { id, url, name } = fileData || {};
  const audioRef = useRef(null);
  const [isPlay, setIsPlay] = useState(false);

  useEffect(() => {
    setIsPlay(false);
    audioRef.current?.load();
  }, [url]);

  const togglePlay = () => {
    if (isPlay) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlay(!isPlay);
  };

  const handleUndo = () => {
    if (annotations.length > 0) setAnnotations(annotations.slice(0, -1));
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc muốn xóa TOÀN BỘ nhãn âm thanh?")) {
      setAnnotations([]);
    }
  };

  const handleDeleteBox = (annId) => {
    setAnnotations(annotations.filter((a) => a.id !== annId));
  };

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
            className={`mb-6 p-5 rounded-full transition-all duration-500 ${isPlay ? "bg-blue-500/20 text-blue-400 animate-pulse" : "bg-slate-800 text-slate-400"}`}
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

        {/* DANH SÁCH CÁC NHÃN KẾT QUẢ ĐÃ GÁN (BOX/TAGS) */}
        <div className="max-w-3xl w-full bg-[#0f172a]/50 p-6 rounded-xl border border-slate-700/50 min-h-[200px]">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Edit3 size={16} className="text-blue-400" /> Nhãn Âm Thanh
            (Annotations)
          </h3>

          {annotations.length === 0 ? (
            <div className="text-slate-500 text-sm text-center italic py-8 border border-dashed border-slate-600 rounded-lg">
              Chưa có nhãn nào được gán cho đoạn audio này.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {annotations.map((ann, idx) => {
                const matchedDef = availableLabels.find(
                  (l) => l.name === ann.label,
                );
                const color = matchedDef ? matchedDef.color : "#3b82f6";

                return (
                  <div
                    key={ann.id || idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border group relative"
                    style={{
                      backgroundColor: `${color}20`,
                      borderColor: `${color}50`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-white text-sm font-medium">
                      {ann.label}
                    </span>

                    {/* Thông tin Text/Timestamp (Nếu AI có trả về) */}
                    {ann.text && (
                      <span className="text-slate-400 text-xs italic ml-1">
                        "{ann.text}"
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteBox(ann.id || idx)}
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
      </div>
    </div>
  );
};

export default AudioEditor;
