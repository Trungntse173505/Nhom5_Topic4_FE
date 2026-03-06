import React from 'react';

const VideoCanvas = ({ videoUrl }) => {
  return (
    <div className="w-full h-full bg-[#0b1220] flex flex-col items-center justify-center p-4">
      <div className="w-full h-full max-w-6xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center relative">
        <video 
          key={videoUrl}
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-full object-contain"
        >
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
      </div>

    </div>
  );
};

export default VideoCanvas;