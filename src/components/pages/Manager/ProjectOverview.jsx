import React from "react";
import { AuroraBackground } from "../../common/aurora-background";

const projectStats = [
  { label: "Tổng dự án", value: "12", note: "đang theo dõi", tone: "bg-sky-500/10 text-sky-300" },
  { label: "Đang active", value: "7", note: "đang thực hiện gắn nhãn", tone: "bg-emerald-500/10 text-emerald-300" },
  { label: "Chờ nộp", value: "3", note: "đợi annotator hoàn tất", tone: "bg-amber-500/10 text-amber-300" },
  { label: "Đã đóng", value: "2", note: "đã bàn giao / kết thúc", tone: "bg-violet-500/10 text-violet-300" },
];

const projectRows = [
  {
    name: "Clinical Notes NER",
    type: "Text",
    status: "Active",
    labelType: "Entity",
    progress: "68%",
    users: "8 annotator, 2 reviewer",
    badge: "bg-emerald-500/10 text-emerald-300",
  },
  {
    name: "Road Scene Detection",
    type: "Image",
    status: "Submitted",
    labelType: "Bounding Box",
    progress: "100%",
    users: "5 annotator, 1 reviewer",
    badge: "bg-sky-500/10 text-sky-300",
  },
  {
    name: "Call Center Sentiment",
    type: "Audio",
    status: "Reviewing",
    labelType: "Classification",
    progress: "82%",
    users: "6 annotator, 2 reviewer",
    badge: "bg-amber-500/10 text-amber-300",
  },
  {
    name: "Video Event Tagging",
    type: "Video",
    status: "Draft",
    labelType: "Multi-label",
    progress: "34%",
    users: "4 annotator, 1 reviewer",
    badge: "bg-violet-500/10 text-violet-300",
  },
];

const labelSummary = [
  { category: "Entity", count: 18, detail: "nhãn cho văn bản" },
  { category: "Bounding Box", count: 24, detail: "nhãn cho ảnh / video" },
  { category: "Classification", count: 12, detail: "nhãn cho audio / text" },
  { category: "Multi-label", count: 9, detail: "nhiều nhãn trên một item" },
];

const userRows = [
  { name: "Nguyễn An", role: "Annotator", active: true, project: "Clinical Notes NER" },
  { name: "Trần Bình", role: "Annotator", active: true, project: "Road Scene Detection" },
  { name: "Lê Chi", role: "Reviewer", active: false, project: "Call Center Sentiment" },
  { name: "Phạm Duy", role: "Reviewer", active: true, project: "Video Event Tagging" },
];

export default function ProjectOverview() {
  return (
    <AuroraBackground className="font-sans relative w-full !justify-start !items-start !p-0">
      <div className="relative z-20 w-full p-8 max-w-7xl mx-auto space-y-8">
        <section className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Tổng quan Project</h1>
          <p className="text-gray-400 max-w-3xl">
            Trang UI cứng để Manager nắm nhanh trạng thái project, phân loại nhãn, và danh sách user đang tham gia.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {projectStats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/5 bg-[#151D2F]/90 backdrop-blur-sm p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-400">{item.label}</p>
                  <div className="mt-2 text-3xl font-bold text-white">{item.value}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.tone}`}>
                  overview
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-500">{item.note}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
          <div className="rounded-2xl border border-white/5 bg-[#151D2F]/90 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Danh sách Project theo trạng thái</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Hiển thị project, loại dữ liệu, trạng thái và nhóm user đang xử lý.
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                Static UI
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="text-gray-500 uppercase tracking-wider text-xs border-b border-white/10">
                    <th className="pb-3 font-medium">Project</th>
                    <th className="pb-3 font-medium">Loại</th>
                    <th className="pb-3 font-medium">Nhãn</th>
                    <th className="pb-3 font-medium">Tiến độ</th>
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projectRows.map((row) => (
                    <tr key={row.name} className="border-b border-white/5 last:border-b-0">
                      <td className="py-4">
                        <div className="font-medium text-white">{row.name}</div>
                        <div className="text-xs text-gray-500 mt-1">Project overview card</div>
                      </td>
                      <td className="py-4 text-gray-300">{row.type}</td>
                      <td className="py-4 text-gray-300">{row.labelType}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 rounded-full bg-[#0B1120] overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full ${
                                row.status === "Active"
                                  ? "bg-emerald-500"
                                  : row.status === "Submitted"
                                    ? "bg-sky-500"
                                    : row.status === "Reviewing"
                                      ? "bg-amber-400"
                                      : "bg-violet-500"
                              }`}
                              style={{ width: row.progress }}
                            />
                          </div>
                          <span className="text-gray-300">{row.progress}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-300">{row.users}</td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${row.badge}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-[#151D2F]/90 backdrop-blur-sm p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-4">Phân loại nhãn</h2>
              <div className="space-y-3">
                {labelSummary.map((item) => (
                  <div
                    key={item.category}
                    className="rounded-xl border border-white/5 bg-[#0B1120]/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-white">{item.category}</div>
                        <div className="text-sm text-gray-500 mt-1">{item.detail}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">{item.count}</div>
                        <div className="text-xs text-gray-500">labels</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#151D2F]/90 backdrop-blur-sm p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-4">User đang tham gia</h2>
              <div className="space-y-3">
                {userRows.map((user) => (
                  <div
                    key={user.name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#0B1120]/70 p-4"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">{user.name}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {user.role} - {user.project}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        user.active
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {user.active ? "Active" : "Offline"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AuroraBackground>
  );
}
