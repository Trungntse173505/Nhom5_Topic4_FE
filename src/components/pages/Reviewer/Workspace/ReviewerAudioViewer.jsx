import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Music, Volume2 } from "lucide-react";

const ReviewerAudioViewer = ({ currentItem }) => {
  const audioRef = useRef(null);
  const [isPlay, setIsPlay] = useState(false);

  const src = currentItem?.filePath;

  useEffect(() => {
    setIsPlay(false);
    audioRef.current?.load();
  }, [src]);

  const togglePlay = () => {
    if (isPlay) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlay(!isPlay);
  };

  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 bg-[#0b1220]">
        Vui lòng chọn một file Audio để bắt đầu duyệt.
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0b1220] flex flex-col items-center justify-center p-8">
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-3xl p-10 flex flex-col items-center justify-center max-w-md w-full relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div
          className={`mb-6 p-5 rounded-full transition-all duration-500 ${isPlay ? "bg-blue-500/20 text-blue-400 animate-pulse" : "bg-slate-800 text-slate-400"
            }`}
        >
          <Music size={48} />
        </div>
        <audio ref={audioRef} src={src} onEnded={() => setIsPlay(false)} className="hidden" />

        <button
          onClick={togglePlay}
          className="w-20 h-20 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
        >
          {isPlay ? <Pause size={36} /> : <Play size={36} className="ml-2" />}
        </button>

        <div className="mt-8 flex items-center gap-2 text-sm font-medium h-6">
          {isPlay ? (
            <>
              <Volume2 size={16} className="text-blue-400 animate-pulse" />
              <span className="text-blue-400">Đang phát...</span>
            </>
          ) : (
            <span className="text-slate-500">Đã tạm dừng</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewerAudioViewer;