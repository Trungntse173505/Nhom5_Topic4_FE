import React, { useCallback } from "react";
import { useQualityScore } from "../../../hooks/Manager/useQualityScore";
import { AuroraBackground } from "../../common/aurora-background";

const UserRowItem = React.memo(({ user }) => {
  const name = user.fullName || user.userName || "Người dùng ẩn danh";
  const score = user.score ?? user.qualityScore ?? user.reputationScore ?? 100;

  return (
    <tr className="transition-colors hover:bg-white/[0.02]">
      <td className="py-4 px-4 text-sm text-gray-200">
        <div className="font-medium">{name}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
          {user.role || user.roleName}
        </div>
      </td>
      <td className="py-4 px-4 text-right">
        <span
          className={`text-sm font-bold px-3 py-1.5 rounded-lg bg-white/5 ${score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-rose-400"}`}
        >
          {score}⭐
        </span>
      </td>
    </tr>
  );
});

export default function QualityScore() {
  const { users, isLoadingUsers } = useQualityScore();

  return (
    <AuroraBackground className="font-sans relative">
      <div className="p-8 max-w-5xl mx-auto space-y-6 relative z-20 w-full">
        <div className="mb-8 text-center">
          <p className="text-3xl text-white mt-2">
            Theo dõi điểm chất lượng tổng thể của nhân sự trong dự án
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#151D2F]/90 backdrop-blur-sm shadow-xl flex flex-col h-[700px]">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0B1120]/50 rounded-t-xl">
            <h2 className="text-lg font-semibold text-white">
              Danh sách nhân sự
            </h2>
            <div className="text-xs px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-medium">
              Tổng số: {users.length} người
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2">
            {isLoadingUsers ? (
              <div className="text-center py-20 text-gray-500 animate-pulse flex flex-col items-center">
                <svg
                  className="animate-spin h-8 w-8 mb-4 text-blue-500/50"
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
                Đang tải danh sách...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl mt-4">
                Không tìm thấy Annotator/Reviewer nào trong dự án này.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#151D2F]/95 backdrop-blur z-10">
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-500">
                    <th className="pb-3 pt-4 px-4 font-medium">
                      Họ Tên & Vai Trò
                    </th>
                    <th className="pb-3 pt-4 px-4 font-medium text-right">
                      Điểm Hiện Tại
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user, idx) => {
                    const id = user.id || user.userId || user.userID;
                    return <UserRowItem key={id || idx} user={user} />;
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-[#0B1120]/30 rounded-b-xl text-center">
            <p className="text-xs text-gray-500">
              Hệ thống tự động cộng/trừ điểm dựa trên kết quả phê duyệt Task và
              các khiếu nại (Disputes).
            </p>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
