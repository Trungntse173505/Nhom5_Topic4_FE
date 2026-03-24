import React from 'react';
import { CheckCircle, Target, Clock, Timer, Zap, AlertTriangle, Trophy, Star, Loader2 } from 'lucide-react';
import { useAnnotatorStats } from '../../../hooks/Annotator/useAnnotatorStats';

const AnnotatorStatistics = () => {
  const { stats, loading, error } = useAnnotatorStats();

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#0f172a] text-blue-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#0f172a] text-rose-500">
        <p>Lỗi tải dữ liệu: {error}</p>
      </div>
    );
  }

  // Map data từ API (Nếu API trả về tên biến khác, bạn sửa ở đây nhé)
  const safeStats = {
    totalCompletedTasks: stats?.totalCompletedTasks || 0,
    firstTryApprovedTasks: stats?.firstTryApprovedTasks || 0,
    totalWorkingHours: stats?.totalWorkingHours || 0,
    avgCompletionHours: stats?.avgCompletionHours || 0,
    currentPerfectStreak: stats?.currentPerfectStreak || 0,
    rejectDisputedTasksStreak: stats?.rejectDisputedTasksStreak || 0,
    experience: stats?.experience || 0,
    reputationPoints: stats?.reputationPoints || 0
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<CheckCircle size={24} className="text-green-400" />} title="Task Đã Hoàn Thành" value={safeStats.totalCompletedTasks} bgClass="bg-green-500/10" />
        <StatCard icon={<Target size={24} className="text-indigo-400" />} title="Pass Ngay Lần Đầu" value={safeStats.firstTryApprovedTasks} bgClass="bg-indigo-500/10" />
        <StatCard icon={<Zap size={24} className="text-amber-400" />} title="Chuỗi Hoàn Hảo" value={`${safeStats.currentPerfectStreak} Task`} bgClass="bg-amber-500/10" />
        <StatCard icon={<Clock size={24} className="text-blue-400" />} title="Tổng Giờ Làm Việc" value={`${safeStats.totalWorkingHours}h`} bgClass="bg-blue-500/10" />
        <StatCard icon={<Timer size={24} className="text-purple-400" />} title="Trung Bình / Task" value={`${safeStats.avgCompletionHours}h`} bgClass="bg-purple-500/10" />
        <StatCard icon={<AlertTriangle size={24} className="text-rose-400" />} title="Dispute Bị Bác Bỏ" value={safeStats.rejectDisputedTasksStreak} bgClass="bg-rose-500/10" />
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, bgClass }) => (
  <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 hover:border-slate-600 transition-all shadow-lg flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${bgClass}`}>{icon}</div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h4 className="text-2xl font-black text-white">{value}</h4>
    </div>
  </div>
);

export default AnnotatorStatistics;