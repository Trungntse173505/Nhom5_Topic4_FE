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
  currentItem,
  toggleAnnotationApproval,
  approveTask,
  rejectTask,
  isProcessing,
  activeBoxId,
  setActiveBoxId,
}) => {
  const navigate = useNavigate();

  // STATE MỚI: Lưu trữ lý do lỗi của TỪNG BOX (key là idDetail, value là nội dung lỗi)
  const [boxFeedbacks, setBoxFeedbacks] = useState({});

  const handleFeedbackChange = (idDetail, text) => {
    setBoxFeedbacks((prev) => ({
      ...prev,
      [idDetail]: text,
    }));
  };

  const handleApprove = async () => {
    if (!window.confirm("Duyệt toàn bộ task này?")) return;
    const res = await approveTask(taskId);
    if (res.success) {
      alert("✅ Thành công: " + res.data);
      navigate("/reviewer");
    } else alert("❌ Lỗi: " + res.error);
  };

  const handleReject = async () => {
    // Thu thập tất cả các box bị đánh "Lỗi" (isApproved === false)
    const rejectedBoxes =
      currentItem?.annotations?.filter((a) => a.isApproved === false) || [];

    if (rejectedBoxes.length === 0) {
      return alert(
        "Vui lòng đánh dấu 'Lỗi' cho ít nhất một vùng trước khi Trả về!",
      );
    }

    // Kiểm tra xem các box bị lỗi đã được nhập lý do chưa
    const missingFeedback = rejectedBoxes.some(
      (box) => !boxFeedbacks[box.idDetail]?.trim(),
    );
    if (missingFeedback) {
      return alert(
        "Vui lòng nhập lý do chi tiết cho TẤT CẢ các vùng bị đánh dấu Lỗi!",
      );
    }

    if (!window.confirm("Trả task về bắt làm lại?")) return;

    // GOM DATA ĐỂ GỬI BE: Gom các lỗi thành một chuỗi hoặc mảng tùy Backend yêu cầu
    // Ở đây tui đang gom thành một đoạn text tổng hợp dễ đọc: "Vùng: [Tên nhãn] - Lỗi: [Lý do]"
    const compiledComment = rejectedBoxes
      .map(
        (box) =>
          `[${box.content || "Chưa có nhãn"}]: ${boxFeedbacks[box.idDetail]}`,
      )
      .join(" | ");

    const finalFeedback = {
      errorRegion: "Nhiều vùng (Xem chi tiết)", // Sếp có thể tùy chỉnh
      comment: compiledComment,
    };

    const res = await rejectTask(taskId, finalFeedback);
    if (res.success) {
      alert("✅ Thành công: " + res.data);
      navigate("/reviewer");
    } else alert("❌ Lỗi: " + res.error);
  };

  return (
    <aside className="w-80 border-l border-slate-800 bg-[#0f172a] flex flex-col shrink-0 text-left">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1e293b]">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Chi tiết Ảnh Hiện Tại
        </h3>
        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full font-bold">
          {currentItem?.annotations?.length || 0} Box
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {currentItem?.annotations?.length === 0 && (
          <div className="text-sm text-slate-500 italic text-center p-6 border border-dashed border-slate-700 rounded-xl">
            Chưa có object nào được vẽ trên ảnh này.
          </div>
        )}

        {currentItem?.annotations?.map((ann) => {
          const isActive = activeBoxId === ann.idDetail;
          // Box này có đang bị đánh dấu Lỗi (false) không?
          const isRejected = ann.isApproved === false;

          return (
            <div
              key={ann.idDetail}
              onClick={() => setActiveBoxId(ann.idDetail)}
              className={`p-3 rounded-xl border flex flex-col gap-3 cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                  : "bg-[#1e293b] border-slate-700 hover:border-slate-500"
              }`}
            >
              {/* Tiêu đề Box */}
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

              {/* Nút Đúng / Lỗi */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAnnotationApproval(ann.idDetail, false);
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
                    toggleAnnotationApproval(ann.idDetail, true);
                    // Tự động focus vào ô nhập lý do (nếu cần thiết có thể thêm logic useRef)
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

              {/* Ô NHẬP LÝ DO (CHỈ HIỆN KHI BỊ ĐÁNH DẤU LỖI) */}
              {isRejected && (
                <div
                  className="mt-1 animate-in slide-in-from-top-2 fade-in duration-200"
                  onClick={(e) => e.stopPropagation()} // Ngăn click vào input làm kích hoạt chọn box
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

      {/* KHU VỰC NÚT ACTION TỔNG (Duyệt / Trả về) */}
      <div className="p-4 border-t border-slate-800 bg-[#1e293b]">
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
          >
            <ThumbsUp size={18} /> Duyệt Ảnh Này
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
