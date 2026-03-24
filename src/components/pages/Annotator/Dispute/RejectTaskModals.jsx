import React, { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import DisputeModal from "../Dispute/DisputeModal";
import { useDisputeTask } from "../../../../hooks/Annotator/useDisputeTask";
import { useNavigate } from "react-router-dom";

// HÀM BƠM ẢNH LÊN CLOUDINARY (Upload Unsigned)
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

const RejectTaskModals = ({ mode, setMode, taskId }) => {
  const navigate = useNavigate();
  const { dispute } = useDisputeTask();
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  // XỬ LÝ SUBMIT KHIẾU NẠI
  const handleDisputeSubmit = async (reason, selectedFiles = []) => {
    try {
      setIsUploadingEvidence(true);
      let evidenceUrls = [];

      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map((file) => uploadToCloudinary(file));
        evidenceUrls = await Promise.all(uploadPromises);
      }

      await dispute(taskId, reason, evidenceUrls);
      alert("Đã gửi khiếu nại thành công! Quản lý sẽ xem xét lại kết quả của bạn.");
      setMode("none");
      navigate("/annotator"); 
    } catch (err) {
      alert(err?.response?.data || err.message || "Không thể gửi khiếu nại lúc này.");
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  // NẾU KHÔNG CÓ MODE NÀO ĐANG KÍCH HOẠT THÌ RỖNG
  if (mode === "none" || mode === "deciding" || mode === "resolved") return null;

  return (
    <>
      {/* 1. POPUP CẢNH BÁO LẦN ĐẦU (PROMPTING) */}
      {mode === "prompting" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e293b] p-8 rounded-2xl max-w-md w-full border border-red-500/30 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Task Bị Từ Chối!</h2>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              Reviewer đã đánh giá không đạt một số dữ liệu của bạn. <br /><br />
              ⚠️ <b>CẢNH BÁO:</b> Chỉ chọn Khiếu Nại nếu bạn <b>chắc chắn mình đúng 100%</b>. Nếu Quản lý đồng ý, Task sẽ được chuyển thành Hoàn thành (Done). Nhưng nếu bạn cãi cố và sai, bạn sẽ bị phạt nặng!<br /><br />
              Nếu nhận ra mình có sai sót, hãy nhấn <b>Bỏ qua & Sửa lại</b>.
            </p>
            <button
              onClick={() => setMode("deciding")}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg"
            >
              Đã hiểu, tôi sẽ kiểm tra
            </button>
          </div>
        </div>
      )}

      {/* 2. POPUP XÁC NHẬN BỎ QUA ĐỂ SỬA (CONFIRM_SKIP) */}
      {mode === "confirm_skip" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e293b] p-8 rounded-2xl max-w-md w-full border border-slate-600 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Xác Nhận Sửa Lại</h2>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              Bằng cách nhấn <b>Đồng ý</b>, bạn chấp nhận đánh giá của Reviewer và sẽ tự sửa lại các lỗi sai. <br/><br/>
              <b>Nút Khiếu Nại sẽ biến mất</b> và chức năng Lưu/Nộp bài sẽ được mở khóa. Bạn có chắc chắn không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMode("deciding")}
                className="flex-1 py-3 bg-transparent border border-slate-600 hover:bg-slate-800 text-white rounded-xl font-bold transition-all"
              >
                Hủy
              </button>
              <button
                onClick={() => setMode("resolved")}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
              >
                Đồng ý Mở khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL NHẬP FORM KHIẾU NẠI (DISPUTING) */}
      {mode === "disputing" && (
        <DisputeModal
          isOpen={true}
          onClose={() => !isUploadingEvidence && setMode("deciding")}
          onSubmit={handleDisputeSubmit}
          isSubmitting={isUploadingEvidence}
        />
      )}
    </>
  );
};

export default RejectTaskModals;