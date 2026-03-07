import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, TrendingDown, ShieldAlert, History, Loader2 } from 'lucide-react';
import { useReputation } from '../../../../hooks/Annotator/useReputation';

const CreditScorePage = () => {
  const navigate = useNavigate();
  const { currentScore, logs, loading, error } = useReputation();

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
      <Loader2 className="animate-spin w-8 h-8 mr-3" /> Đang tải dữ liệu điểm số...
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
      <p className="text-red-500 mb-4">{error}</p>
      <button onClick={() => navigate('/annotator')} className="text-blue-400 underline">Quay lại</button>
    </div>
  );
  const isHigh = currentScore >= 50;
  const isMed = currentScore >= 20 && !isHigh;
  const isLow = currentScore < 20;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="text-yellow-500" /> Điểm Cá Nhân
          </h1>
          <p className="text-slate-400 mt-2">Duy trì điểm số cao để được ưu tiên phân công và nhận nhiều task hơn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Box Điểm Hiện Tại */}
          <div className="col-span-1 bg-[#1e293b] border border-slate-700 p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden h-fit">
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl ${isHigh ? 'bg-blue-500/20' : 'bg-red-500/20'}`} />
            <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-2 z-10">Điểm hiện tại</p>
            
            <div className={`text-7xl font-black mb-4 z-10 ${isHigh ? 'text-blue-400' : isMed ? 'text-yellow-400' : 'text-red-500'}`}>
              {currentScore}
            </div>
            
            <div className="z-10">
              {isHigh && <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-full text-sm font-bold">Max 3 Task / lúc</span>}
              {isMed && <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-full text-sm font-bold">Hạn chế: Max 2 Task</span>}
              {isLow && (
                <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <ShieldAlert size={16}/> Mức cảnh báo (Max 1 Task)
                </span>
              )}
            </div>
          </div>

          {/* Box Lịch Sử */}
          <div className="col-span-2 bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <History size={20} className="text-slate-400" /> Lịch sử biến động điểm
            </h2>
            
            <div className="space-y-3">
              {logs?.length ? logs.map(({ reason, createdAt, scoreChange }, index) => {
                const isPositive = scoreChange > 0;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#0f172a] border border-slate-800 rounded-xl hover:border-slate-600 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-white">{reason}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 font-bold text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      {isPositive ? `+${scoreChange}` : scoreChange}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center p-8 text-slate-500 bg-[#0f172a] rounded-xl border border-slate-800 border-dashed">
                  Bạn chưa có lịch sử biến động điểm nào.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreditScorePage;