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
}) => {
  const navigate = useNavigate();
  const [taskComment, setTaskComment] = useState("");

  // 👉 BỘ NHỚ TẠM (OPTIMISTIC UI): Lưu trạng thái tức thời để giao diện đổi màu ngay lập tức
  const [optimisticStatus, setOptimisticStatus] = useState({});

  // Tham chiếu đến danh sách container để tự động cuộn
  const listRef = useRef(null);

  // ĐỒNG BỘ: Mỗi khi đổi ảnh hoặc load trang, lấy trạng thái từ backend đổ vào bộ nhớ tạm
  // YÊU CẦU: "tự chấm lỗi trước" -> Mặc định gán false (Lỗi) nếu chưa có trạng thái
  useEffect(() => {
    if (currentItem?.annotations && currentItem.annotations.length > 0) {
      console.log("=== THÔNG TIN ANNOTATIONS CỦA FILE HIỆN TẠI ===", currentItem.annotations);
      const initialStatus = {};
      currentItem.annotations.forEach((ann) => {
        const uniqueId = ann.idDetail || ann.id || ann.annotationId; // Fallback các id có thể có
        if (!uniqueId) return;

        const parsedStatus = parseBoolean(ann.isApproved);
        console.log(`Nhãn ${uniqueId}: isApproved =`, ann.isApproved, "-> Parsed:", parsedStatus);
        
        if (parsedStatus !== null) {
          // Xử lý string "false" / "true" từ API C#
          initialStatus[uniqueId] = parsedStatus;
        } else {
          // BẮT BUỘC: Nếu null/undefined (chưa chấm) thì ép về Lỗi (false) theo yêu cầu User
          initialStatus[uniqueId] = false; 
        }
      });
      // eslint-disable-next-line
      setOptimisticStatus(initialStatus);
    } else {
      // eslint-disable-next-line
      setOptimisticStatus({});
    }
  }, [currentItem]);

  // TỰ ĐỘNG CUỘN ĐẾN BOX ĐANG ĐƯỢC CHỌN (ACTIVATED)
  useEffect(() => {
    if (activeBoxId && listRef.current) {
      const element = document.getElementById(`ann-${activeBoxId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeBoxId]);

  // =====================================================================
  // HÀM 1: BẤM NÚT LẺ TỪNG NHÃN (Chạy ngầm API)
  // =====================================================================
  const handleSingleToggle = (idDetail, status, e) => {
    e.stopPropagation();

    // 1. Cập nhật giao diện tức thì
    setOptimisticStatus((prev) => ({ ...prev, [idDetail]: status }));

    // 2. Chạy ngầm API (Fire and Forget)
    toggleAnnotationApproval(idDetail, status).catch(() => {
      // Lỡ xui API chết thì lùi lại trạng thái cũ
      setOptimisticStatus((prev) => {
        const rollback = { ...prev };
        delete rollback[idDetail];
        return rollback;
      });
    });
  };

  // =====================================================================
  // HÀM 2: DUYỆT NHANH TẤT CẢ NHÃN TRONG FILE HIỆN TẠI (Chạy ngầm API)
  // =====================================================================
  const handleApproveAllInCurrentItem = () => {
    if (!currentItem?.annotations || currentItem.annotations.length === 0) {
      return alert("File này không có nhãn nào để duyệt!");
    }

    // Tìm những nhãn chưa chấm hoặc đang chấm lỗi (dựa vào trạng thái ảo + trạng thái thật)
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

    // 1. Cập nhật giao diện TỨC THÌ cho toàn bộ nhãn
    const newStatus = { ...optimisticStatus };
    pendingAnnotations.forEach((ann) => {
      newStatus[ann.idDetail] = true;
    });
    setOptimisticStatus(newStatus);

    // 2. Bắn liên thanh API ngầm (Không dùng await để không bắt UI chờ)
    pendingAnnotations.forEach((ann) => {
      toggleAnnotationApproval(ann.idDetail, true).catch(() => {
        // Rollback nếu có lỗi mạng
        setOptimisticStatus((prev) => {
          const rollback = { ...prev };
          delete rollback[ann.idDetail];
          return rollback;
        });
      });
    });
  };

  // =====================================================================
  // HÀM 3: DUYỆT TASK TỔNG
  // =====================================================================
  const handleApprove = async () => {
    let hasUnevaluated = false;
    let hasRejectedBox = false;

    // Check dựa trên cả trạng thái ảo (vừa bấm xong) để đảm bảo chuẩn xác
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

  // =====================================================================
  // HÀM 4: TRẢ VỀ TASK TỔNG
  // =====================================================================
  const handleReject = async () => {
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
      {/* HEADER CÓ NÚT DUYỆT NHANH */}
      <div className="p-4 border-b border-slate-800 flex flex-col gap-3 bg-[#1e293b]">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FileImage size={16} /> File đang xem
          </h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full font-bold">
            {currentItem?.annotations?.length || 0} Box
          </span>
        </div>

        {/* 👉 NÚT DUYỆT NHANH TẤT CẢ NHÃN */}
        {currentItem?.annotations?.length > 0 && (
          <button
            onClick={handleApproveAllInCurrentItem}
            className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all active:scale-95"
          >
            <CheckCheck size={16} /> Duyệt nhanh File này
          </button>
        )}
      </div>

      {/* DANH SÁCH NHÃN */}
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
          const uniqueId = ann.idDetail || ann.id || ann.annotationId; // Fallback các id có thể có
          
          // 👉 Trạng thái cuối cùng đã được sanitize qua boolean chuẩn
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
              onClick={() => setActiveBoxId(uniqueId)} // Ấn vào thẻ list cũng sẽ chọn box trên ảnh
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

        {/* 2 NÚT ACTION TỔNG */}
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
    </aside>
  );
};

export default ReviewerSidebarRight;
