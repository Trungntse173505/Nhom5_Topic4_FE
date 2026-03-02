import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTaskTracking } from "../../../hooks/useTaskTracking";

export default function TaskTracking() {
  const { projectId } = useParams();
  const { tasks, isLoading, isActionLoading, extendDeadline, revoke } =
    useTaskTracking(projectId);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Lọc task theo ô tìm kiếm
  const filteredTasks = tasks.filter(
    (t) =>
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.fileName || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Task Tracking</h2>
          <p className="text-sm text-gray-400 mt-1">
            Monitor progress and manage task lifecycles.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search task or file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">
            Loading tasks...
          </div>
        ) : (
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
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-600">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-200">{task.id}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">
                        {task.fileName || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-300">
                      {task.annotatorName || "Unassigned"}
                    </td>
                    <td className="px-4 py-4 text-gray-300">
                      {task.reviewerName || "---"}
                    </td>
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
                        <div className="text-[10px] text-rose-500 uppercase mt-0.5 font-bold">
                          Overdue
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          const newDate = prompt(
                            "Nhập ngày gia hạn mới (YYYY-MM-DD):",
                            task.deadline,
                          );
                          if (newDate) extendDeadline(task.id, newDate);
                        }}
                        disabled={isActionLoading}
                        className="text-xs px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 transition-colors disabled:opacity-50"
                      >
                        Extend
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Bạn có chắc chắn muốn thu hồi task này?",
                            )
                          )
                            revoke(task.id);
                        }}
                        disabled={isActionLoading}
                        className="text-xs px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
