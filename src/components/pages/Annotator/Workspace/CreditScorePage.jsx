import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, TrendingDown, ShieldAlert, History, ArrowLeft } from 'lucide-react';

const CreditScorePage = () => {
  const navigate = useNavigate();
  const currentScore = 85; // Điểm giả lập
  
  const scoreHistory = [
    { id: 1, date: '2026-02-25 14:30', action: 'Gán nhãn đúng ngay từ đầu (Task IMG_001)', points: '+10', type: 'up' },
    { id: 2, date: '2026-02-24 09:15', action: 'Tỷ lệ nộp lần 1 đạt >95%', points: '+2', type: 'up' },
    { id: 3, date: '2026-02-22 16:00', action: 'Sửa lỗi đến lần 2 (Task IMG_042)', points: '-5', type: 'down' },
    { id: 4, date: '2026-02-20 10:20', action: 'Khiếu nại sai (Spam hệ thống)', points: '-5', type: 'down' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={() => navigate('/annotator')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Quay lại Dashboard
        </button>

        <div className="mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="text-yellow-500" /> Điểm Tín Nhiệm & Xếp Hạng
          </h1>
          <p className="text-slate-400 mt-2">Duy trì điểm số cao để được ưu tiên phân công đúng chuyên môn và nhận nhiều task hơn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Box Điểm hiện tại */}
          <div className="col-span-1 bg-[#1e293b] border border-slate-700 p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden h-fit">
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl ${currentScore >= 50 ? 'bg-blue-500/20' : 'bg-red-500/20'}`}></div>
            
            <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-2 z-10">Điểm hiện tại</p>
            <div className={`text-7xl font-black mb-4 z-10 ${currentScore >= 50 ? 'text-blue-400' : currentScore >= 20 ? 'text-yellow-400' : 'text-red-500'}`}>
              {currentScore}
            </div>
            
            <div className="z-10">
              {currentScore >= 50 ? (
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-full text-sm font-bold">Max 3 Task / lúc</span>
              ) : currentScore >= 20 ? (
                <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-full text-sm font-bold">Hạn chế: Max 2 Task</span>
              ) : (
                <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <ShieldAlert size={16}/> Mức cảnh báo (Max 1 Task)
                </span>
              )}
            </div>
          </div>

          {/* Box Lịch sử biến động */}
          <div className="col-span-2 bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <History size={20} className="text-slate-400" /> Lịch sử biến động điểm
            </h2>
            <div className="space-y-3">
              {scoreHistory.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-[#0f172a] border border-slate-800 rounded-xl hover:border-slate-600 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.action}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.date}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 font-bold text-lg ${item.type === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {item.type === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    {item.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreditScorePage;