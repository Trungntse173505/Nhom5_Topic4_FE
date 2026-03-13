import React, { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  MessageSquareWarning,
} from "lucide-react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReviewerSidebarRight = ({ taskId, currentItem, toggleAnnotationApproval, approveTask, rejectTask, isProcessing }) => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({ comment: '', errorRegion: '' });

  // BỔ SUNG: Nhận items từ props (không thay đổi signature hiện có)
  const items = (typeof arguments === "undefined" ? [] : arguments)?.[0]?.items || [];

  // BỔ SUNG: Fix logic đảo đúng/sai (giữ nguyên UI nút bấm hiện có)
  const __toggle = toggleAnnotationApproval;
  if (typeof __toggle === "function") {
    // eslint-disable-next-line no-param-reassign
    toggleAnnotationApproval = (idDetail, targetStatus) =>
      __toggle(idDetail, !targetStatus);
  }

  const handleApprove = async () => {
    let hasUnevaluated = false;
    items.forEach((item) => {
      item.annotations?.forEach((ann) => {
        if (ann.isApproved === null || ann.isApproved === undefined) {
          hasUnevaluated = true;
        }
      });
    });

    if (hasUnevaluated) {
      return alert(
        "⚠️ Lỗi: Bạn phải chấm [Đúng/Lỗi] cho TẤT CẢ các vùng trước khi Duyệt Task!",
      );
    }

    if (!window.confirm("Bạn có chắc chắn muốn DUYỆT toàn bộ task này?"))
      return;

    const res = await approveTask(taskId);
    if (res.success) {
      alert("✅ Thành công: " + res.data);
      navigate('/reviewer/dashboard');
    } else alert("❌ Lỗi: " + res.error);
  };

  const handleReject = async () => {
    if (!feedback.comment) return alert("Vui lòng nhập lý do từ chối!");
    if (!window.confirm("Trả task về bắt làm lại?")) return;
    const res = await rejectTask(taskId, feedback);
    if (res.success) {
      alert("✅ Thành công: " + res.data);
      navigate('/reviewer/dashboard');
    } else alert("❌ Lỗi: " + res.error);
  };

  const totalBoxes = items.reduce(
    (total, item) => total + (item.annotations?.length || 0),
    0,
  );

  // BỔ SUNG: Điều kiện tổng kết để disable Trả Task về khi chưa chấm/không có lỗi
  const __allAnnotations = items.flatMap((it) => it?.annotations || []);
  const __isChecked = (v) => v === true || v === false;
  const canFinalize =
    __allAnnotations.length === 0 ||
    __allAnnotations.every((a) => __isChecked(a?.isApproved));
  const hasAnyWrong = __allAnnotations.some((a) => a?.isApproved === false);

  return (
    <aside className="w-80 border-l border-slate-800 bg-[#0f172a] flex flex-col shrink-0 text-left">
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Chi tiết Ảnh Hiện Tại</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {currentItem?.annotations?.length === 0 && (
          <p className="text-sm text-slate-500 italic text-left">Chưa có object nào được vẽ.</p>
        )}

        {/* Danh sách object trong ảnh hiện tại để click trực tiếp từ menu */}
        {currentItem?.annotations?.map((ann) => (
          <div key={ann.idDetail} className="bg-[#1e293b] p-3 rounded-xl border border-slate-700 flex flex-col gap-2">
            <span className="text-sm font-bold text-white">{ann.content}</span>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAnnotationApproval(ann.idDetail, false)} // Bấm là chuyển thành True
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold transition-colors ${ann.isApproved === true ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-green-500/20 hover:text-green-400'}`}
              >
                <CheckCircle size={14} /> Đúng
              </button>
              <button
                onClick={() => toggleAnnotationApproval(ann.idDetail, true)} // Bấm là chuyển thành False
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold transition-colors ${ann.isApproved === false ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400'}`}
              >
                <XCircle size={14} /> Lỗi
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* KHU VỰC SUBMIT (Luôn nằm dưới cùng) */}
      <div className="p-4 border-t border-slate-800 bg-[#1e293b] flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-left">
          <p className="text-xs font-semibold text-rose-400 flex items-center gap-1"><AlertCircle size={14} /> Nhập lỗi khi Reject</p>
          <input
            type="text" placeholder="Vùng bị lỗi (VD: Ô tô 2)"
            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-rose-500 outline-none"
            value={feedback.errorRegion} onChange={(e) => setFeedback({ ...feedback, errorRegion: e.target.value })}
          />
          <textarea
            placeholder="Lý do chi tiết..." rows="2"
            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-rose-500 outline-none resize-none"
            value={feedback.comment} onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
          >
            <ThumbsUp size={18} /> Duyệt
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-all shadow-lg shadow-rose-500/20"
          >
            <ThumbsDown size={18} /> Trả Task Về
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ReviewerSidebarRight;
