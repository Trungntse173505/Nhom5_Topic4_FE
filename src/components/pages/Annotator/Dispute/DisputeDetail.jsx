import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  History,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAnnotatorDisputes } from "../../../../hooks/Annotator/useAnnotatorDisputes";

const HistoryItem = ({ time, action }) => (
  <div className="relative pl-8">
    <div className="absolute left-0 top-1 w-4 h-4 bg-[#1e293b] border-2 border-slate-700 rounded-full flex items-center justify-center z-10">
      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
    </div>
    <p className="text-xs text-slate-500 mb-1">{time}</p>
    <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
      {action}
    </p>
  </div>
);

const LabelHeader = ({ icon, text }) => (
  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
    {icon} {text}
  </h3>
);

const DisputeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID từ URL
  const { disputes, isLoading } = useAnnotatorDisputes();

  // 👉 FIX LỖI "KHÔNG TÌM THẤY": Quét mọi tên ID có thể có và ép về String
  const detail = useMemo(() => {
    if (!disputes || !id) return null;

    return disputes.find((d) => {
      // Lấy ra tất cả các loại ID mà Object `d` đang có
      const possibleIds = [
        d.disputeId,
        d.disputeID,
        d.id,
        d.taskId,
        d.taskID,
      ].map((val) => String(val).trim()); // Ép về chữ và cắt khoảng trắng dư

      const targetId = String(id).trim();

      // Kiểm tra xem cái ID trên URL có nằm trong danh sách possibleIds không
      return possibleIds.includes(targetId);
    });
  }, [disputes, id]);

  // Thêm cái log này để sếp dễ bắt bệnh
  console.log("👉 ID trên thanh URL:", id);
  console.log("👉 Dữ liệu lấy được từ Hook:", disputes);
  console.log("👉 Đã tìm thấy Detail chưa?:", detail);

  if (isLoading) {
    return (
      <div className="p-8 min-h-full bg-[#0f172a] text-slate-200 flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-amber-500" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-8 min-h-full bg-[#0f172a] text-slate-200 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy khiếu nại</h2>
        <p className="text-slate-500 mb-4">ID đang tìm: {id}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-400 underline hover:text-blue-300"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const isPending = detail.status === "Pending";
  const isAccepted = detail.status === "Accepted";

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span>Quay lại danh sách</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
                #{detail.taskId?.substring(0, 8) || id}
              </span>

              {isPending && (
                <span className="flex items-center gap-1.5 text-amber-500 text-sm font-bold">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />{" "}
                  Đang xử lý
                </span>
              )}
              {isAccepted && (
                <span className="flex items-center gap-1.5 text-emerald-500 text-sm font-bold">
                  Chấp nhận
                </span>
              )}
              {!isPending && !isAccepted && (
                <span className="flex items-center gap-1.5 text-rose-500 text-sm font-bold">
                  Từ chối
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-white mb-6 leading-tight">
              {detail.taskName || "Chi tiết nhiệm vụ"}
            </h1>

            <div className="space-y-6">
              <div>
                <LabelHeader
                  icon={<MessageSquare className="text-blue-500" size={16} />}
                  text="Nội dung bạn khiếu nại"
                />
                <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {detail.reason ||
                    detail.disputeReason ||
                    "Không có nội dung."}
                </div>

                {/* 👉 BẮT ĐỦ LOẠI TÊN BIẾN VÀ ĐỊNH DẠNG ẢNH MÀ BACKEND CÓ THỂ TRẢ VỀ */}
                {(() => {
                  // 1. Quét mọi tên biến có thể chứa ảnh
                  let rawImages =
                    detail.evidenceImages ||
                    detail.evidenceUrls ||
                    detail.images ||
                    detail.evidence ||
                    detail.evidence_images;

                  // 2. Ép kiểu về Mảng (Array) để render
                  let imageArray = [];
                  if (typeof rawImages === "string") {
                    if (rawImages.startsWith("[")) {
                      try {
                        imageArray = JSON.parse(rawImages); // BE trả về mảng bị bọc trong chuỗi
                      } catch (e) {
                        imageArray = [rawImages];
                      }
                    } else if (rawImages.startsWith("http")) {
                      imageArray = [rawImages]; // BE trả về 1 link duy nhất
                    }
                  } else if (Array.isArray(rawImages)) {
                    imageArray = rawImages;
                  }

                  // 3. Render ra màn hình nếu có ảnh
                  if (imageArray.length > 0) {
                    return (
                      <div className="mt-4 flex gap-3 flex-wrap">
                        {imageArray.map((img, idx) => {
                          // Làm sạch link ảnh nếu bị bọc bởi dấu ngoặc kép hoặc ngoặc vuông
                          const cleanUrl = img.replace(/[\[\]"]/g, "");

                          return (
                            <a
                              key={idx}
                              href={cleanUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="w-20 h-20 rounded-lg overflow-hidden border border-slate-700 hover:opacity-80 transition-opacity bg-black/50"
                            >
                              <img
                                src={cleanUrl}
                                alt={`Bằng chứng ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) =>
                                  (e.target.src =
                                    "https://placehold.co/100x100/1e293b/ffffff?text=Lỗi")
                                }
                              />
                            </a>
                          );
                        })}
                      </div>
                    );
                  }

                  // Nếu rỗng thì hiện chữ cho sếp dễ debug
                  return (
                    <div className="mt-4 text-xs text-slate-500 italic">
                      Không có ảnh bằng chứng đính kèm.
                    </div>
                  );
                })()}
              </div>

              <div>
                <LabelHeader
                  icon={<ShieldCheck className="text-green-500" size={16} />}
                  text="Phản hồi từ Quản lý"
                />
                <div
                  className={`p-5 rounded-2xl border italic text-sm ${isPending ? "bg-slate-800/50 border-slate-700 text-slate-500" : isAccepted ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300" : "bg-rose-500/5 border-rose-500/20 text-rose-300"}`}
                >
                  {detail.managerMessage ||
                    detail.adminFeedback ||
                    (isPending
                      ? "Quản lý đang xem xét đơn khiếu nại của bạn..."
                      : "Đã xử lý")}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DisputeDetail;
