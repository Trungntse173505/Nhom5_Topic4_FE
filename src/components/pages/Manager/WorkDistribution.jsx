import React, { useState, useCallback } from "react";
import { useWorkDistribution } from "../../../hooks/Manager/useWorkDistribution";
import { AnimatedButton } from "../../common/AnimatedButton";
import { CardSpotlight } from "../../common/card-spotlight";
import {
  FILE_TYPE_COLORS,
  FILE_TYPE_LABELS,
  FILE_TYPE_ICONS,
  groupDataByType,
} from "../../../utils/fileTypeDetector";

export default function WorkDistribution({ project, onRefresh }) {
  const projectId = project?.projectID || project?.id;

  const { unassignedItems, isLoading, isProcessing, createBatch } =
    useWorkDistribution(projectId, onRefresh);

  const [selectedIds, setSelectedIds] = useState([]);
  const [taskData, setTaskData] = useState({ taskName: "", deadline: "" });

  // ✅ State để track expand/collapse các group
  const [expandedGroups, setExpandedGroups] = useState({
    IMAGE: true,
    VIDEO: true,
    AUDIO: true,
    TEXT: true,
    OTHER: false,
  });

  const toggleSelection = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const toggleGroup = useCallback((typeKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [typeKey]: !prev[typeKey],
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!taskData.taskName || !taskData.deadline) {
      alert("Vui lòng nhập Tên Task và Hạn chót!");
      return;
    }

    // 👉 CHỐT CHẶN NGÀY QUÁ KHỨ (Xử lý gõ tay)
    const selectedDate = new Date(taskData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset giờ về 0h để so sánh đúng ngày

    if (selectedDate < today) {
      alert("⚠️ Lỗi: Không thể chọn hạn chót (deadline) ở trong quá khứ!");
      return;
    }

    const success = await createBatch(
      selectedIds,
      taskData.taskName,
      taskData.deadline,
    );
    if (success) {
      alert(
        "Tạo Task thành công! Vui lòng sang tab Theo dõi Nhiệm vụ (Task Tracking) để giao việc.",
      );
      setSelectedIds([]);
      setTaskData({ taskName: "", deadline: "" });
    }
  }, [taskData, selectedIds, createBatch]);

  // Lấy ngày giờ hiện tại dưới dạng YYYY-MM-DDThh:mm để khóa lịch HTML (có tính toán múi giờ local)
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  const todayString = new Date(Date.now() - tzOffset)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CỘT 1: CHỌN FILE */}
      <CardSpotlight className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col h-[500px]">
        <div className="mb-4 flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Dữ Liệu Chưa Phân Công
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Chọn file để tạo lô công việc mới
            </p>
          </div>
          <span className="text-sm text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full font-medium">
            Đã chọn {selectedIds.length}
          </span>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-20 text-gray-500 text-sm">
              Đang tải dữ liệu...
            </div>
          ) : unassignedItems.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-sm">
              Kho dữ liệu trống.
            </div>
          ) : (
            /* ✅ Render grouped data với collapse/expand */
            (() => {
              const grouped = groupDataByType(unassignedItems);
              const typeOrder = ["IMAGE", "VIDEO", "AUDIO", "TEXT", "OTHER"];

              return typeOrder.map((typeKey) => {
                const itemsInGroup = grouped[typeKey];
                if (!itemsInGroup || itemsInGroup.length === 0) return null;

                const isExpanded = expandedGroups[typeKey];
                const typeLabel = FILE_TYPE_LABELS[typeKey];
                const typeIcon = FILE_TYPE_ICONS[typeKey];
                const typeColor = FILE_TYPE_COLORS[typeKey];

                return (
                  <div
                    key={typeKey}
                    className="border border-white/10 rounded-lg overflow-hidden relative z-10"
                  >
                    {/* Group Header - Collapsible */}
                    <button
                      onClick={() => toggleGroup(typeKey)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#0B1120] hover:bg-[#151D2F] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${typeColor}`}
                        >
                          {typeIcon} {typeLabel}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {itemsInGroup.length} file
                        </span>
                      </div>
                      <span className="text-gray-400 transition-transform">
                        {isExpanded ? "▼" : "▶"}
                      </span>
                    </button>

                    {/* Group Items - Table Format */}
                    {isExpanded && (
                      <table className="w-full text-left text-sm">
                        <thead className="text-gray-400 border-t border-white/5 text-xs">
                          <tr>
                            <th className="px-3 py-2 font-medium w-8">
                              <input
                                type="checkbox"
                                checked={itemsInGroup.every((item) =>
                                  selectedIds.includes(
                                    item.dataItemId || item.id || item.dataID,
                                  ),
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const newIds = itemsInGroup.map(
                                      (item) =>
                                        item.dataItemId ||
                                        item.id ||
                                        item.dataID,
                                    );
                                    setSelectedIds((prev) => [
                                      ...prev,
                                      ...newIds.filter(
                                        (id) => !prev.includes(id),
                                      ),
                                    ]);
                                  } else {
                                    const itemIds = itemsInGroup.map(
                                      (item) =>
                                        item.dataItemId ||
                                        item.id ||
                                        item.dataID,
                                    );
                                    setSelectedIds((prev) =>
                                      prev.filter(
                                        (id) => !itemIds.includes(id),
                                      ),
                                    );
                                  }
                                }}
                                className="w-4 h-4 rounded cursor-pointer"
                              />
                            </th>
                            <th className="px-3 py-2 font-medium">Tên File</th>
                            <th className="px-3 py-2 font-medium">
                              Trạng thái
                            </th>
                            <th className="px-3 py-2 font-medium text-right">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {itemsInGroup.map((item, idx) => {
                            const targetId =
                              item.dataItemId || item.id || item.dataID;
                            const isSelected = selectedIds.includes(targetId);
                            return (
                              <tr
                                key={targetId || idx}
                                className="hover:bg-white/[0.02] transition-colors"
                              >
                                <td className="px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelection(targetId)}
                                    className="w-4 h-4 rounded cursor-pointer"
                                  />
                                </td>
                                <td className="px-3 py-2 text-gray-200 truncate max-w-xs">
                                  <a
                                    href={
                                      item.filePath ||
                                      item.fileUrl ||
                                      item.url ||
                                      ""
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                    title={item.displayName || item.fileName}
                                  >
                                    {item.displayName ||
                                      item.fileName ||
                                      "File"}
                                  </a>
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      item.isAssigned === true
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-gray-500/10 text-gray-400"
                                    }`}
                                  >
                                    {item.isAssigned === true
                                      ? "Đã giao"
                                      : "Chưa giao"}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {item.filePath || item.fileUrl || item.url ? (
                                    <a
                                      href={
                                        item.filePath ||
                                        item.fileUrl ||
                                        item.url
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors text-xs"
                                    >
                                      Xem
                                    </a>
                                  ) : null}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              });
            })()
          )}
        </div>
      </CardSpotlight>

      {/* CỘT 2: FORM TẠO TASK */}
      <CardSpotlight className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm h-fit">
        <h2 className="text-lg font-semibold text-white mb-6 relative z-10">
          Tạo Nhiệm Vụ Mới
        </h2>

        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Tên Nhiệm Vụ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Lô ảnh xe cộ đợt 1"
              value={taskData.taskName}
              onChange={(e) =>
                setTaskData({ ...taskData, taskName: e.target.value })
              }
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Hạn chót <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local" // 👉 ĐỔI THÀNH DATETIME-LOCAL Ở ĐÂY NÈ SẾP
              value={taskData.deadline}
              min={todayString} // 👉 Khóa lịch bằng cái biến todayString vừa tút lại ở trên
              onChange={(e) =>
                setTaskData({ ...taskData, deadline: e.target.value })
              }
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-blue-500 [color-scheme:dark]"
            />
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <AnimatedButton
              onClick={handleSubmit}
              disabled={selectedIds.length === 0 || isProcessing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 hover:ring-emerald-500 shadow-emerald-500/20"
            >
              Tạo Nhiệm Vụ ({selectedIds.length} file)
            </AnimatedButton>
          </div>
        </div>
      </CardSpotlight>
    </div>
  );
}
