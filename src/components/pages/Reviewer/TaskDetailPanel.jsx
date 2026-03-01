import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Flag,
  MessageSquareText,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import TaskPreview from './TaskPreview';

const TaskDetailPanel = ({
  selectedTask,
  listTasks,
  setSelectedId,
  formatDateTime,
  classColor,
  qcCriteria,
  qcState,
  updateQc,
  allQcChecked,
  rejectTemplates,
  rejectMode,
  setRejectMode,
  rejectNote,
  setRejectNote,
  handleApprove,
  handleReject,
  quotaReached,
}) => {
  if (!selectedTask) {
    return (
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-8 text-center text-slate-400">
        Chọn một task để xem chi tiết.
      </div>
    );
  }

  const idx = listTasks.findIndex((t) => t.id === selectedTask.id);
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < listTasks.length - 1;

  return (
    <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Task Detail</p>
            <h2 className="text-xl font-bold text-white truncate">{selectedTask.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded-full bg-slate-900/40 border border-slate-700">{selectedTask.id}</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-900/40 border border-slate-700">{selectedTask.project}</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-900/40 border border-slate-700">
                Annotator: <span className="text-slate-200 font-semibold">{selectedTask.annotator}</span>
              </span>
              {selectedTask.disputed && selectedTask.status === 'pending' && (
                <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 font-bold flex items-center gap-1.5">
                  <Flag size={14} /> Disputed
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const prev = hasPrev ? listTasks[idx - 1] : null;
                if (prev) setSelectedId(prev.id);
              }}
              className="p-2 rounded-xl bg-slate-900/40 border border-slate-700 hover:border-slate-600 text-slate-200 disabled:opacity-40"
              disabled={!hasPrev}
              aria-label="Previous task"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => {
                const next = hasNext ? listTasks[idx + 1] : null;
                if (next) setSelectedId(next.id);
              }}
              className="p-2 rounded-xl bg-slate-900/40 border border-slate-700 hover:border-slate-600 text-slate-200 disabled:opacity-40"
              disabled={!hasNext}
              aria-label="Next task"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="rounded-2xl border border-slate-700 bg-[#0f172a]/40 p-4">
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquareText size={18} className="text-amber-300" />
            Guideline
          </p>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">{selectedTask.guideline}</p>
          <p className="text-[11px] text-slate-500 mt-2">
            Submitted: {formatDateTime(selectedTask.submittedAt)}
            {selectedTask.reviewedAt ? ` • Reviewed: ${formatDateTime(selectedTask.reviewedAt)}` : ''}
          </p>
        </div>

        {selectedTask.status === 'rejected' && selectedTask.rejectNote && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <ThumbsDown size={18} className="text-rose-300" />
              Lý do Reject đã gửi
            </p>
            <p className="text-xs text-slate-200 mt-2 leading-relaxed">{selectedTask.rejectNote}</p>
          </div>
        )}

        <TaskPreview task={selectedTask} classColor={classColor} />

        <div className="rounded-2xl border border-slate-700 bg-[#0f172a]/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <ClipboardCheck size={18} className="text-green-300" />
                Quality checklist
              </p>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  allQcChecked
                    ? 'bg-green-500/15 text-green-300 border-green-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                {allQcChecked ? 'Ready to approve' : 'Needs review'}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {qcCriteria.map((c) => {
                const checked = Boolean(qcState[selectedTask.id]?.[c.key]);
                return (
                  <label
                    key={c.key}
                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-slate-900/40 border-slate-700 hover:border-slate-600'
                        : 'bg-amber-500/10 border-amber-500/25 hover:border-amber-500/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => updateQc(c.key, e.target.checked)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm text-slate-200">{c.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {selectedTask.status === 'pending' && rejectMode && (
            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <MessageSquareText size={18} className="text-rose-300" />
                Feedback bắt buộc khi Reject
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {rejectTemplates.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setRejectNote(t.value)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/40 border border-slate-700 hover:border-slate-600 text-slate-200"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Nhập lý do reject chi tiết..."
                className="mt-3 w-full min-h-[96px] bg-[#0f172a] border border-slate-700 rounded-2xl p-3 text-sm text-slate-200 outline-none focus:border-rose-500/60"
              />
              <p className="text-[11px] text-slate-400 mt-2">
                Gợi ý: nêu rõ lỗi (class/vùng/thiếu object) và cách sửa để Annotator chỉnh nhanh.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-700 bg-[#0f172a]/40 p-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <button
                onClick={handleApprove}
                disabled={selectedTask.status !== 'pending' || quotaReached}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-white transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
              >
                <ThumbsUp size={18} />
                Approve
              </button>

              <button
                onClick={handleReject}
                disabled={selectedTask.status !== 'pending' || quotaReached}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-white transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                  rejectMode ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' : 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                }`}
              >
                <ThumbsDown size={18} />
                {rejectMode ? 'Confirm Reject' : 'Reject'}
              </button>
            </div>

            <div className="mt-3 flex items-start gap-2 text-xs text-slate-400">
              <CircleAlert size={14} className="text-slate-500 mt-0.5" />
              <p className="leading-relaxed">
                Approve yêu cầu checklist QC đầy đủ. Reject yêu cầu feedback chi tiết. Task Disputed nên được ưu tiên kiểm tra kỹ.
              </p>
            </div>
          </div>

          {selectedTask.status === 'pending' && (
            <div className="text-xs text-slate-400">
              <button
                onClick={() => setRejectMode(false)}
                className="hover:text-white transition-colors underline underline-offset-4"
                disabled={!rejectMode}
              >
                Hủy chế độ Reject
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default TaskDetailPanel;
