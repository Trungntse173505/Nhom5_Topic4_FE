import React from 'react';
import { ChevronDown, Filter, Flag, Search } from 'lucide-react';
import TaskCard from './TaskCard';

const QueuePanel = ({
  tab,
  setTab,
  actionsToday,
  dailyQuota,
  projects,
  projectFilter,
  setProjectFilter,
  statusFilter,
  setStatusFilter,
  query,
  setQuery,
  listTasks,
  selectedId,
  setSelectedId,
  formatDateTime,
}) => {
  return (
    <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-[#0f172a] text-slate-300 border border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setTab('reviewed')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === 'reviewed'
                ? 'bg-blue-600 text-white'
                : 'bg-[#0f172a] text-slate-300 border border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            Reviewed
          </button>
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          {actionsToday}/{dailyQuota} quota
        </div>
      </div>

      <div className="p-4 border-b border-slate-700">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-400 font-semibold flex items-center gap-2 mb-1.5">
              <Filter size={14} className="text-blue-300" />
              Dự án
            </label>
            <div className="relative">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/60 appearance-none"
              >
                {projects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-xs text-slate-400 font-semibold flex items-center gap-2 mb-1.5">
              <Flag size={14} className="text-amber-300" />
              Trạng thái
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/60 appearance-none"
              >
                <option value="All">All</option>
                {tab === 'pending' ? (
                  <>
                    <option value="Pending">Pending</option>
                    <option value="Disputed">Disputed</option>
                  </>
                ) : (
                  <>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </>
                )}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="mt-3 relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo task/project/annotator..."
            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/60"
          />
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[720px] overflow-auto">
        {listTasks.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-[#0f172a]/40 p-6 text-center">
            <p className="text-sm text-slate-300 font-semibold">Không có task phù hợp bộ lọc</p>
            <p className="text-xs text-slate-500 mt-1">Hãy thử đổi dự án/trạng thái hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          listTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              selected={t.id === selectedId}
              onSelect={() => setSelectedId(t.id)}
              formatDateTime={formatDateTime}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default QueuePanel;

