import React from 'react';
import { ShieldAlert } from 'lucide-react';

const DisputeStats = ({ count }) => {
  return (
    <div className="bg-[#1e293b] border border-amber-500/30 p-6 rounded-2xl flex items-center gap-4 shadow-lg shadow-amber-500/5">
      <div className="p-4 bg-amber-500/20 rounded-xl text-amber-500">
        <ShieldAlert size={28} />
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">Đang Khiếu Nại</p>
        <p className="text-3xl font-bold text-white">{count}</p>
      </div>
    </div>
  );
};

export default DisputeStats;