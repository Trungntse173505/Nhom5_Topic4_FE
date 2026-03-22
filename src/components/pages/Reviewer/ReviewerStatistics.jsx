import React from 'react';
import { Eye, Clock, Timer, Flame, ShieldCheck, Trophy, Star } from 'lucide-react';

const ReviewerStatistics = () => {
  // Dữ liệu cứng chờ API
  const stats = {
    totalReviewedTasks: 350,
    totalReviewHours: 85.2,
    avgReviewHours: 0.8,
    disputedTasksStreak: 2,
    currentPerfectRejectStreak: 15,
    experience: 8900,
    reputationPoints: 100
  };

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      <div className="mb-10">
        <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight text-white uppercase">
          <Eye className="text-blue-500" size={36} />
          Hiệu Suất Review
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Tổng quan về tốc độ duyệt bài và độ chính xác của bạn.
        </p>
      </div>

      {/* Thẻ XP & Điểm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-900/40 to-[#1e293b] border border-indigo-500/20 rounded-3xl p-6 flex items-center gap-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Trophy size={32} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Kinh nghiệm (XP)</p>
            <h3 className="text-4xl font-black text-white">{stats.experience}</h3>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-900/40 to-[#1e293b] border border-emerald-500/20 rounded-3xl p-6 flex items-center gap-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Star size={32} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Điểm tín nhiệm</p>
            <h3 className="text-4xl font-black text-white">{stats.reputationPoints}/100</h3>
          </div>
        </div>
      </div>

      {/* Grid chỉ số */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={<Eye size={24} className="text-blue-400" />}
          title="Tổng Task Đã Duyệt"
          value={stats.totalReviewedTasks}
          bgClass="bg-blue-500/10"
        />
        <StatCard 
          icon={<Clock size={24} className="text-purple-400" />}
          title="Tổng Giờ Duyệt"
          value={`${stats.totalReviewHours}h`}
          bgClass="bg-purple-500/10"
        />
        <StatCard 
          icon={<Timer size={24} className="text-emerald-400" />}
          title="Tốc Độ TB / Task"
          value={`${stats.avgReviewHours}h`}
          bgClass="bg-emerald-500/10"
        />
        <StatCard 
          icon={<ShieldCheck size={24} className="text-green-400" />}
          title="Chuỗi Bắt Lỗi Đúng"
          value={`${stats.currentPerfectRejectStreak} Lần`}
          bgClass="bg-green-500/10"
        />
        <StatCard 
          icon={<Flame size={24} className="text-rose-400" />}
          title="Chuỗi Bị Khiếu Nại"
          value={stats.disputedTasksStreak}
          bgClass="bg-rose-500/10"
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, bgClass }) => (
  <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 hover:border-slate-600 transition-all shadow-lg flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${bgClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h4 className="text-2xl font-black text-white">{value}</h4>
    </div>
  </div>
);

export default ReviewerStatistics;