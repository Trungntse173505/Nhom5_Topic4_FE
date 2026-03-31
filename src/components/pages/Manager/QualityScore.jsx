import React, { useMemo, useState } from "react";
import { useQualityScore } from "../../../hooks/Manager/useQualityScore";
import { AuroraBackground } from "../../common/aurora-background";

const SORT_PRESETS = [
  { value: "score-desc", label: "Cao đến thấp" },
  { value: "score-asc", label: "Thấp đến cao" },
];

const getDisplayName = (user) =>
  user.fullName || user.userName || user.name || "Người dùng ẩn danh";

const getDisplayRole = (user) =>
  String(user.roleName || user.role || "Chưa rõ").trim();

const getScore = (user) =>
  Number(user.score ?? user.qualityScore ?? user.reputationScore ?? 100) || 0;

const formatExperience = (user) => {
  const rawExperience =
    user.experience ?? user.expertise ?? user.level ?? user.seniority ?? "";
  const normalized = String(rawExperience).trim();
  if (!normalized) return "Cơ bản";

  const lowered = normalized.toLowerCase();
  if (["n/a", "na", "chưa cập nhật", "chua cap nhat", "null", "undefined"].includes(lowered)) {
    return "Cơ bản";
  }

  return normalized;
};

const UserRowItem = React.memo(({ user }) => {
  const name = getDisplayName(user);
  const role = getDisplayRole(user);
  const score = getScore(user);
  const experience = formatExperience(user);

  return (
    <tr className="group border-b border-white/5 bg-[#151D2F] transition-colors hover:bg-[#182034]">
      <td className="bg-[#151D2F] px-5 py-5 align-top transition-colors group-hover:bg-[#182034]">
        <div className="font-semibold text-white">{name}</div>
      </td>
      <td className="bg-[#151D2F] px-5 py-5 text-center align-middle transition-colors group-hover:bg-[#182034]">
        <div className="flex w-full justify-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gray-300">
            {role}
          </div>
        </div>
      </td>
      <td className="bg-[#151D2F] px-5 py-5 text-center align-middle transition-colors group-hover:bg-[#182034]">
        <div className="flex w-full justify-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm font-medium text-gray-200">
            {experience}
          </div>
        </div>
      </td>
      <td className="bg-[#151D2F] px-5 py-5 text-right align-top transition-colors group-hover:bg-[#182034]">
        <span
          className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold ${score >= 80
            ? "bg-emerald-500/10 text-emerald-300"
            : score >= 50
              ? "bg-amber-500/10 text-amber-300"
              : "bg-rose-500/10 text-rose-300"
            }`}
        >
          <span>{score}</span>
          <span className="text-xs text-yellow-300">★</span>
        </span>
      </td>
    </tr>
  );
});

export default function QualityScore() {
  const { users, isLoadingUsers } = useQualityScore();
  const [scoreSort, setScoreSort] = useState("score-desc");

  const sortedUsers = useMemo(() => {
    const list = [...users];

    list.sort((left, right) => {
      const leftName = getDisplayName(left);
      const rightName = getDisplayName(right);

      const scoreMultiplier = scoreSort === "score-asc" ? 1 : -1;
      const scoreDiff = getScore(left) - getScore(right);
      return scoreDiff !== 0
        ? scoreDiff * scoreMultiplier
        : leftName.localeCompare(rightName, "vi");
    });

    return list;
  }, [users, scoreSort]);

  const annotatorCount = useMemo(
    () => users.filter((user) => getDisplayRole(user).toLowerCase() === "annotator").length,
    [users],
  );
  const reviewerCount = useMemo(
    () => users.filter((user) => getDisplayRole(user).toLowerCase() === "reviewer").length,
    [users],
  );

  const handleScoreSortChange = (event) => {
    setScoreSort(event.target.value);
  };

  return (
    <AuroraBackground className="font-sans relative">
      <div className="relative z-20 mx-auto w-full max-w-6xl space-y-6 p-6 md:p-8">
        <div className="space-y-4 text-center">
          <p className="text-3xl leading-tight text-white md:text-[40px]">
            Theo dõi điểm chất lượng tổng thể của nhân sự trong dự án
          </p>
          <p className="mx-auto max-w-3xl text-sm text-gray-400 md:text-base">
            Danh sách được ưu tiên theo vai trò Annotator và Reviewer, kèm kinh nghiệm
            và điểm hiện tại để Manager dễ theo dõi.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-[#151D2F]/90 p-5 shadow-xl backdrop-blur-sm">
            <div className="text-sm text-gray-400">Tổng nhân sự</div>
            <div className="mt-2 text-3xl font-bold text-white">{users.length}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#151D2F]/90 p-5 shadow-xl backdrop-blur-sm">
            <div className="text-sm text-gray-400">Annotator</div>
            <div className="mt-2 text-3xl font-bold text-emerald-300">{annotatorCount}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#151D2F]/90 p-5 shadow-xl backdrop-blur-sm">
            <div className="text-sm text-gray-400">Reviewer</div>
            <div className="mt-2 text-3xl font-bold text-sky-300">{reviewerCount}</div>
          </div>
        </div>

        <div className="flex h-[720px] flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#151D2F]/90 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-4 border-b border-white/5 bg-[#0B1120]/55 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Danh sách nhân sự</h2>
              <p className="mt-1 text-sm text-gray-400">
                Hiển thị vai trò, kinh nghiệm và điểm chất lượng hiện tại.
              </p>
            </div>
          </div>

          <div className="border-b border-white/5 bg-[#0B1120]/80 px-6 py-4">
            <div className="flex w-full flex-wrap items-center justify-end gap-3">
              <div className="flex w-full max-w-[360px] items-center gap-3">
                <label className="text-sm text-gray-400" htmlFor="quality-sort">
                  Điểm:
                </label>
                <select
                  id="quality-score-sort"
                  value={scoreSort}
                  onChange={handleScoreSortChange}
                  className="w-full min-w-0 rounded-xl border border-white/10 bg-[#0B1120] px-4 py-2.5 text-sm text-gray-200 outline-none transition focus:border-blue-500/40"
                >
                  {SORT_PRESETS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-b border-white/5 bg-[#151D2F] px-6">
            <table className="w-full table-fixed border-collapse text-left bg-[#151D2F]">
              <colgroup>
                <col className="w-[32%]" />
                <col className="w-[18%]" />
                <col className="w-[26%]" />
                <col className="w-[24%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-4 font-medium">Họ tên</th>
                  <th className="px-5 py-4 font-medium text-center">
                    <span className="relative left-[-10px] inline-block">Vai trò</span>
                  </th>
                  <th className="px-5 py-4 font-medium text-center">Kinh nghiệm</th>
                  <th className="px-5 py-4 font-medium text-right">Điểm hiện tại</th>
                </tr>
              </thead>
            </table>
          </div>

          <div
            className="custom-scrollbar flex-1 overflow-y-scroll px-6 py-4"
            style={{ scrollbarGutter: "stable" }}
          >
            {isLoadingUsers ? (
              <div className="flex flex-col items-center py-24 text-center text-gray-500">
                <svg
                  className="mb-4 h-8 w-8 animate-spin text-blue-500/60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang tải danh sách...
              </div>
            ) : sortedUsers.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-10 text-center text-gray-500">
                Không tìm thấy Annotator/Reviewer nào trong dự án này.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#151D2F]">
                <table className="w-full table-fixed border-collapse text-left bg-[#151D2F]">
                  <colgroup>
                    <col className="w-[32%]" />
                    <col className="w-[18%]" />
                    <col className="w-[26%]" />
                    <col className="w-[24%]" />
                  </colgroup>
                  <tbody className="bg-[#151D2F]">
                    {sortedUsers.map((user, idx) => {
                      const id = user.id || user.userId || user.userID;
                      return <UserRowItem key={id || idx} user={user} />;
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 bg-[#0B1120]/35 px-6 py-4 text-center">
            <p className="text-xs text-gray-500">
              Hệ thống tự động cộng/trừ điểm dựa trên kết quả phê duyệt Task và các khiếu nại
              (Disputes).
            </p>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
