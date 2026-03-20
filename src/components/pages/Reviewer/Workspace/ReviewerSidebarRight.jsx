import React, { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  FileImage,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReviewerSidebarRight = ({
  taskId,
  items = [],
  currentItem,
  toggleAnnotationApproval,
  approveTask,
  rejectTask,
  isProcessing,
  activeBoxId,
  setActiveBoxId,
}) => {
  const navigate = useNavigate();

  // STATE: Lưu lý do từ chối
  const [taskComment, setTaskComment] = useState("");

  // 1. HÀM DUYỆT TASK
  const handleApprove = async () => {
    let hasUnevaluated = false;
    let hasRejectedBox = false;

    items.forEach((item) => {
      item.annotations?.forEach((ann) => {
        if (ann.isApproved === null || ann.isApproved === undefined) {
          hasUnevaluated = true;
        }
        if (ann.isApproved === false) {
          hasRejectedBox = true;
        }
      });
    });

    if (hasUnevaluated) {
      return alert(
        "⚠️ Bạn phải chấm [Đúng/Lỗi] cho TẤT CẢ các vùng trên TẤT CẢ các file trước khi Duyệt Task!"
      );
    }

    if (hasRejectedBox) {
      return alert(
        "⚠️ Lỗi Logic: Task này đang có nhãn bị đánh 'Lỗi'. Bạn không thể Duyệt, vui lòng bấm TRẢ VỀ!"
      );
    }

    if (!window.confirm("Bạn có chắc chắn muốn DUYỆT toàn bộ task này?"))
      return;

    const res = await approveTask(taskId);
    if (res.success) {
      alert("✅ Thành công: Đã duyệt Task");
      navigate("/reviewer");
    } else alert("❌ Lỗi duyệt: " + res.error);
  };

  // 2. HÀM TRẢ VỀ
  const handleReject = async () => {
    let hasRejectedBox = false;
    items.forEach((item) => {
      if (item.annotations?.some((ann) => ann.isApproved === false)) {
        hasRejectedBox = true;
      }
    });

    if (!hasRejectedBox) {
      return alert(
        "⚠️ Vui lòng đánh dấu 'Lỗi' cho ít nhất một vùng trước khi Trả về!"
      );
    }

    if (taskComment.trim() === "") {
      return alert("⚠️ Bạn phải nhập lý do từ chối vào ô nhận xét bên dưới!");
    }

    if (!window.confirm("Trả task về bắt làm lại?")) return;

    const finalFeedback = {
      comment: taskComment.trim(),
      errorRegion: "Nhiều vùng", // Backend cần biến này
    };

    const res = await rejectTask(taskId, finalFeedback);
    if (res.success) {
      alert("✅ Thành công: Đã trả Task về cho Annotator sửa");
      navigate("/reviewer");
    } else alert("❌ Lỗi từ chối: " + res.error);
  };

  return (
    <aside className="w-80 border-l border-slate-800 bg-[#0f172a] flex flex-col shrink-0 text-left">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1e293b]">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <FileImage size={16} /> File đang xem
        </h3>
        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full font-bold">
          {currentItem?.annotations?.length || 0} Box
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {(!currentItem?.annotations || currentItem.annotations.length === 0) && (
          <div className="text-sm text-slate-500 italic text-center p-6 border border-dashed border-slate-700 rounded-xl">
            Không có nhãn nào trên file này.
          </div>
        )}

        {currentItem?.annotations?.map((ann) => {
          const isApproved = ann.isApproved;
          const isTextAnnotation = ann.field && ann.field !== "BoundingBox";
          const displayLabel = isTextAnnotation
            ? ann.field || ann.label || "Nhãn"
            : ann.content || ann.label || "Nhãn";
          const previewText = isTextAnnotation ? ann.content : "";

          return (
            <div
              key={ann.idDetail}
              className="p-3 rounded-xl border flex flex-col gap-3 transition-all duration-200 bg-[#1e293b] border-slate-700"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white">
                  {displayLabel}
                </span>
                {isApproved === true && (
                  <span className="text-xs font-bold text-emerald-400">Đã chấm: Đúng</span>
                )}
                {isApproved === false && (
                  <span className="text-xs font-bold text-rose-400">Đã chấm: Lỗi</span>
                )}
              </div>

              {previewText && (
                <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">
                  {previewText}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAnnotationApproval(ann.idDetail, true);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold transition-colors ${
                    isApproved === true
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-slate-800 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400"
                  }`}
                >
                  <CheckCircle size={14} /> Đúng
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAnnotationApproval(ann.idDetail, false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold transition-colors ${
                    isApproved === false
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                      : "bg-slate-800 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                  }`}
                >
                  <XCircle size={14} /> Lỗi
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* KHU VỰC CHỐT HẠ: COMMENT & NÚT BẤM */}
      <div className="p-4 border-t border-slate-800 bg-[#1e293b] flex flex-col gap-3">
        {/* Ô NHẬP LÝ DO TỔNG */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
            <AlertCircle size={14} /> Lý do trả về
          </label>
          <textarea
            value={taskComment}
            onChange={(e) => setTaskComment(e.target.value)}
            placeholder="Bắt buộc nhập nếu từ chối..."
            rows={2}
            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-rose-500 outline-none transition-colors resize-none placeholder:text-slate-600 custom-scrollbar"
          ></textarea>
        </div>

        {/* 2 NÚT ACTION */}
        <div className="flex gap-2 mt-1">
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
            <ThumbsDown size={18} /> Trả Về
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ReviewerSidebarRight;
