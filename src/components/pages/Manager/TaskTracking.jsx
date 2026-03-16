import React, { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTaskTracking } from "../../../hooks/Manager/useTaskTracking";
import { useLabelManagement } from "../../../hooks/Manager/useLabelManagement";

// =====================================================================
// BÍ KÍP 3: ĐÓNG BĂNG TỪNG DÒNG TASK
// =====================================================================
const TaskRowItem = React.memo(
  ({
    task,
    annotators,
    reviewers,
    onExtend,
    onAssign,
    onRevoke,
    isActionLoading,
  }) => {
    const targetId = task.taskID || task.taskId || task.id;
    const taskName = task.taskName || `Task #${targetId}`;
    const rateComplete = task.rateComplete || 0;
    const totalItems = task.totalItems || 0;
    const isUnassigned = !task.annotatorID;

    const matchedAnn = annotators.find((a) => a.userID === task.annotatorID);
    const matchedRev = reviewers.find((r) => r.userID === task.reviewerID);

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

    const getStatusColor = (s) => {
      const st = (s || "").toLowerCase();
      if (st === "0" || st.includes("progress"))
        return "bg-amber-500/10 text-amber-400";
      if (st.includes("pending") || st.includes("review"))
        return "bg-purple-500/10 text-purple-400";
      if (st.includes("reject")) return "bg-rose-500/10 text-rose-400";
      if (
        st.includes("approve") ||
        st.includes("done") ||
        st.includes("complete")
      )
        return "bg-emerald-500/10 text-emerald-400";
      return "bg-gray-500/10 text-gray-400";
    };

    return (
      <tr className="hover:bg-white/[0.02]">
        <td className="px-4 py-4">
          <div className="font-medium text-gray-200">{taskName}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">ID: {targetId}</div>
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
          <div className="text-xs text-gray-500 mt-0.5">Rev: {revName}</div>
        </td>
        <td className="px-4 py-4">
          <div
            className={`text-sm ${task.isOverdue ? "text-rose-400 font-bold" : "text-gray-300"}`}
          >
            {task.deadline
              ? new Date(task.deadline).toLocaleDateString("vi-VN")
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
            onClick={() => onExtend(targetId, task.deadline)}
            disabled={isActionLoading || !targetId}
            className="text-xs px-3 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors disabled:opacity-50"
          >
            Extend
          </button>
          <button
            onClick={() => onAssign(targetId, task, isUnassigned)}
            disabled={isActionLoading || !targetId}
            className={`text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50 ${isUnassigned ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold" : "bg-white/5 hover:bg-white/10 text-gray-300"}`}
          >
            {isUnassigned ? "Assign" : "Reassign"}
          </button>
          <button
            onClick={() => onRevoke(targetId)}
            disabled={isActionLoading || !targetId}
            className="text-xs px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50"
          >
            Revoke
          </button>
        </td>
      </tr>
    );
  },
);

export default function TaskTracking({ project, setActiveTab }) {
  const { projectId: paramId } = useParams();
  const projectId = paramId || project?.projectID || project?.id;
  const navigate = useNavigate();

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

  const { projectLabels, isLoading: isLabelLoading } =
    useLabelManagement(projectId);

  const [searchTerm, setSearchTerm] = useState("");

  const [reassignModal, setReassignModal] = useState({
    show: false,
    taskId: null,
    annotatorId: "",
    reviewerId: "",
    isFirstAssign: false,
  });

  // BÍ KÍP 1: useMemo chống lag khi gõ tìm kiếm
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const searchString = `${t.taskID} ${t.taskName}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  }, [tasks, searchTerm]);

  // BÍ KÍP 2: Đóng băng các hành động thao tác Task
  const submitReassign = useCallback(async () => {
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
  }, [reassignModal, reassignTask]);

  const handleOpenAssignModal = useCallback(
    (targetId, task, isUnassigned) => {
      if (!targetId) return alert("Task này chưa có ID, không thể thao tác!");
      if (!projectLabels || projectLabels.length === 0) {
        if (
          window.confirm(
            "Cảnh báo: Dự án này chưa có Bộ Nhãn (Label) nào!\nNhân sự sẽ không thể làm việc nếu không có nhãn. Bạn có muốn chuyển sang mục 'Chỉnh sửa Bộ nhãn' để thêm không?",
          )
        ) {
          if (setActiveTab) setActiveTab("labels");
          else
            alert(
              "Vui lòng vào mục 'Chỉnh sửa Bộ nhãn' ở thanh menu trên cùng để thêm nhãn trước!",
            );
        }
        return;
      }
      setReassignModal({
        show: true,
        taskId: targetId,
        annotatorId: task.annotatorID || "",
        reviewerId: task.reviewerID || "",
        isFirstAssign: isUnassigned,
      });
    },
    [projectLabels, setActiveTab],
  );

  const handleExtend = useCallback(
    (targetId, currentDeadline) => {
      if (!targetId) return alert("Task này chưa có ID, không thể thao tác!");
      const newDate = prompt(
        "Nhập ngày gia hạn mới (YYYY-MM-DD):",
        currentDeadline ? currentDeadline.split("T")[0] : "",
      );
      if (newDate) {
        try {
          const isoString = new Date(newDate).toISOString();
          extendDeadline(targetId, isoString);
        } catch (err) {
          alert("Định dạng ngày không hợp lệ!");
        }
      }
    },
    [extendDeadline],
  );

  const handleRevoke = useCallback(
    (targetId) => {
      if (!targetId) return;
      if (
        window.confirm(
          "Bạn có chắc chắn muốn thu hồi (Revoke) task này về kho không?",
        )
      )
        revoke(targetId);
    },
    [revoke],
  );

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

      {!isLabelLoading && projectLabels.length === 0 && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm flex items-center gap-2">
          <span>⚠️</span> <strong>Lưu ý:</strong> Vui lòng tạo Bộ nhãn (Label)
          trước khi thực hiện giao Task cho nhân sự.
        </div>
      )}

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
                filteredTasks.map((task, idx) => (
                  <TaskRowItem
                    key={task.taskID || task.taskId || task.id || idx}
                    task={task}
                    annotators={annotators}
                    reviewers={reviewers}
                    isActionLoading={isActionLoading || isLabelLoading}
                    onExtend={handleExtend}
                    onAssign={handleOpenAssignModal}
                    onRevoke={handleRevoke}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {reassignModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#151D2F] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {reassignModal.isFirstAssign
                    ? "Giao việc cho nhân sự"
                    : "Chuyển giao lại Task"}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Chọn người dán nhãn (bắt buộc) và người kiểm duyệt (tùy chọn)
                  từ danh sách gợi ý.
                </p>
              </div>
              <button
                onClick={() =>
                  setReassignModal({ ...reassignModal, show: false })
                }
                className="text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🧑‍💻</span>
                  <h4 className="text-base font-semibold text-white">
                    Gợi ý Annotator <span className="text-rose-500">*</span>
                  </h4>
                </div>
                <div className="space-y-3">
                  {annotators.length === 0 ? (
                    <div className="text-sm text-gray-500 italic p-4 border border-dashed border-white/10 rounded-xl text-center">
                      Không có Annotator nào.
                    </div>
                  ) : (
                    annotators.map((u) => {
                      const isSelected = reassignModal.annotatorId === u.userID;
                      return (
                        <div
                          key={u.userID}
                          onClick={() =>
                            setReassignModal({
                              ...reassignModal,
                              annotatorId: u.userID,
                            })
                          }
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? "bg-blue-500/10 border-blue-500" : "bg-[#0B1120] border-white/5 hover:border-white/20"}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div
                                className={`font-medium ${isSelected ? "text-blue-400" : "text-gray-200"}`}
                              >
                                {u.fullName}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Chuyên môn: {u.expertise || "Cơ bản"}
                              </div>
                            </div>
                            {u.score && (
                              <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded text-xs font-medium text-amber-400">
                                <span>⭐</span> {u.score}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">👁️</span>
                  <h4 className="text-base font-semibold text-white">
                    Gợi ý Reviewer (Tùy chọn)
                  </h4>
                </div>
                <div className="space-y-3">
                  <div
                    onClick={() =>
                      setReassignModal({ ...reassignModal, reviewerId: "" })
                    }
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${reassignModal.reviewerId === "" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-[#0B1120] border-white/5 hover:border-white/20 text-gray-400"}`}
                  >
                    <div className="font-medium text-sm">
                      -- Không cần kiểm duyệt --
                    </div>
                  </div>
                  {reviewers.map((u) => {
                    const isSelected = reassignModal.reviewerId === u.userID;
                    return (
                      <div
                        key={u.userID}
                        onClick={() =>
                          setReassignModal({
                            ...reassignModal,
                            reviewerId: u.userID,
                          })
                        }
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? "bg-purple-500/10 border-purple-500" : "bg-[#0B1120] border-white/5 hover:border-white/20"}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div
                              className={`font-medium ${isSelected ? "text-purple-400" : "text-gray-200"}`}
                            >
                              {u.fullName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Chuyên môn: {u.expertise || "Cơ bản"}
                            </div>
                          </div>
                          {u.score && (
                            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded text-xs font-medium text-amber-400">
                              <span>⭐</span> {u.score}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-[#0B1120]/50 flex justify-end gap-3">
              <button
                onClick={() =>
                  setReassignModal({ ...reassignModal, show: false })
                }
                className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitReassign}
                disabled={isActionLoading || !reassignModal.annotatorId}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
              >
                {isActionLoading ? "Đang xử lý..." : "Xác nhận giao Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
