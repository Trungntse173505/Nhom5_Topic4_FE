import React from "react";
import { useManagerDisputes } from "../../../hooks/Manager/useManagerDisputes"; 

export default function DisputeResolution() {
  const {
    disputes,
    selectedDispute,
    isLoadingList,
    isLoadingDetail,
    isResolving,
    fetchDisputeDetail,
    resolveDispute
  } = useManagerDisputes();

  const pendingDisputes = disputes.filter(d => d.status === "Pending");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Giải quyết khiếu nại</h1>
        <p className="text-sm text-gray-400 mt-1">
          Xử lý các xung đột giữa Người gán nhãn (Annotator) và Người duyệt (Reviewer)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hàng chờ Dispute */}
        <div className="lg:col-span-1 rounded-xl border border-white/5 bg-[#151D2F] p-5 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <h2 className="text-base font-semibold text-white mb-4 shrink-0">
            Khiếu nại chờ xử lý ({pendingDisputes.length})
          </h2>
          
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {isLoadingList ? (
              <p className="text-gray-400 text-sm">Đang tải danh sách...</p>
            ) : pendingDisputes.length === 0 ? (
              <p className="text-gray-400 text-sm">Tuyệt vời! Không có khiếu nại nào đang chờ.</p>
            ) : (
              pendingDisputes.map((item) => {
                const isSelected = selectedDispute?.disputeID === item.disputeID;
                return (
                  <div
                    key={item.disputeID}
                    onClick={() => fetchDisputeDetail(item.disputeID)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-blue-500/50 bg-blue-500/5"
                        : "border-white/5 bg-[#1E293B] hover:border-white/20"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-white truncate pr-2">
                        {item.taskName}
                      </span>
                      <span className="text-xs text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded shrink-0">
                        Đang khiếu nại
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      Dự án: {item.projectName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chi tiết phân xử */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col min-h-[600px]">
          {isLoadingDetail ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Đang tải thông tin chi tiết...</div>
          ) : !selectedDispute ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Vui lòng chọn một khiếu nại từ danh sách bên trái để xem chi tiết
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Task: {selectedDispute.taskName}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Dự án: {selectedDispute.projectName}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto mb-6 pr-2">
                {/* Lập luận của Annotator */}
                <div className="p-5 rounded-xl border border-blue-500/20 bg-blue-500/5">
                  <h3 className="text-sm font-medium text-blue-400 mb-2">
                    Lập luận của Annotator ({selectedDispute.annotator})
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed bg-[#1E293B] p-3 rounded-lg border border-white/5">
                    "{selectedDispute.reason}"
                  </p>
                </div>

                {/* Khu vực ảnh bằng chứng (Evidence Images) */}
                <div className="p-5 rounded-xl border border-white/5 bg-[#1E293B]/50">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">
                    Ảnh bằng chứng ({selectedDispute.evidenceImages?.length || 0})
                  </h3>
                  {selectedDispute.evidenceImages && selectedDispute.evidenceImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedDispute.evidenceImages.map((imgUrl, idx) => (
                        <div key={idx} className="aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/5">
                          <img 
                            src={imgUrl} 
                            alt={`Bằng chứng ${idx + 1}`} 
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(imgUrl, "_blank")}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Không có ảnh bằng chứng nào được cung cấp.</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-white/5 pt-6 mt-auto">
                <div className="flex gap-4">
                  <button 
                    onClick={() => resolveDispute(selectedDispute.disputeID, 'accept')}
                    disabled={isResolving || selectedDispute.status !== "Pending"}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    {isResolving ? "Đang xử lý..." : "Chấp thuận (Annotator thắng)"}
                  </button>
                  <button 
                    onClick={() => resolveDispute(selectedDispute.disputeID, 'reject')}
                    disabled={isResolving || selectedDispute.status !== "Pending"}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    {isResolving ? "Đang xử lý..." : "Từ chối (Reviewer thắng)"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Việc chấp thuận sẽ kết thúc Task. Từ chối sẽ trừ 10 điểm của Annotator.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}