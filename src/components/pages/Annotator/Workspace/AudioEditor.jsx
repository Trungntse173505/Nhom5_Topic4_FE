import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioEditor = ({ fileData }) => {
  const audioRef = useRef(null);
  const [isPlay, setIsPlay] = useState(false);

  useEffect(() => {
    setIsPlay(false);
    if(audioRef.current) audioRef.current.load();
  }, [fileData?.url]);

  return (
    <div className="w-full h-full bg-[#1e293b] rounded-xl p-8 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-8">{fileData?.id}</h2>
      <audio ref={audioRef} src={fileData?.url} onEnded={() => setIsPlay(false)} />
      <button 
        onClick={() => { isPlay ? audioRef.current.pause() : audioRef.current.play(); setIsPlay(!isPlay); }}
        className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg"
      >
        {isPlay ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
      </button>
      <p className="mt-4 text-slate-400">Đang phát: {fileData?.url}</p>
    </div>
  );
};

export default AudioEditor;