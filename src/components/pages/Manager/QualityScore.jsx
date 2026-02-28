import React from "react";

export default function QualityScore() {
  const personnel = [
    {
      name: "Sarah Annotator",
      role: "Annotator",
      score: 95,
      quota: 3,
      status: "Active",
    },
    {
      name: "Lisa Annotator",
      role: "Annotator",
      score: 45,
      quota: 2,
      status: "Warning",
    },
    {
      name: "Mike Reviewer",
      role: "Reviewer",
      score: 100,
      quota: 5,
      status: "Active",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Quality Score & Performance
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Monitor trust scores and manage overdue tasks
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bảng điểm tín nhiệm */}
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-6">
            Personnel Trust Scores
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Max Tasks</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {personnel.map((user, idx) => (
                  <tr key={idx}>
                    <td className="py-4 text-sm text-gray-200">
                      <div>{user.name}</div>
                      <div className="text-xs text-gray-500">{user.role}</div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-sm font-bold ${user.score >= 50 ? "text-emerald-400" : "text-amber-400"}`}
                      >
                        {user.score}/100
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-400">
                      {user.quota} tasks
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${user.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quản lý Task Quá hạn */}
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-6">
            Overdue Tasks
          </h2>
          <div className="space-y-4">
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
            {/* Note về Auto-ban */}
            <div className="mt-6 p-3 rounded bg-blue-500/5 border border-blue-500/10 text-xs text-blue-400/80">
              <span className="font-semibold">System Rule:</span> Annotators
              dropping to 0 points or failing 3 consecutive tasks will be
              automatically deactivated.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
