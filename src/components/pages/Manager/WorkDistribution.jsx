import React, { useState } from "react";
import { useWorkDistribution } from "../../../hooks/useWorkDistribution";

export default function WorkDistribution({ project, onRefresh }) {
  // Sử dụng Hook
  const {
    users,
    unassignedItems,
    selectedDataIds,
    isProcessing,
    toggleSelection,
    createBatch,
  } = useWorkDistribution(project, onRefresh);

  const [assignment, setAssignment] = useState({
    annotatorId: "",
    reviewerId: "",
    deadline: "",
  });

  const handleSubmit = () => {
    if (!assignment.annotatorId || !assignment.deadline) {
      alert("Vui lòng chọn người làm và thời hạn!");
      return;
    }
    createBatch(assignment);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cột 1: Chọn File chưa gán nhãn */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col h-[500px]">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Unassigned Files
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Chọn file để tạo lô công việc mới
            </p>
          </div>
          <span className="text-sm text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
            {selectedDataIds.length} selected
          </span>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-2">
          {unassignedItems.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-sm">
              Tất cả file đã được giao hoặc chưa có dữ liệu.
            </div>
          ) : (
            unassignedItems.map((item) => (
              <label
                key={item.dataID}
                className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                  selectedDataIds.includes(item.dataID)
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/5 bg-[#0B1120] hover:border-white/20"
                }`}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-[#0B1120] border-white/20 text-blue-500"
                  checked={selectedDataIds.includes(item.dataID)}
                  onChange={() => toggleSelection(item.dataID)}
                />
                <div className="flex flex-col">
                  <span className="text-gray-300 text-sm font-medium">
                    {item.fileName || "Unnamed File"}
                  </span>
                  <span className="text-[10px] text-gray-500 truncate max-w-[200px]">
                    {item.filePath}
                  </span>
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Cột 2: Form Gán Việc */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm h-fit">
        <h2 className="text-lg font-semibold text-white mb-6">
          Task Assignment
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Assign to Annotator
            </label>
            <select
              value={assignment.annotatorId}
              onChange={(e) =>
                setAssignment({ ...assignment, annotatorId: e.target.value })
              }
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">-- Select Annotator --</option>
              {users
                .filter((u) => u.role === "Annotator")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} (Score: {u.score || 100})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Assign to Reviewer (Optional)
            </label>
            <select
              value={assignment.reviewerId}
              onChange={(e) =>
                setAssignment({ ...assignment, reviewerId: e.target.value })
              }
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">-- Select Reviewer --</option>
              {users
                .filter((u) => u.role === "Reviewer")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Deadline
            </label>
            <input
              type="date"
              value={assignment.deadline}
              onChange={(e) =>
                setAssignment({ ...assignment, deadline: e.target.value })
              }
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-blue-500 [color-scheme:dark]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedDataIds.length === 0 || isProcessing}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:text-gray-400 text-white py-3 rounded-lg font-medium transition-colors shadow-lg"
          >
            {isProcessing
              ? "Processing..."
              : `Create Task Batch (${selectedDataIds.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
