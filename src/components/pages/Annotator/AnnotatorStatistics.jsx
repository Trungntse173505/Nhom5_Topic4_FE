import React from 'react';
import { CheckCircle, Target, Clock, Timer, Zap, AlertTriangle, Trophy, Star } from 'lucide-react';

const AnnotatorStatistics = () => {
  // Dữ liệu cứng (Mock data) chờ API
  const stats = {
    totalCompletedTasks: 142,
    firstTryApprovedTasks: 89,
    totalWorkingHours: 120.5,
    avgCompletionHours: 2.4,
    currentPerfectStreak: 12,
    rejectDisputedTasksStreak: 0,
    experience: 2450,
    reputationPoints: 98
  };

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      <div className="mb-10">
        <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight text-white uppercase">
          <Trophy className="text-blue-500" size={36} />
          Thống Kê Hoạt Động Của Bạn
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Tổng hợp hiệu suất gán nhãn và điểm tín nhiệm cá nhân.
        </p>
      </div>

      {/* Thẻ XP & Điểm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-900/40 to-[#1e293b] border border-blue-500/20 rounded-3xl p-6 flex items-center gap-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <Trophy size={32} className="text-blue-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Kinh nghiệm (XP)</p>
            <h3 className="text-4xl font-black text-white">{stats.experience}</h3>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-900/40 to-[#1e293b] border border-amber-500/20 rounded-3xl p-6 flex items-center gap-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <Star size={32} className="text-amber-400" />
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
          icon={<CheckCircle size={24} className="text-green-400" />}
          title="Task Đã Hoàn Thành"
          value={stats.totalCompletedTasks}
          bgClass="bg-green-500/10"
        />
        <StatCard 
          icon={<Target size={24} className="text-indigo-400" />}
          title="Pass Ngay Lần Đầu"
          value={stats.firstTryApprovedTasks}
          bgClass="bg-indigo-500/10"
        />
        <StatCard 
          icon={<Zap size={24} className="text-amber-400" />}
          title="Chuỗi Hoàn Hảo"
          value={`${stats.currentPerfectStreak} Task`}
          bgClass="bg-amber-500/10"
        />
        <StatCard 
          icon={<Clock size={24} className="text-blue-400" />}
          title="Tổng Giờ Làm Việc"
          value={`${stats.totalWorkingHours}h`}
          bgClass="bg-blue-500/10"
        />
        <StatCard 
          icon={<Timer size={24} className="text-purple-400" />}
          title="Trung Bình / Task"
          value={`${stats.avgCompletionHours}h`}
          bgClass="bg-purple-500/10"
        />
        <StatCard 
          icon={<AlertTriangle size={24} className="text-rose-400" />}
          title="Dispute Bị Bác Bỏ"
          value={stats.rejectDisputedTasksStreak}
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

export default AnnotatorStatistics;