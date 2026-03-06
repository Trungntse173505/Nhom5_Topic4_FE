import React from 'react';
import { Clock, FileText, Flag, Headphones, Image as ImageIcon, Shield } from 'lucide-react';

const TaskCard = ({ task, selected, onSelect, formatDateTime }) => {
  const typeIcon =
    task.type === 'audio' ? (
      <Headphones size={16} className="text-amber-300" />
    ) : task.type === 'text' ? (
      <FileText size={16} className="text-indigo-300" />
    ) : (
      <ImageIcon size={16} className="text-green-300" />
    );

  const statusBadge =
    task.status === 'pending'
      ? task.disputed
        ? 'bg-red-500/15 text-red-300 border-red-500/30'
        : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
      : task.status === 'approved'
        ? 'bg-green-500/15 text-green-300 border-green-500/30'
        : 'bg-rose-500/15 text-rose-300 border-rose-500/30';

  const statusLabel =
    task.status === 'pending'
      ? task.disputed
        ? 'Disputed'
        : 'Pending'
      : task.status === 'approved'
        ? 'Approved'
        : 'Rejected';

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border transition-all ${
        selected
          ? 'bg-slate-800/60 border-blue-500/40 shadow-lg shadow-blue-500/10'
          : 'bg-[#0f172a]/40 border-slate-700 hover:bg-slate-800/40 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate flex items-center gap-2">
            {typeIcon}
            {task.name}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {task.id} • {task.project}
          </p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge}`}>
          {statusLabel}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 min-w-0">
          <Shield size={14} className="text-slate-500 shrink-0" />
          <span className="truncate">Annotator: {task.annotator}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
          <Clock size={14} className="text-slate-500" />
          <span>{formatDateTime(task.submittedAt)}</span>
        </div>
      </div>

      {task.status === 'pending' && task.disputed && (
        <div className="mt-3 text-[11px] text-red-300 font-semibold flex items-center gap-1.5">
          <Flag size={14} /> Có khiếu nại
        </div>
      )}
    </button>
  );
};

export default TaskCard;
