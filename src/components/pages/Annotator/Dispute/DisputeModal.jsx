import React, { useState } from "react";
import { AlertTriangle, X, Send, ImagePlus, Loader2 } from "lucide-react";

const DisputeModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [reason, setReason] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  if (!isOpen) return null;

  // Xử lý khi người dùng chọn ảnh từ máy tính
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 3) {
      alert("Chỉ được tải lên tối đa 3 ảnh bằng chứng!");
      return;
    }
    setSelectedFiles([...selectedFiles, ...files]);
  };

  // Xóa ảnh đã chọn
  const removeFile = (indexToRemove) => {
    setSelectedFiles(
      selectedFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSubmit = () => {
    onSubmit(reason, selectedFiles);
    setReason("");
    setSelectedFiles([]);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setSelectedFiles([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-[#0f172a]/50">
          <div className="flex items-center gap-3 text-amber-500">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-bold text-white">
              Khiếu nại kết quả Review
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-slate-300 mb-4">
            Bạn đang tạo khiếu nại cho ảnh/task này. Vui lòng giải thích rõ lý
            do bạn cho rằng Reviewer đã đánh giá sai. Manager sẽ là người phân
            xử cuối cùng.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg mb-4 text-xs text-amber-400/90 leading-relaxed">
            <strong>Lưu ý hệ thống:</strong> Nếu Manager xác nhận Reviewer đúng,
            bạn sẽ bị phạt <strong>-5 điểm</strong>. Nếu bạn đúng, task sẽ được
            Approved và Reviewer sẽ bị phạt.
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            placeholder="Ví dụ: Tôi đã vẽ sát viền xe theo đúng guideline mục 2.1, Reviewer bảo sai là không hợp lý..."
            className="w-full h-28 bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none mb-3 disabled:opacity-70"
          ></textarea>

          {/* 👉 PHẦN UPLOAD ẢNH BẰNG CHỨNG */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                Ảnh bằng chứng
              </label>

              <label
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${selectedFiles.length >= 3 || isSubmitting ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"}`}
              >
                <ImagePlus size={14} />
                Thêm ảnh
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={selectedFiles.length >= 3 || isSubmitting}
                />
              </label>
            </div>

            {/* Preview Ảnh Nhỏ */}
            {selectedFiles.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-slate-600 bg-black/50 w-16 h-16"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity"
                    />
                    {!isSubmitting && (
                      <button
                        onClick={() => removeFile(idx)}
                        className="absolute inset-0 m-auto w-6 h-6 bg-rose-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-slate-700 bg-[#0f172a]/50">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-amber-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Đang tải ảnh
                lên...
              </>
            ) : (
              <>
                <Send size={16} /> Gửi Khiếu nại
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisputeModal;
