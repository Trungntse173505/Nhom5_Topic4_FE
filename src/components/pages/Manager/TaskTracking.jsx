import React from "react";

export default function TaskTracking() {
  const tasks = [
    {
      id: "TSK-001",
      file: "IMG_0001.jpg",
      annotator: "Sarah Annotator",
      reviewer: "Mike Reviewer",
      status: "In-Progress",
      deadline: "2026-03-02",
      isOverdue: false,
    },
    {
      id: "TSK-002",
      file: "IMG_0002.jpg",
      annotator: "Lisa Annotator",
      reviewer: "Mike Reviewer",
      status: "Pending Review",
      deadline: "2026-02-27",
      isOverdue: true,
    },
    {
      id: "TSK-003",
      file: "IMG_0003.jpg",
      annotator: "Sarah Annotator",
      reviewer: "Mike Reviewer",
      status: "Rejected",
      deadline: "2026-03-01",
      isOverdue: false,
    },
    {
      id: "TSK-004",
      file: "IMG_0004.jpg",
      annotator: "Lisa Annotator",
      reviewer: "Mike Reviewer",
      status: "Approved",
      deadline: "2026-02-26",
      isOverdue: false,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "In-Progress":
        return "bg-amber-500/10 text-amber-400";
      case "Pending Review":
        return "bg-purple-500/10 text-purple-400";
      case "Rejected":
        return "bg-rose-500/10 text-rose-400";
      case "Approved":
        return "bg-emerald-500/10 text-emerald-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  return (
    <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Task Tracking</h2>
          <p className="text-sm text-gray-400 mt-1">
            Monitor detailed task progress, extend deadlines, or reassign tasks.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search task or file..."
            className="bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0B1120] text-gray-400">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg font-medium">
                Task / File
              </th>
              <th className="px-4 py-3 font-medium">Annotator</th>
              <th className="px-4 py-3 font-medium">Reviewer</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 rounded-tr-lg font-medium text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-200">{task.id}</div>
                  <div className="text-xs text-gray-500">{task.file}</div>
                </td>
                <td className="px-4 py-4 text-gray-300">{task.annotator}</td>
                <td className="px-4 py-4 text-gray-300">{task.reviewer}</td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div
                    className={`text-sm ${task.isOverdue ? "text-rose-400 font-medium" : "text-gray-300"}`}
                  >
                    {task.deadline}
                  </div>
                  {task.isOverdue && (
                    <div className="text-[10px] text-rose-500 uppercase mt-0.5">
                      Overdue
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-right space-x-2">
                  <button
                    className="text-xs px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                    title="Extend Deadline"
                  >
                    Extend
                  </button>
                  <button
                    className="text-xs px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                    title="Re-assign"
                  >
                    Reassign
                  </button>
                  <button
                    className="text-xs px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="Revoke Task"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
