import React, { useMemo, useState } from "react";
import { useQualityScore } from "../../../hooks/Manager/useQualityScore";
import { AuroraBackground } from "../../common/aurora-background";

const ROLE_ORDER = {
  annotator: 0,
  reviewer: 1,
};

const SORT_PRESETS = [
  { value: "role-asc", label: "Vai trò: Annotator trước Reviewer" },
  { value: "role-desc", label: "Vai trò: Reviewer trước Annotator" },
  { value: "experience-desc", label: "Kinh nghiệm: Cao đến thấp" },
  { value: "experience-asc", label: "Kinh nghiệm: Thấp đến cao" },
  { value: "score-desc", label: "Điểm: Cao đến thấp" },
  { value: "score-asc", label: "Điểm: Thấp đến cao" },
];

const getDisplayName = (user) =>
  user.fullName || user.userName || user.name || "Người dùng ẩn danh";

const getDisplayRole = (user) =>
  String(user.roleName || user.role || "Chưa rõ").trim();

const getRoleRank = (user) => {
  const role = getDisplayRole(user).toLowerCase();
  return Object.prototype.hasOwnProperty.call(ROLE_ORDER, role)
    ? ROLE_ORDER[role]
    : Number.MAX_SAFE_INTEGER;
};

const getScore = (user) =>
  Number(user.score ?? user.qualityScore ?? user.reputationScore ?? 100) || 0;

const getExperienceValue = (user) => {
  const rawExperience =
    user.experience ?? user.expertise ?? user.level ?? user.seniority ?? "";

  if (typeof rawExperience === "number") return rawExperience;

  const normalized = String(rawExperience).trim();
  if (!normalized) return Number.MAX_SAFE_INTEGER;

  const numericMatch = normalized.match(/(\d+(?:[.,]\d+)?)/);
  if (numericMatch) {
    return Number(numericMatch[1].replace(",", "."));
  }

  return normalized.toLowerCase();
};

const formatExperience = (user) => {
  const rawExperience =
    user.experience ?? user.expertise ?? user.level ?? user.seniority ?? "";
  return String(rawExperience).trim() || "Chưa cập nhật";
};

const UserRowItem = React.memo(({ user }) => {
  const name = getDisplayName(user);
  const role = getDisplayRole(user);
  const score = getScore(user);
  const experience = formatExperience(user);

  return (
    <tr className="group border-b border-white/5 transition-colors hover:bg-white/[0.03]">
      <td className="py-4 px-4">
        <div className="font-semibold text-white">{name}</div>
        <div className="mt-2 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gray-300">
          {role}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="max-w-[220px] text-sm text-gray-200">{experience}</div>
        <div className="mt-1 text-xs text-gray-500">Kinh nghiệm / chuyên môn</div>
      </td>
      <td className="py-4 px-4 text-right">
        <span
          className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold ${
            score >= 80
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
  const [sortBy, setSortBy] = useState("role");
  const [sortDir, setSortDir] = useState("asc");
  const [sortPreset, setSortPreset] = useState("role-asc");

  const sortedUsers = useMemo(() => {
    const list = [...users];

    list.sort((left, right) => {
      const multiplier = sortDir === "asc" ? 1 : -1;
      const leftName = getDisplayName(left);
      const rightName = getDisplayName(right);

      if (sortBy === "role") {
        const roleDiff = getRoleRank(left) - getRoleRank(right);
        return roleDiff !== 0
          ? roleDiff * multiplier
          : leftName.localeCompare(rightName, "vi");
      }

      if (sortBy === "experience") {
        const leftExperience = getExperienceValue(left);
        const rightExperience = getExperienceValue(right);

        if (
          typeof leftExperience === "number" &&
          typeof rightExperience === "number"
        ) {
          const diff = leftExperience - rightExperience;
          return diff !== 0 ? diff * multiplier : leftName.localeCompare(rightName, "vi");
        }

        return String(leftExperience).localeCompare(String(rightExperience), "vi") * multiplier;
      }

      const scoreDiff = getScore(left) - getScore(right);
      return scoreDiff !== 0
        ? scoreDiff * multiplier
        : leftName.localeCompare(rightName, "vi");
    });

    return list;
  }, [users, sortBy, sortDir]);

  const annotatorCount = useMemo(
    () => users.filter((user) => getDisplayRole(user).toLowerCase() === "annotator").length,
    [users],
  );
  const reviewerCount = useMemo(
    () => users.filter((user) => getDisplayRole(user).toLowerCase() === "reviewer").length,
    [users],
  );

  const handleSortPresetChange = (event) => {
    const value = event.target.value;
    setSortPreset(value);

    const [nextSortBy, nextSortDir] = value.split("-");
    setSortBy(nextSortBy);
    setSortDir(nextSortDir);
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
            <div className="mt-2 text-xs text-gray-500">Annotator + Reviewer</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#151D2F]/90 p-5 shadow-xl backdrop-blur-sm">
            <div className="text-sm text-gray-400">Annotator</div>
            <div className="mt-2 text-3xl font-bold text-emerald-300">{annotatorCount}</div>
            <div className="mt-2 text-xs text-gray-500">Được xếp trước theo mặc định</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#151D2F]/90 p-5 shadow-xl backdrop-blur-sm">
            <div className="text-sm text-gray-400">Reviewer</div>
            <div className="mt-2 text-3xl font-bold text-sky-300">{reviewerCount}</div>
            <div className="mt-2 text-xs text-gray-500">Xếp sau Annotator</div>
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
            <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
              Tổng số: {users.length} người
            </div>
          </div>

          <div className="border-b border-white/5 px-6 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">Sắp xếp danh sách</div>
                <div className="mt-1 text-xs text-gray-500">
                  Chọn một kiểu sort để xem theo vai trò, kinh nghiệm hoặc điểm.
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="text-sm text-gray-400" htmlFor="quality-sort">
                  Sort theo:
                </label>
                <select
                  id="quality-sort"
                  value={sortPreset}
                  onChange={handleSortPresetChange}
                  className="min-w-[280px] rounded-xl border border-white/10 bg-[#0B1120]/80 px-4 py-2.5 text-sm text-gray-200 outline-none transition focus:border-blue-500/40"
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

          <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-2">
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
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-[#151D2F]/95 backdrop-blur">
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-4 pb-3 pt-4 font-medium">Họ tên & vai trò</th>
                    <th className="px-4 pb-3 pt-4 font-medium">Kinh nghiệm</th>
                    <th className="px-4 pb-3 pt-4 font-medium text-right">Điểm hiện tại</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user, idx) => {
                    const id = user.id || user.userId || user.userID;
                    return <UserRowItem key={id || idx} user={user} />;
                  })}
                </tbody>
              </table>
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
