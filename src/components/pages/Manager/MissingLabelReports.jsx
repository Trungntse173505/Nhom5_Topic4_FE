import React, { useState, useEffect } from "react";
import { AlertCircle, FileImage, Image as ImageIcon, Loader2, Tag, X } from "lucide-react";
import { managerDisputeApi } from "../../../api/managerDisputeApi";

const EvidenceModal = ({ isOpen, onClose, taskId, taskName }) => {
  const [evidenceData, setEvidenceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !taskId) return;

    const fetchEvidence = async () => {
      setLoading(true);
      setError(null);
      try {
        // Đã FIX: Đổi managerApi thành managerDisputeApi
        const res = await managerDisputeApi.getMissingLabelEvidence(taskId); 
        const data = Array.isArray(res) ? res : res.data;
        
        if (data && data.length > 0) {
          setEvidenceData(data[0]);
        } else {
          setEvidenceData(null);
        }
      } catch (err) {
        setError("Không thể tải chi tiết bằng chứng.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  // Parse mảng ảnh (nếu BE trả về chuỗi JSON bọc mảng)
  let images = [];
  if (evidenceData?.evidenceImages) {
    try {
      images = JSON.parse(evidenceData.evidenceImages);
    } catch {
      images = typeof evidenceData.evidenceImages === 'string' ? [evidenceData.evidenceImages] : evidenceData.evidenceImages;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-[#0f172a]/50 shrink-0">
          <div className="flex items-center gap-3 text-red-400">
            <FileImage size={24} />
            <div>
              <h3 className="text-lg font-bold text-white">Bằng chứng thiếu Label</h3>
              <p className="text-xs text-slate-400">Task ID: {taskId.substring(0, 8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="animate-spin w-8 h-8 mb-3 text-blue-500" />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-rose-500 bg-rose-500/10 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-80" />
              {error}
            </div>
          ) : !evidenceData ? (
            <div className="text-center py-10 text-slate-500 italic">
              Không có dữ liệu bằng chứng cho Task này.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Lý do */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nội dung báo cáo</h4>
                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-700 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {evidenceData.comment || evidenceData.reason || "Không có nội dung mô tả."}
                </div>
              </div>

              {/* Ảnh */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ImageIcon size={14} /> Ảnh đính kèm
                </h4>
                {images && images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((img, idx) => {
                       const cleanUrl = img.replace(/[\[\]"]/g, "");
                       return (
                        <a key={idx} href={cleanUrl} target="_blank" rel="noreferrer" className="group relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video block">
                          <img 
                            src={cleanUrl} 
                            alt={`Bằng chứng ${idx + 1}`} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                            onError={(e) => (e.target.src = "https://placehold.co/400x300/1e293b/ffffff?text=Lỗi+ảnh")}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-medium">Xem ảnh lớn</span>
                          </div>
                        </a>
                       )
                    })}
                  </div>
                ) : (
                  <div className="bg-[#0f172a] border border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-500 text-sm">
                    Annotator không đính kèm ảnh bằng chứng nào.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MissingLabelReports({ projectId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho Modal
  const [selectedTaskForEvidence, setSelectedTaskForEvidence] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // Đã FIX: Đổi managerApi thành managerDisputeApi
        const res = await managerDisputeApi.getMissingLabelReports(projectId); 
        const data = Array.isArray(res) ? res : res.data;
        setReports(data || []);
      } catch (err) {
        setError("Không thể tải danh sách báo cáo thiếu nhãn.");
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchReports();
  }, [projectId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" /> 
        Đang tải danh sách báo cáo...
      </div>
    );
  }

  if (error) {
    return <div className="py-20 text-center text-rose-500">{error}</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <EvidenceModal 
        isOpen={!!selectedTaskForEvidence} 
        onClose={() => setSelectedTaskForEvidence(null)} 
        taskId={selectedTaskForEvidence} 
      />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Tag className="text-red-400" /> Báo cáo thiếu Label
          </h2>
          <p className="text-slate-400 text-sm mt-1">Danh sách các Task bị Annotator báo lỗi do thiếu bộ nhãn.</p>
        </div>
        <div className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl font-bold text-sm">
          {reports.length} Báo cáo
        </div>
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0f172a]/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
            <tr>
              <th className="p-4 w-24">ID Khiếu nại</th>
              <th className="p-4 w-24">Task ID</th>
              <th className="p-4">Nội dung báo cáo (Lý do)</th>
              <th className="p-4 text-right w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-300">
            {reports.length > 0 ? (
              reports.map((r, i) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-500">#{r.disputeID?.substring(0, 6) || "N/A"}</td>
                  <td className="p-4 font-mono text-xs text-blue-400">#{r.taskID?.substring(0, 6)}</td>
                  <td className="p-4">
                    <div className="max-w-md truncate" title={r.reason}>{r.reason || "Không có lý do"}</div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedTaskForEvidence(r.taskID)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-12 text-center text-slate-500 italic">
                  Chưa có báo cáo thiếu nhãn nào trong dự án này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}