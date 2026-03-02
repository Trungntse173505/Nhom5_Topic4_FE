import React, { useState } from "react";
import { useWorkDistribution } from "../../../hooks/useWorkDistribution";

export default function WorkDistribution({ project, onRefresh }) {
  // Lấy ID dự án an toàn
  const projectId = project?.projectID || project?.id;

  // Sử dụng Hook mới
  const {
    users,
    unassignedItems,
    isLoading,
    isProcessing,
    createBatchAndAssign,
  } = useWorkDistribution(projectId, onRefresh);

  const [selectedIds, setSelectedIds] = useState([]);
  const [assignment, setAssignment] = useState({
    annotatorId: "",
    reviewerId: "",
    deadline: "",
  });

  // Toggle chọn file
  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!assignment.annotatorId || !assignment.deadline) {
      alert("Vui lòng chọn người làm và hạn chót!");
      return;
    }

    const success = await createBatchAndAssign(selectedIds, assignment);
    if (success) {
      alert("Gom lô và giao việc thành công!");
      setSelectedIds([]);
      setAssignment({ annotatorId: "", reviewerId: "", deadline: "" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CỘT 1: CHỌN FILE CHƯA GÁN NHÃN */}
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
            {selectedIds.length} selected
          </span>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-20 text-gray-500 text-sm">
              Đang tải dữ liệu...
            </div>
          ) : unassignedItems.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-sm">
              Tất cả file đã được giao hoặc chưa có dữ liệu.
            </div>
          ) : (
            unassignedItems.map((item, idx) => {
              // BỌC LÓT TÊN BIẾN TỪ BACKEND
              const targetId = item.dataItemId || item.id || item.dataID;
              const targetName =
                item.fileName || item.name || `File #${targetId || idx}`;
              const targetPath = item.filePath || item.url || "";

              return (
                <label
                  key={targetId || idx}
                  className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                    selectedIds.includes(targetId)
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/5 bg-[#0B1120] hover:border-white/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-[#0B1120] border-white/20 text-blue-500"
                    checked={selectedIds.includes(targetId)}
                    onChange={() => toggleSelection(targetId)}
                  />
                  <div className="flex flex-col">
                    <span className="text-gray-300 text-sm font-medium">
                      {targetName}
                    </span>
                    <span className="text-[10px] text-gray-500 truncate max-w-[200px]">
                      {targetPath}
                    </span>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* CỘT 2: FORM GÁN VIỆC */}
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
                .filter(
                  (u) => u.role === "Annotator" || u.roleName === "Annotator",
                )
                .map((u) => {
                  const targetUserId = u.userId || u.id;
                  const targetUserName = u.fullName || u.userName || "User";
                  return (
                    <option key={targetUserId} value={targetUserId}>
                      {targetUserName} (Score: {u.score || 100})
                    </option>
                  );
                })}
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
                .filter(
                  (u) => u.role === "Reviewer" || u.roleName === "Reviewer",
                )
                .map((u) => {
                  const targetUserId = u.userId || u.id;
                  const targetUserName = u.fullName || u.userName || "User";
                  return (
                    <option key={targetUserId} value={targetUserId}>
                      {targetUserName}
                    </option>
                  );
                })}
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
            disabled={selectedIds.length === 0 || isProcessing}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:text-gray-400 text-white py-3 rounded-lg font-medium transition-colors shadow-lg"
          >
            {isProcessing
              ? "Processing..."
              : `Create Task Batch (${selectedIds.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
