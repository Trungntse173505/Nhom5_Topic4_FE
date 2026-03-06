import React from 'react';
import { BadgeCheck, CircleAlert, Flag, XCircle } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const color =
    toast.type === 'danger'
      ? 'border-red-500/40 bg-red-500/10'
      : toast.type === 'success'
        ? 'border-green-500/40 bg-green-500/10'
        : 'border-slate-600 bg-slate-900/60';

  return (
    <div className="fixed top-6 right-6 z-50 w-[360px]">
      <div className={`border ${color} backdrop-blur rounded-2xl shadow-xl p-4`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {toast.type === 'danger' ? (
              <CircleAlert className="text-red-400" size={18} />
            ) : toast.type === 'success' ? (
              <BadgeCheck className="text-green-400" size={18} />
            ) : (
              <Flag className="text-amber-300" size={18} />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{toast.title}</p>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <XCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;

