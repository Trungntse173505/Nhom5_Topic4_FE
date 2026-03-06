import React from "react";
import { useQualityScore } from "../../../hooks/useQualityScore";

export default function QualityScore() {
  const {
    users,
    isLoadingUsers,
    activeUserId,
    selectedUserLogs,
    isLoadingLogs,
    fetchUserLogs,
    closeLogs,
  } = useQualityScore();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Quality Score & Performance
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Monitor trust scores and reputation logs of personnel
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* KHỐI TRÁI: DANH SÁCH NHÂN SỰ */}
        <div className="rounded-xl border border-white/5 bg-[#151D2F] shadow-sm flex flex-col h-[600px]">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">
              Personnel Trust Scores
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Bấm "View" để xem lịch sử điểm
            </p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2">
            {isLoadingUsers ? (
              <div className="text-center py-10 text-gray-500 animate-pulse">
                Đang tải danh sách...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Không tìm thấy Annotator/Reviewer nào.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#151D2F] z-10">
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-500">
                    <th className="pb-3 pt-4 font-medium">Name & Role</th>
                    <th className="pb-3 pt-4 font-medium">Score</th>
                    <th className="pb-3 pt-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user, idx) => {
                    const id = user.id || user.userId || user.userID;
                    const name =
                      user.fullName || user.userName || "Unnamed User";
                    // Bọc lót tên biến điểm (score/qualityScore/reputation)
                    const score =
                      user.score ??
                      user.qualityScore ??
                      user.reputationScore ??
                      100;
                    const isSelected = activeUserId === id;

                    return (
                      <tr
                        key={id || idx}
                        className={`transition-colors ${isSelected ? "bg-blue-500/5" : "hover:bg-white/[0.02]"}`}
                      >
                        <td className="py-4 text-sm text-gray-200">
                          <div className="font-medium">{name}</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                            {user.role || user.roleName}
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`text-sm font-bold ${score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-rose-400"}`}
                          >
                            {score}⭐
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() =>
                              isSelected ? closeLogs() : fetchUserLogs(id)
                            }
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-white/5 hover:bg-white/10 text-gray-300"
                            }`}
                          >
                            {isSelected ? "Close" : "View Log"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* KHỐI PHẢI: LỊCH SỬ ĐIỂM HOẶC OVERDUE TASKS */}
        {activeUserId ? (
          // HIỂN THỊ LOGS CỦA USER ĐANG CHỌN (GỌI API)
          <div className="rounded-xl border border-blue-500/20 bg-[#151D2F] shadow-sm flex flex-col h-[600px] animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-blue-500/5">
              <div>
                <h2 className="text-lg font-semibold text-blue-400">
                  Reputation Logs
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Lịch sử thay đổi điểm uy tín
                </p>
              </div>
              <button
                onClick={closeLogs}
                className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {isLoadingLogs ? (
                <div className="text-center py-20 text-blue-400/50 animate-pulse flex flex-col items-center">
                  <svg
                    className="animate-spin h-8 w-8 mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang tải dữ liệu...
                </div>
              ) : selectedUserLogs.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <span className="text-4xl block mb-2 opacity-50">📝</span>
                  Nhân sự này chưa có ghi nhận thay đổi điểm nào.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                  {selectedUserLogs.map((log, idx) => {
                    // Bọc lót tên biến từ API
                    const date = log.date || log.createdAt || log.timestamp;
                    const change = log.scoreChange || log.change || 0;
                    const reason =
                      log.reason ||
                      log.description ||
                      "Hệ thống tự động cập nhật";
                    const isPositive = change > 0;

                    return (
                      <div
                        key={idx}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#151D2F] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}
                        >
                          {isPositive ? "+" : ""}
                          {change}
                        </div>

                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-[#0B1120] shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <time className="text-xs text-gray-500 font-medium">
                              {date
                                ? new Date(date).toLocaleString("vi-VN")
                                : "Unknown Time"}
                            </time>
                          </div>
                          <p className="text-sm text-gray-300">{reason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          // HIỂN THỊ OVERDUE TASKS (UI CỨNG NHƯ CŨ KHI CHƯA CHỌN USER)
          <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col h-[600px] animate-in fade-in duration-500">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">
                Overdue Tasks Alert
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Giao diện chờ tích hợp API (Tương lai)
              </p>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="p-4 rounded-xl border border-rose-500/20 bg-[#0B1120] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        Task #IMG_08{item}9
                      </span>
                      <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded">
                        Overdue 2 days
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Assignee: Lisa Annotator
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium rounded transition-colors">
                      Extend Deadline
                    </button>
                    <button className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium rounded transition-colors border border-rose-500/20">
                      Revoke Task
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded bg-blue-500/5 border border-blue-500/10 text-xs text-blue-400/80">
              <span className="font-semibold">System Rule:</span> Annotators
              dropping to 0 points or failing 3 consecutive tasks will be
              automatically deactivated.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
