import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, ShieldCheck, History, Image as ImageIcon, X, FileText } from 'lucide-react';
import { useReviewerDisputes } from '../../../../hooks/Reviewer/useReviewerDisputes';
import { CardSpotlight } from '../../../common/card-spotlight';

const ReviewerDisputeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { disputes, isLoading } = useReviewerDisputes();
  const [selectedImage, setSelectedImage] = useState(null);

  const parseImages = (evidenceImages) => {
    if (!evidenceImages || evidenceImages.length === 0) return [];
    try {
      return JSON.parse(evidenceImages[0]);
    } catch (error) {
      return [evidenceImages[0].replace(/[[\]"]/g, '')];
    }
  };

  const detail = useMemo(() => {
    return disputes.find(d => d.disputeID === id);
  }, [disputes, id]);

  if (isLoading) return <div className="p-8 text-white">Đang tải chi tiết...</div>;
  if (!detail) return <div className="p-8 text-white text-center mt-20">Không tìm thấy khiếu nại này.</div>;

  const isPending = detail.status?.toLowerCase() === 'pending';
  const images = parseImages(detail.evidenceImages);

  return (
    <div className="p-8 min-h-full bg-[#0f172a] text-slate-200">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
        <span>Quay lại danh sách</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
                Task #{detail.taskID?.substring(0, 8)}
              </span>
              <span className={`flex items-center gap-1.5 text-sm font-bold ${isPending ? 'text-amber-500' : 'text-green-500'}`}>
                {isPending ? 'Đang chờ Manager phán quyết' : `Đã chốt kết quả: ${detail.status}`}
              </span>
            </div>

            <h1 className="text-2xl font-black text-white mb-6 uppercase">{detail.taskName}</h1>

            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={16} className="text-rose-500" /> Lý do Annotator khiếu nại
              </h3>
              <div className="bg-rose-500/5 p-5 rounded-2xl border border-rose-500/10 text-rose-200/90 italic">
                "{detail.reason}"
              </div>
            </div>

            {images.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={16} className="text-blue-400" /> Bằng chứng đính kèm
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt="Evidence" 
                      onClick={() => setSelectedImage(img)}
                      className="h-32 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500 hover:scale-105 transition-all"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <CardSpotlight className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="relative z-10 w-full text-left">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <History size={18} className="text-slate-400" /> Tiến trình xử lý
              </h3>

              <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">

                {/* STEP 1 */}
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-4 h-4 bg-[#1e293b] border-2 border-slate-700 rounded-full flex items-center justify-center z-10">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">
                    {new Date(detail.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <FileText size={14}/> Annotator gửi khiếu nại
                  </p>
                </div>

                {/* STEP 2 */}
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-4 h-4 bg-[#1e293b] border-2 border-slate-700 rounded-full flex items-center justify-center z-10">
                    <div className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">Hiện tại</p>
                  <p className="text-sm font-medium text-slate-300">
                    {isPending ? 'Manager đang xem xét' : `Đã đóng (${detail.status})`}
                  </p>
                </div>

              </div>
            </div>
          </CardSpotlight>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-[#0f172a]/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-rose-500 rounded-full flex justify-center items-center">
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="Enlarged" 
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" 
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewerDisputeDetail;