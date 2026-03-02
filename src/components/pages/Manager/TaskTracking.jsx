import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTaskTracking } from "../../../hooks/useTaskTracking";

export default function TaskTracking({ project }) {
  // Lấy ID dự án an toàn từ URL hoặc từ prop
  const { projectId: paramId } = useParams();
  const projectId = paramId || project?.projectID || project?.id;

  const {
    tasks,
    users,
    isLoading,
    isActionLoading,
    extendDeadline,
    reassignTask,
    revoke,
  } = useTaskTracking(projectId);

  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý Modal Giao lại (Reassign)
  const [reassignModal, setReassignModal] = useState({
    show: false,
    taskId: null,
    annotatorId: "",
    reviewerId: "",
  });

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("progress")) return "bg-amber-500/10 text-amber-400";
    if (s.includes("pending") || s.includes("review"))
      return "bg-purple-500/10 text-purple-400";
    if (s.includes("reject")) return "bg-rose-500/10 text-rose-400";
    if (s.includes("approve") || s.includes("done") || s.includes("complete"))
      return "bg-emerald-500/10 text-emerald-400";
    return "bg-gray-500/10 text-gray-400";
  };

  // Lọc Task theo Search
  const filteredTasks = tasks.filter((t) => {
    const targetId = t.taskId || t.id || "";
    return targetId.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Tách role nhân sự cho Modal Reassign
  const annotators = users.filter(
    (u) => u.role === "Annotator" || u.roleName === "Annotator",
  );
  const reviewers = users.filter(
    (u) => u.role === "Reviewer" || u.roleName === "Reviewer",
  );

  const submitReassign = async () => {
    if (!reassignModal.annotatorId)
      return alert("Vui lòng chọn Annotator mới!");
    const success = await reassignTask(
      reassignModal.taskId,
      reassignModal.annotatorId,
      reassignModal.reviewerId || null,
    );
    if (success) {
      alert("Đã giao lại công việc thành công!");
      setReassignModal({
        show: false,
        taskId: null,
        annotatorId: "",
        reviewerId: "",
      });
    }
  };

  return (
    <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm relative">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Task Tracking</h2>
          <p className="text-sm text-gray-400 mt-1">
            Giám sát tiến độ, gia hạn hoặc giao lại công việc.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm theo Task ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500 w-[250px]"
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        {isLoading ? (
          <div className="text-center py-20 text-gray-500">
            Đang tải tiến độ công việc...
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0B1120] text-gray-400 border-b border-white/5">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg font-medium">Task ID</th>
                <th className="px-4 py-3 font-medium">Nhân sự (Ann / Rev)</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Hạn chót</th>
                <th className="px-4 py-3 rounded-tr-lg font-medium text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-600">
                    Chưa có dữ liệu task nào.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, idx) => {
                  // BỌC LÓT TÊN BIẾN
                  const targetId = task.taskId || task.id;
                  const annName =
                    task.annotatorName ||
                    task.annotator?.fullName ||
                    "Chưa giao";
                  const revName =
                    task.reviewerName || task.reviewer?.fullName || "---";
                  const status = task.status || task.taskStatus || "Unknown";

                  return (
                    <tr key={targetId || idx} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-4 font-medium text-gray-200">
                        {targetId ? `TSK-${targetId}` : "N/A"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-gray-300 font-medium">
                          {annName}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Rev: {revName}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded text-[11px] font-medium uppercase tracking-wider ${getStatusColor(status)}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className={`text-sm ${task.isOverdue ? "text-rose-400 font-bold" : "text-gray-300"}`}
                        >
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString(
                                "vi-VN",
                              )
                            : "Chưa đặt"}
                        </div>
                        {task.isOverdue && (
                          <div className="text-[10px] text-rose-500 uppercase mt-1 font-bold animate-pulse">
                            Quá hạn
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            const newDate = prompt(
                              "Nhập ngày gia hạn mới (YYYY-MM-DD):",
                              task.deadline ? task.deadline.split("T")[0] : "",
                            );
                            if (newDate) extendDeadline(targetId, newDate);
                          }}
                          disabled={isActionLoading}
                          className="text-xs px-3 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors disabled:opacity-50"
                        >
                          Extend
                        </button>
                        <button
                          onClick={() =>
                            setReassignModal({
                              show: true,
                              taskId: targetId,
                              annotatorId: task.annotatorId || "",
                              reviewerId: task.reviewerId || "",
                            })
                          }
                          disabled={isActionLoading}
                          className="text-xs px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 transition-colors disabled:opacity-50"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Bạn có chắc chắn muốn thu hồi (Revoke) task này về kho không?",
                              )
                            )
                              revoke(targetId);
                          }}
                          disabled={isActionLoading}
                          className="text-xs px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL GIAO LẠI VIỆC (REASSIGN) */}
      {reassignModal.show && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B1120]/80 backdrop-blur-sm rounded-xl">
          <div className="bg-[#151D2F] border border-white/10 p-6 rounded-xl shadow-2xl w-[400px]">
            <h3 className="text-lg font-semibold text-white mb-4">
              Giao lại Task #{reassignModal.taskId}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Chọn Annotator mới
                </label>
                <select
                  value={reassignModal.annotatorId}
                  onChange={(e) =>
                    setReassignModal({
                      ...reassignModal,
                      annotatorId: e.target.value,
                    })
                  }
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="">-- Chọn Annotator --</option>
                  {annotators.map((u) => (
                    <option key={u.id || u.userId} value={u.id || u.userId}>
                      {u.fullName || u.userName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Chọn Reviewer mới
                </label>
                <select
                  value={reassignModal.reviewerId}
                  onChange={(e) =>
                    setReassignModal({
                      ...reassignModal,
                      reviewerId: e.target.value,
                    })
                  }
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="">-- Bỏ qua nếu không cần --</option>
                  {reviewers.map((u) => (
                    <option key={u.id || u.userId} value={u.id || u.userId}>
                      {u.fullName || u.userName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setReassignModal({
                    show: false,
                    taskId: null,
                    annotatorId: "",
                    reviewerId: "",
                  })
                }
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitReassign}
                disabled={isActionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isActionLoading ? "Đang xử lý..." : "Xác nhận giao"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
