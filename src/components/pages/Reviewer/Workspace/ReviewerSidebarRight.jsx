import React, { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  MessageSquareWarning,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReviewerSidebarRight = ({
  taskId,
  items = [],
  onSelectIndex,
  currentItem,
  toggleAnnotationApproval,
  approveTask,
  rejectTask,
  isProcessing,
  activeBoxId,
  setActiveBoxId,
}) => {
  const navigate = useNavigate();
  const [boxFeedbacks, setBoxFeedbacks] = useState({});

  const handleFeedbackChange = (idDetail, text) => {
    setBoxFeedbacks((prev) => ({
      ...prev,
      [idDetail]: text,
    }));
  };

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
      alert("✅ Thành công: " + (res.data || "Đã duyệt Task"));
      navigate("/reviewer");
    } else alert("❌ Lỗi duyệt: " + res.error);
  };

  const handleReject = async () => {
    const allRejectedBoxes = [];
    items.forEach((item, index) => {
      item.annotations?.forEach((ann) => {
        if (ann.isApproved === false) {
          allRejectedBoxes.push({
            ...ann,
            fileIndex: index + 1,
            fileName: item.fileName || `File ${index + 1}`,
          });
        }
      });
    });

    if (allRejectedBoxes.length === 0) {
      return alert(
        "Vui lòng đánh dấu 'Lỗi' cho ít nhất một vùng trước khi Trả về!",
      );
    }

    const missingFeedback = allRejectedBoxes.some(
      (box) => !boxFeedbacks[box.idDetail]?.trim(),
    );
    if (missingFeedback) {
      return alert(
        "Vui lòng nhập lý do chi tiết cho TẤT CẢ các vùng bị đánh dấu Lỗi!",
      );
    }

    if (!window.confirm("Bạn muốn trả task này về cho Annotator làm lại?"))
      return;

    const compiledComment = allRejectedBoxes
      .map(
        (box) =>
          `[${box.fileName} - ${box.content || "Chưa có nhãn"}]: ${boxFeedbacks[box.idDetail]}`,
      )
      .join(" | ");

    const finalFeedback = {
      errorRegion: "Nhiều vùng",
      comment: compiledComment,
    };

    const res = await rejectTask(taskId, finalFeedback);
    if (res.success) {
      alert("✅ Thành công: " + (res.data || "Đã trả Task về"));
      navigate("/reviewer");
    } else alert("❌ Lỗi từ chối: " + res.error);
  };

  const totalBoxes = items.reduce(
    (total, item) => total + (item.annotations?.length || 0),
    0,
  );

  return (
    <aside className="w-80 border-l border-slate-800 bg-[#0f172a] flex flex-col shrink-0 text-left">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1e293b]">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Chi tiết Toàn bộ Task
        </h3>
        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full font-bold">
          {totalBoxes} Box
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 custom-scrollbar">
        {items.length === 0 && (
          <div className="text-sm text-slate-500 italic text-center p-6 border border-dashed border-slate-700 rounded-xl">
            Không có dữ liệu nào trong Task này.
          </div>
        )}

        {items.map((item, index) => {
          const isCurrentFile = currentItem && currentItem === item;

          return (
            <div key={index} className="flex flex-col gap-3">
              <div
                className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  isCurrentFile
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
                onClick={() => onSelectIndex && onSelectIndex(index)}
              >
                <span className="text-xs font-bold truncate pr-2">
                  File {index + 1}: {item.fileName || `No_name_${index + 1}`}
                </span>
                {isCurrentFile && (
                  <span className="text-[10px] uppercase font-bold shrink-0">
                    Đang xem
                  </span>
                )}
              </div>

              {item.annotations?.map((ann) => {
                const isActive = activeBoxId === ann.idDetail;
                const isRejected = ann.isApproved === false;

                return (
                  <div
                    key={ann.idDetail}
                    onClick={() => {
                      if (!isCurrentFile && onSelectIndex) onSelectIndex(index);
                      setActiveBoxId(ann.idDetail);
                    }}
                    className={`p-3 rounded-xl border flex flex-col gap-3 cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                        : "bg-[#1e293b] border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-sm font-bold ${isActive ? "text-blue-400" : "text-white"}`}
                      >
                        {ann.content || "Chưa có nhãn"}
                      </span>
                      {isRejected && (
                        <MessageSquareWarning
                          size={14}
                          className="text-rose-500 animate-pulse"
                        />
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isCurrentFile && onSelectIndex)
                            onSelectIndex(index);

                          // TRUYỀN THẲNG TRUE (ĐÚNG)
                          toggleAnnotationApproval(ann.idDetail, true);
                        }}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold transition-colors ${
                          ann.isApproved === true
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                            : "bg-slate-800 text-slate-400 hover:bg-green-500/20 hover:text-green-400"
                        }`}
                      >
                        <CheckCircle size={14} /> Đúng
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isCurrentFile && onSelectIndex)
                            onSelectIndex(index);

                          // TRUYỀN THẲNG FALSE (LỖI)
                          toggleAnnotationApproval(ann.idDetail, false);
                        }}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold transition-colors ${
                          isRejected
                            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                            : "bg-slate-800 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                        }`}
                      >
                        <XCircle size={14} /> Lỗi
                      </button>
                    </div>

                    {isRejected && (
                      <div
                        className="mt-1 animate-in slide-in-from-top-2 fade-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          placeholder="Nhập lý do lỗi cho vùng này..."
                          className="w-full bg-[#0f172a] border border-rose-500/50 rounded-lg p-2 text-xs text-white focus:border-rose-500 outline-none transition-colors"
                          value={boxFeedbacks[ann.idDetail] || ""}
                          onChange={(e) =>
                            handleFeedbackChange(ann.idDetail, e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 bg-[#1e293b]">
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
          >
            <ThumbsUp size={18} /> Duyệt Toàn Bộ
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
