import React from "react";
import { useParams } from "react-router-dom";
import { useDisputeResolution } from "../../../hooks/Manager/useDisputeResolution";
import { Loader2 } from "lucide-react";

export default function DisputeResolution({ project }) {
  // Lấy projectId từ URL hoặc từ prop truyền vào
  const { projectId: paramId } = useParams();
  const projectId = paramId || project?.projectID || project?.id;

  // Kéo vũ khí (Hook) ra xài
  const {
    disputes,
    selectedDispute,
    isLoading,
    isDetailLoading,
    isActionLoading,
    fetchDetail,
    handleAction,
  } = useDisputeResolution(projectId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dispute Resolution</h1>
        <p className="text-sm text-gray-400 mt-1">
          Resolve conflicts between Annotators and Reviewers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= CỘT TRÁI: DANH SÁCH ================= */}
        <div className="lg:col-span-1 rounded-xl border border-white/5 bg-[#151D2F] p-5 shadow-sm h-[600px] flex flex-col overflow-hidden">
          <h2 className="text-base font-semibold text-white mb-4">
            Pending Disputes ({disputes.length})
          </h2>

          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {isLoading ? (
              <div className="text-center py-10 text-gray-500 animate-pulse">
                Đang tải dữ liệu...
              </div>
            ) : disputes.length === 0 ? (
              <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">
                Không có khiếu nại nào!
              </div>
            ) : (
              disputes.map((item) => {
                const isSelected =
                  selectedDispute?.disputeId === item.disputeId;

                return (
                  <div
                    key={item.disputeId}
                    onClick={() => fetchDetail(item.disputeId)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-white/5 bg-[#1E293B] hover:border-white/20"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-white">
                        Task #{item.taskId?.substring(0, 8) || "Unknown"}
                      </span>
                      <span className="text-xs text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded">
                        Disputed
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Ann: {item.annotatorName || "N/A"} • Rev:{" "}
                      {item.reviewerName || "N/A"}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= CỘT PHẢI: CHI TIẾT ================= */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col h-[600px]">
          {!selectedDispute ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              {isDetailLoading ? (
                <>
                  <Loader2 className="animate-spin w-8 h-8 mb-4 text-blue-500" />
                  <p>Đang tải chi tiết...</p>
                </>
              ) : (
                <p>Bấm vào một khiếu nại bên trái để xem chi tiết</p>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">
                  Task #{selectedDispute.taskId?.substring(0, 8)} Details
                </h2>
                <button className="text-sm text-blue-400 hover:text-blue-300">
                  View Task Data ↗
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* Lập luận của Reviewer */}
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 h-fit">
                  <h3 className="text-sm font-medium text-rose-400 mb-2">
                    Reviewer Rejection (
                    {selectedDispute.reviewerName || "Unknown"})
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    "
                    {selectedDispute.reviewerReason ||
                      "Không có lý do từ chối."}
                    "
                  </p>
                </div>

                {/* Lập luận của Annotator */}
                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 h-fit">
                  <h3 className="text-sm font-medium text-blue-400 mb-2">
                    Annotator Appeal (
                    {selectedDispute.annotatorName || "Unknown"})
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    "
                    {selectedDispute.annotatorReason ||
                      "Không có lý do khiếu nại."}
                    "
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 border-t border-white/5 pt-6 mt-auto">
                <button
                  onClick={() =>
                    handleAction(selectedDispute.disputeId, "Approve")
                  }
                  disabled={isActionLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {isActionLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : null}
                  Approve Dispute (Annotator Wins)
                </button>
                <button
                  onClick={() =>
                    handleAction(selectedDispute.disputeId, "Reject")
                  }
                  disabled={isActionLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {isActionLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : null}
                  Reject Dispute (Reviewer Wins)
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                * Hành động này không thể hoàn tác. Điểm uy tín (Reputation) của
                nhân sự sẽ được hệ thống tự động tính toán.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
