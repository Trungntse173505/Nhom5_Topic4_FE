import React from 'react';
import { Eye, Clock, Timer, Flame, ShieldCheck, Trophy, Star, Loader2 } from 'lucide-react';
import { useReviewerStats } from '../../../hooks/Reviewer/useReviewerStats';

const ReviewerStatistics = () => {
  const { stats, loading, error } = useReviewerStats();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a] text-blue-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a] text-rose-500">
        <div className="text-center">
           <p className="text-xl font-bold">⚠️ Có lỗi xảy ra</p>
           <p className="text-slate-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Map data từ API BE trả về (Đã khớp hoàn toàn các key)
  const safeStats = {
    totalReviewedTasks: stats?.totalReviewedTasks || 0,
    totalReviewHours: Number(stats?.totalReviewHours || 0).toFixed(1), // Làm tròn 1 chữ số thập phân
    avgReviewHours: Number(stats?.avgReviewHours || 0).toFixed(2),
    disputedTasksStreak: stats?.disputedTasksStreak || 0,
    currentPerfectRejectStreak: stats?.currentPerfectRejectStreak || 0,
    experience: stats?.experience || 0,
    reputationPoints: stats?.reputationPoints || 0
  };

  return (
    <div className="p-8 min-h-screen bg-[#0f172a] text-slate-200">
      <div className="mb-10">
        <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight text-white uppercase">
          <Eye className="text-blue-500" size={36} />
          Hiệu Suất Review
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Tổng quan về tốc độ duyệt bài và độ chính xác của bạn từ Database.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<Eye size={24} className="text-blue-400" />} title="Tổng Task Đã Duyệt" value={safeStats.totalReviewedTasks} bgClass="bg-blue-500/10" />
        <StatCard icon={<Clock size={24} className="text-purple-400" />} title="Tổng Giờ Duyệt" value={`${safeStats.totalReviewHours}h`} bgClass="bg-purple-500/10" />
        <StatCard icon={<Timer size={24} className="text-emerald-400" />} title="Tốc Độ TB / Task" value={`${safeStats.avgReviewHours}h`} bgClass="bg-emerald-500/10" />
        <StatCard icon={<ShieldCheck size={24} className="text-green-400" />} title="Chuỗi Bắt Lỗi Đúng" value={`${safeStats.currentPerfectRejectStreak} Lần`} bgClass="bg-green-500/10" />
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

export default ReviewerStatistics;