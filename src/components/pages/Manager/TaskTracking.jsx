import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTaskTracking } from "../../../hooks/useTaskTracking";

export default function TaskTracking({ project }) {
  const { projectId: paramId } = useParams();
  const projectId = paramId || project?.projectID || project?.id;

  const {
    tasks,
    annotators,
    reviewers,
    isLoading,
    isActionLoading,
    extendDeadline,
    reassignTask,
    revoke,
  } = useTaskTracking(projectId);

  const [searchTerm, setSearchTerm] = useState("");

  const [reassignModal, setReassignModal] = useState({
    show: false,
    taskId: null,
    annotatorId: "",
    reviewerId: "",
    isFirstAssign: false,
  });

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "0" || s.includes("progress"))
      return "bg-amber-500/10 text-amber-400";
    if (s.includes("pending") || s.includes("review"))
      return "bg-purple-500/10 text-purple-400";
    if (s.includes("reject")) return "bg-rose-500/10 text-rose-400";
    if (s.includes("approve") || s.includes("done") || s.includes("complete"))
      return "bg-emerald-500/10 text-emerald-400";
    return "bg-gray-500/10 text-gray-400";
  };

  const filteredTasks = tasks.filter((t) => {
    const searchString = `${t.taskID} ${t.taskName}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const submitReassign = async () => {
    if (!reassignModal.annotatorId) return alert("Vui lòng chọn Annotator!");
    const success = await reassignTask(
      reassignModal.taskId,
      reassignModal.annotatorId,
      reassignModal.reviewerId || null,
    );
    if (success) {
      alert(
        reassignModal.isFirstAssign
          ? "Đã giao việc thành công!"
          : "Đã đổi nhân sự thành công!",
      );
      setReassignModal({
        show: false,
        taskId: null,
        annotatorId: "",
        reviewerId: "",
        isFirstAssign: false,
      });
    }
  };

  return (
    <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm relative">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Task Tracking</h2>
          <p className="text-sm text-gray-400 mt-1">
            Giám sát tiến độ, gia hạn hoặc giao việc cho nhân sự.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm theo Task Name hoặc ID..."
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
                <th className="px-4 py-3 rounded-tl-lg font-medium">
                  Task Info
                </th>
                <th className="px-4 py-3 font-medium">Tiến độ</th>
                <th className="px-4 py-3 font-medium">Nhân sự (Ann / Rev)</th>
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
                  const targetId = task.taskID || task.taskId || task.id;
                  const taskName = task.taskName || `Task #${targetId}`;
                  const rateComplete = task.rateComplete || 0;
                  const totalItems = task.totalItems || 0;

                  const isUnassigned = !task.annotatorID;

                  // TỰ ĐỘNG DÒ TÊN TỪ DANH SÁCH CÓ SẴN (Phòng hờ BE quên trả tên)
                  const matchedAnn = annotators.find(
                    (a) => a.userID === task.annotatorID,
                  );
                  const matchedRev = reviewers.find(
                    (r) => r.userID === task.reviewerID,
                  );

                  // Bọc lót 3 lớp để đảm bảo không bao giờ hiện lỗi
                  const annName = isUnassigned
                    ? "Chưa giao"
                    : task.annotatorName ||
                      matchedAnn?.fullName ||
                      `User ID: ${task.annotatorID.substring(0, 8)}...`;

                  const revName = !task.reviewerID
                    ? "---"
                    : task.reviewerName ||
                      matchedRev?.fullName ||
                      `User ID: ${task.reviewerID.substring(0, 8)}...`;

                  const status = task.status || "Unknown";

                  return (
                    <tr key={targetId || idx} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-200">
                          {taskName}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          ID: {targetId}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${rateComplete}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {rateComplete}% ({totalItems} items)
                          </span>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${getStatusColor(status)}`}
                          >
                            {status === "0" ? "In Progress" : status}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div
                          className={`font-medium ${isUnassigned ? "text-amber-500" : "text-gray-300"}`}
                        >
                          {annName}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Rev: {revName}
                        </div>
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
                            if (!targetId)
                              return alert(
                                "Task này chưa có ID, không thể thao tác!",
                              );
                            const newDate = prompt(
                              "Nhập ngày gia hạn mới (YYYY-MM-DD):",
                              task.deadline ? task.deadline.split("T")[0] : "",
                            );
                            if (newDate) {
                              try {
                                const isoString = new Date(
                                  newDate,
                                ).toISOString();
                                extendDeadline(targetId, isoString);
                              } catch (err) {
                                alert("Định dạng ngày không hợp lệ!");
                              }
                            }
                          }}
                          disabled={isActionLoading || !targetId}
                          className="text-xs px-3 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors disabled:opacity-50"
                        >
                          Extend
                        </button>

                        <button
                          onClick={() => {
                            if (!targetId)
                              return alert(
                                "Task này chưa có ID, không thể thao tác!",
                              );
                            setReassignModal({
                              show: true,
                              taskId: targetId,
                              annotatorId: task.annotatorID || "",
                              reviewerId: task.reviewerID || "",
                              isFirstAssign: isUnassigned,
                            });
                          }}
                          disabled={isActionLoading || !targetId}
                          className={`text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50 ${isUnassigned ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold" : "bg-white/5 hover:bg-white/10 text-gray-300"}`}
                        >
                          {isUnassigned ? "Assign" : "Reassign"}
                        </button>

                        <button
                          onClick={() => {
                            if (!targetId) return;
                            if (
                              window.confirm(
                                "Bạn có chắc chắn muốn thu hồi (Revoke) task này về kho không?",
                              )
                            )
                              revoke(targetId);
                          }}
                          disabled={isActionLoading || !targetId}
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

      {reassignModal.show && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B1120]/80 backdrop-blur-sm rounded-xl">
          <div className="bg-[#151D2F] border border-white/10 p-6 rounded-xl shadow-2xl w-[400px]">
            <h3 className="text-lg font-semibold text-white mb-4">
              {reassignModal.isFirstAssign
                ? "Giao việc cho Task"
                : "Giao lại Task"}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Chọn Annotator
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
                    <option key={u.userID} value={u.userID}>
                      {u.fullName} {u.score ? `(Score: ${u.score})` : ""} -{" "}
                      {u.expertise || "Cơ bản"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Chọn Reviewer
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
                    <option key={u.userID} value={u.userID}>
                      {u.fullName} {u.score ? `(Score: ${u.score})` : ""}
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
                    isFirstAssign: false,
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
