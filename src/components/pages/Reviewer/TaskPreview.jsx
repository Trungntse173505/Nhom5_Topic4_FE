import React from 'react';
import { FileText, Headphones, Image as ImageIcon } from 'lucide-react';
import KonvaPreview from './KonvaPreview';

const TypeBadge = ({ type }) => {
  const base = 'px-2.5 py-1 rounded-full text-[11px] font-bold border';
  if (type === 'audio') return <span className={`${base} bg-amber-500/15 text-amber-300 border-amber-500/30`}>Audio</span>;
  if (type === 'text') return <span className={`${base} bg-indigo-500/15 text-indigo-300 border-indigo-500/30`}>Text</span>;
  return <span className={`${base} bg-green-500/15 text-green-300 border-green-500/30`}>Image</span>;
};

const TaskPreview = ({ task, classColor }) => {
  const type = task?.type || 'image';
  const icon =
    type === 'audio' ? <Headphones size={18} className="text-amber-300" /> : type === 'text' ? <FileText size={18} className="text-indigo-300" /> : <ImageIcon size={18} className="text-green-300" />;

  return (
    <div className="rounded-2xl border border-slate-700 bg-[#0f172a]/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          {icon}
          Annotated Preview
        </p>
        <TypeBadge type={type} />
      </div>

      {type === 'image' && (
        <div className="mt-3 h-[420px]">
          <KonvaPreview task={task} classColor={classColor} />
        </div>
      )}

      {type === 'audio' && (
        <div className="mt-3">
          {task.audioUrl ? (
            <audio controls className="w-full">
              <source src={task.audioUrl} />
            </audio>
          ) : (
            <div className="rounded-2xl border border-slate-700 bg-[#0b1220] p-4 text-sm text-slate-300">
              Không có file audio demo trong project. (UI đã sẵn sàng cho audio.)
            </div>
          )}

          {task.transcript && (
            <div className="mt-3 rounded-2xl border border-slate-700 bg-[#0b1220] p-4">
              <p className="text-xs text-slate-400 font-semibold">Transcript</p>
              <p className="text-sm text-slate-200 mt-2 whitespace-pre-wrap leading-relaxed">{task.transcript}</p>
            </div>
          )}

          {Array.isArray(task.audioAnnotations) && task.audioAnnotations.length > 0 && (
            <div className="mt-3 rounded-2xl border border-slate-700 bg-[#0b1220] p-4">
              <p className="text-xs text-slate-400 font-semibold">Annotations</p>
              <div className="mt-2 space-y-2">
                {task.audioAnnotations.map((a, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-200 font-semibold">{a.label}</span>
                    <span className="text-xs text-slate-400">
                      {a.start}s → {a.end}s
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {type === 'text' && (
        <div className="mt-3">
          <div className="rounded-2xl border border-slate-700 bg-[#0b1220] p-4">
            <p className="text-xs text-slate-400 font-semibold">Content</p>
            <p className="text-sm text-slate-200 mt-2 whitespace-pre-wrap leading-relaxed">{task.textContent || '—'}</p>
          </div>

          {Array.isArray(task.textAnnotations) && task.textAnnotations.length > 0 && (
            <div className="mt-3 rounded-2xl border border-slate-700 bg-[#0b1220] p-4">
              <p className="text-xs text-slate-400 font-semibold">Annotations</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {task.textAnnotations.map((a, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-indigo-500/15 text-indigo-200 border-indigo-500/30"
                    title={a.value}
                  >
                    {a.label}: {a.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskPreview;

