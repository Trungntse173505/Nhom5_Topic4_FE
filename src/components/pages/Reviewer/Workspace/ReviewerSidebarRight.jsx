import React, { useState, useEffect, useRef } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  FileImage,
  AlertCircle,
  CheckCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLabelDisplay } from "../../../../utils/aiHelper";

// Hàm xử lý việc C# thỉnh thoảng trả về "True" / "False" (string) thay vì boolean chuẩn
const parseBoolean = (val) => {
  if (val === true || val === "true" || val === "True" || val === 1) return true;
  if (val === false || val === "false" || val === "False" || val === 0) return false;
  return null;
};

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
  isReadOnly, // 🔥 NHẬN CỜ CHỈ XEM TỪ CHA TRUYỀN XUỐNG
}) => {
  const navigate = useNavigate();
  const [taskComment, setTaskComment] = useState("");

  const [optimisticStatus, setOptimisticStatus] = useState({});
  const listRef = useRef(null);

  useEffect(() => {
    if (currentItem?.annotations && currentItem.annotations.length > 0) {
      console.log("=== THÔNG TIN ANNOTATIONS CỦA FILE HIỆN TẠI ===", currentItem.annotations);
      const initialStatus = {};
      currentItem.annotations.forEach((ann) => {
        const uniqueId = ann.idDetail || ann.id || ann.annotationId; 
        if (!uniqueId) return;

        const parsedStatus = parseBoolean(ann.isApproved);
        console.log(`Nhãn ${uniqueId}: isApproved =`, ann.isApproved, "-> Parsed:", parsedStatus);
        
        if (parsedStatus !== null) {
          initialStatus[uniqueId] = parsedStatus;
        } else {
          initialStatus[uniqueId] = null; 
        }
      });
      // eslint-disable-next-line
      setOptimisticStatus(initialStatus);
    } else {
      // eslint-disable-next-line
      setOptimisticStatus({});
    }
  }, [currentItem]);

  useEffect(() => {
    if (activeBoxId && listRef.current) {
      const element = document.getElementById(`ann-${activeBoxId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeBoxId]);

  const handleSingleToggle = (idDetail, status, e) => {
    e.stopPropagation();
    if (isReadOnly) return; // 🔥 CHẶN CLICK NẾU CHỈ XEM

    setOptimisticStatus((prev) => ({ ...prev, [idDetail]: status }));
    
    // Check thêm catch để tránh lỗi nếu toggleAnnotationApproval là hàm rỗng
    if (typeof toggleAnnotationApproval === 'function') {
        try {
            const promise = toggleAnnotationApproval(idDetail, status);
            if (promise && promise.catch) {
                promise.catch(() => {
                    setOptimisticStatus((prev) => {
                    const rollback = { ...prev };
                    delete rollback[idDetail];
                    return rollback;
                    });
                });
            }
        } catch (error) {
            console.error(error);
        }
    }
  };

  const handleApproveAllInCurrentItem = () => {
    if (isReadOnly) return; // 🔥 CHẶN CLICK

    if (!currentItem?.annotations || currentItem.annotations.length === 0) {
      return alert("File này không có nhãn nào để duyệt!");
    }

    const pendingAnnotations = currentItem.annotations.filter((ann) => {
      const currentStatus =
        optimisticStatus[ann.idDetail] !== undefined
          ? optimisticStatus[ann.idDetail]
          : ann.isApproved;
      return currentStatus !== true;
    });

    if (pendingAnnotations.length === 0) {
      return alert("Tất cả các nhãn trong file này đã được chấm Đúng rồi!");
    }

    const newStatus = { ...optimisticStatus };
    pendingAnnotations.forEach((ann) => {
      newStatus[ann.idDetail] = true;
    });
    setOptimisticStatus(newStatus);

    pendingAnnotations.forEach((ann) => {
      if (typeof toggleAnnotationApproval === 'function') {
          const promise = toggleAnnotationApproval(ann.idDetail, true);
          if (promise && promise.catch) {
              promise.catch(() => {
                setOptimisticStatus((prev) => {
                  const rollback = { ...prev };
                  delete rollback[ann.idDetail];
                  return rollback;
                });
              });
          }
      }
    });
  };

  const handleApprove = async () => {
    if (isReadOnly) return;

    let hasUnevaluated = false;
    let hasRejectedBox = false;

    items.forEach((item) => {
      item.annotations?.forEach((ann) => {
        const finalStatus =
          optimisticStatus[ann.idDetail] !== undefined
            ? optimisticStatus[ann.idDetail]
            : ann.isApproved;

        if (finalStatus === null || finalStatus === undefined) {
          hasUnevaluated = true;
        }
        if (finalStatus === false) {
          hasRejectedBox = true;
        }
      });
    });

    if (hasUnevaluated) {
      return alert(
        "⚠️ Bạn phải chấm [Đúng/Lỗi] cho TẤT CẢ các vùng trên TẤT CẢ các file trước khi Duyệt Task!",
      );
    }

    if (hasRejectedBox) {
      return alert(
        "⚠️ Lỗi Logic: Task này đang có nhãn bị đánh 'Lỗi'. Bạn không thể Duyệt, vui lòng bấm TRẢ VỀ!",
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

  const handleReject = async () => {
    if (isReadOnly) return;

    let hasRejectedBox = false;
    items.forEach((item) => {
      if (
        item.annotations?.some((ann) => {
          const finalStatus =
            optimisticStatus[ann.idDetail] !== undefined
              ? optimisticStatus[ann.idDetail]
              : ann.isApproved;
          return finalStatus === false;
        })
      ) {
        hasRejectedBox = true;
      }
    });

    if (!hasRejectedBox) {
      return alert(
        "⚠️ Vui lòng đánh dấu 'Lỗi' cho ít nhất một vùng trước khi Trả về!",
      );
    }

    if (taskComment.trim() === "") {
      return alert("⚠️ Bạn phải nhập lý do từ chối vào ô nhận xét bên dưới!");
    }

    if (!window.confirm("Trả task về bắt làm lại?")) return;

    const finalFeedback = {
      comment: taskComment.trim(),
      errorRegion: "Nhiều vùng", 
    };

    const res = await rejectTask(taskId, finalFeedback);
    if (res.success) {
      alert("✅ Thành công: Đã trả Task về cho Annotator sửa");
      navigate("/reviewer");
    } else alert("❌ Lỗi từ chối: " + res.error);
  };

  return (
    <aside className="w-80 border-l border-slate-800 bg-[#0f172a] flex flex-col shrink-0 text-left">
      <div className="p-4 border-b border-slate-800 flex flex-col gap-3 bg-[#1e293b]">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FileImage size={16} /> File đang xem
          </h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full font-bold">
            {currentItem?.annotations?.length || 0} Box
          </span>
        </div>

        {/* 🔥 ẨN NÚT DUYỆT NHANH NẾU CHỈ XEM */}
        {!isReadOnly && currentItem?.annotations?.length > 0 && (
          <button
            onClick={handleApproveAllInCurrentItem}
            className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all active:scale-95"
          >
            <CheckCheck size={16} /> Duyệt nhanh File này
          </button>
        )}
      </div>

      <div 
        ref={listRef} 
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar"
      >
        {(!currentItem?.annotations ||
          currentItem.annotations.length === 0) && (
          <div className="text-sm text-slate-500 italic text-center p-6 border border-dashed border-slate-700 rounded-xl">
            Không có nhãn nào trên file này.
          </div>
        )}

        {currentItem?.annotations?.map((ann) => {
          const uniqueId = ann.idDetail || ann.id || ann.annotationId; 
          
          let isApproved = optimisticStatus[uniqueId];
          if (isApproved === undefined) {
            isApproved = parseBoolean(ann.isApproved);
          }

          const isTextAnnotation = ann.field && ann.field !== "BoundingBox";
          const displayLabel = isTextAnnotation
            ? ann.field || ann.label || "Nhãn"
            : ann.content || ann.label || "Nhãn";
          const previewText = isTextAnnotation ? ann.content : "";

          return (
            <div
              id={`ann-${uniqueId}`}
              key={uniqueId}
              onClick={() => setActiveBoxId(uniqueId)} 
              className={`p-3 rounded-xl border flex flex-col gap-3 transition-all duration-300 cursor-pointer ${
                activeBoxId === uniqueId 
                  ? "bg-[#1e293b] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-1 ring-blue-500 scale-[1.02]" 
                  : "bg-[#1e293b]/60 border-slate-700 hover:border-slate-500 hover:bg-[#1e293b]"
              }`}
            >
              <div className="flex justify-between items-center">
                <span
                  className="text-sm font-bold text-white flex items-center gap-2"
                  title={displayLabel}
                >
                  {getLabelDisplay(displayLabel)}
                  <span className="text-[9px] text-slate-600 bg-slate-800 px-1 rounded hidden">#{String(uniqueId).substring(0,4)}</span>
                </span>
                {isApproved === true && (
                  <span className="text-xs font-bold text-emerald-400">
                    Đã chấm: Đúng
                  </span>
                )}
                {isApproved === false && (
                  <span className="text-xs font-bold text-rose-400">
                    Đã chấm: Lỗi
                  </span>
                )}
              </div>

              {previewText && (
                <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">
                  {previewText}
                </p>
              )}

              {/* 🔥 ẨN 2 NÚT ĐÚNG/LỖI NẾU CHỈ XEM */}
              {!isReadOnly && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleSingleToggle(uniqueId, true, e)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold transition-colors ${
                        isApproved === true
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-slate-800 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400"
                      }`}
                    >
                      <CheckCircle size={14} /> Đúng
                    </button>
                    <button
                      onClick={(e) => handleSingleToggle(uniqueId, false, e)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold transition-colors ${
                        isApproved === false
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                          : "bg-slate-800 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                      }`}
                    >
                      <XCircle size={14} /> Lỗi
                    </button>
                  </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 🔥 ẨN KHU VỰC CHỐT HẠ (COMMENT + 2 NÚT TỔNG) NẾU CHỈ XEM */}
      {!isReadOnly && (
          <div className="p-4 border-t border-slate-800 bg-[#1e293b] flex flex-col gap-3">
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

            <div className="flex gap-2 mt-1">
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
              >
                <ThumbsUp size={18} /> Duyệt Task
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
      )}
    </aside>
  );
};

export default ReviewerSidebarRight;