import React, { useState } from "react";
import { Tag, X, Send, ImagePlus, Loader2 } from "lucide-react";
import { useReportMissingLabel } from "../../../../hooks/Annotator/useReportMissingLabel";

// HÀM BƠM ẢNH LÊN CLOUDINARY
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "react_upload"); 
  formData.append("cloud_name", "dlgsidnr2");

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dlgsidnr2/image/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload Cloudinary bị từ chối");
    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error("Lỗi up ảnh lên Cloudinary:", error);
    throw new Error("Tải ảnh thất bại");
  }
};

const MissingLabelModal = ({ isOpen, onClose, taskId }) => {
  const { reportMissing } = useReportMissingLabel();
  
  const [reason, setReason] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleClose = () => {
    if (!isUploading) {
      setReason("");
      setSelectedFiles([]);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do thiếu Label!");
      return;
    }

    try {
      setIsUploading(true);
      let evidenceUrls = [];

      // Up ảnh lên Cloudinary nếu có
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map((file) => uploadToCloudinary(file));
        evidenceUrls = await Promise.all(uploadPromises);
      }

      // Gọi API báo thiếu nhãn
      const res = await reportMissing(taskId, reason.trim(), evidenceUrls);
      
      if (res.success) {
        // 🔥 Đã xóa lệnh văng về home, chỉ báo thành công và đóng form
        alert("✅ Đã gửi báo cáo thiếu Label thành công. Bạn có thể tiếp tục làm việc!");
        handleClose();
      } else {
        alert(`❌ Lỗi: ${res.error}`);
      }
    } catch (err) {
      alert("Đã xảy ra lỗi trong quá trình tải ảnh lên hoặc gửi báo cáo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-[#0f172a]/50">
          <div className="flex items-center gap-3 text-red-400">
            <Tag size={24} />
            <h3 className="text-lg font-bold text-white">Báo Cáo Thiếu Label</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-slate-300 mb-4">
            Vui lòng nhập rõ những Label nào đang bị thiếu trong hệ thống để Manager bổ sung. 
            Bạn có thể đính kèm ảnh chụp màn hình.
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isUploading}
            placeholder="Ví dụ: Thiếu label 'Xe đạp điện', 'Người đi bộ'..."
            className="w-full h-28 bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none mb-3 disabled:opacity-70 custom-scrollbar"
          ></textarea>

          {/* Upload Ảnh */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                  selectedFiles.length >= 3 || isUploading 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                    : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                }`}
              >
                <ImagePlus size={14} />
                Thêm ảnh
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={selectedFiles.length >= 3 || isUploading}
                />
              </label>
            </div>

            {/* Preview Ảnh Nhỏ */}
            {selectedFiles.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-600 bg-black/50 w-16 h-16">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity"
                    />
                    {!isUploading && (
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
            disabled={isUploading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || isUploading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-600/20"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Đang gửi...
              </>
            ) : (
              <>
                <Send size={16} /> Gửi Báo Cáo
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MissingLabelModal;