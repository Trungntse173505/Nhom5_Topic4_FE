import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLabelManagement } from "../../../hooks/useLabelManagement";
import { useProjectActions } from "../../../hooks/useProjectActions";

export default function LabelSetEditor({ project, onRefresh }) {
  const { projectId } = useParams();

  const {
    libraryLabels,
    projectLabels,
    isLoading,
    importFromLib,
    createCustom,
    removeLabel,
  } = useLabelManagement(projectId);

  const { isActionLoading, handleUpdateGuideline } =
    useProjectActions(projectId);

  const [newLabel, setNewLabel] = useState({ name: "", color: "#3B82F6" });
  const [guideline, setGuideline] = useState(project?.guidelineUrl || "");

  useEffect(() => {
    if (project?.guidelineUrl) setGuideline(project.guidelineUrl);
  }, [project]);

  // HÀM TẠO NHÃN TÙY CHỈNH (ĐÃ FIX THEO SWAGGER)
  const handleAddCustom = async () => {
    if (!newLabel.name) return;

    // Gửi đúng tên biến mà Backend yêu cầu
    const payload = {
      labelName: newLabel.name,
      defaultColor: newLabel.color,
      // Bọc lót thêm 2 biến này phòng khi API /custom của BE dùng tên khác
      customName: newLabel.name,
      colorCode: newLabel.color,
    };

    const success = await createCustom(payload);
    if (success) setNewLabel({ name: "", color: "#3B82F6" });
  };

  const saveGuideline = () => {
    handleUpdateGuideline(guideline, onRefresh);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KHỐI 1: KHO NHÃN MẪU (LIBRARY) */}
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col h-[500px]">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Label Library</h2>
            <p className="text-sm text-gray-400 mt-1">
              Chọn nhãn có sẵn từ hệ thống
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {libraryLabels.map((lib, idx) => {
              // LẤY ĐÚNG TÊN BIẾN TỪ SWAGGER
              const targetId = lib.labelID || lib.id;
              const targetName = lib.labelName || lib.name || "Unnamed";
              const targetColor = lib.defaultColor || lib.color || "#64748b";

              return (
                <div
                  key={targetId || idx}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0B1120] p-3 h-[48px]"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: targetColor }}
                    ></div>
                    <span className="text-xs text-gray-300 truncate max-w-[80px]">
                      {targetName}
                    </span>
                  </div>
                  <button
                    onClick={() => importFromLib([targetId])}
                    className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/40 transition-all flex-shrink-0"
                  >
                    Import
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* KHỐI 2: NHÃN DỰ ÁN & TẠO MỚI */}
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col h-[500px]">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Active Project Labels
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Các nhãn đang được dùng trong dự án này
            </p>
          </div>

          <div className="space-y-3 mb-8 overflow-y-auto pr-2 flex-1">
            {projectLabels.length === 0 ? (
              <p className="text-center text-gray-600 text-sm py-4">
                Chưa có nhãn nào. Hãy thêm ở dưới!
              </p>
            ) : (
              projectLabels.map((label, idx) => {
                // BỌC LÓT CHO DANH SÁCH NHÃN DỰ ÁN
                const targetId =
                  label.projectLabelId || label.labelID || label.id;
                const targetName =
                  label.customName ||
                  label.labelName ||
                  label.name ||
                  "Unnamed";
                const targetColor =
                  label.colorCode ||
                  label.defaultColor ||
                  label.color ||
                  "#64748b";

                return (
                  <div
                    key={targetId || idx}
                    className="flex justify-between items-center rounded-xl border border-white/5 bg-[#1E293B] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded flex-shrink-0"
                        style={{ backgroundColor: targetColor }}
                      ></div>
                      <span className="text-sm text-gray-200">
                        {targetName}
                      </span>
                    </div>
                    <button
                      onClick={() => removeLabel(targetId)}
                      className="text-gray-500 hover:text-rose-400 transition-colors flex-shrink-0"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Form tạo nhãn tùy chỉnh */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <input
              type="text"
              value={newLabel.name}
              onChange={(e) =>
                setNewLabel({ ...newLabel, name: e.target.value })
              }
              placeholder="Custom Label Name..."
              className="w-full rounded-lg border border-white/10 bg-[#0B1120] px-4 py-2 text-sm text-white outline-none focus:border-blue-500/50"
            />
            <div className="flex gap-3">
              <input
                type="color"
                value={newLabel.color}
                onChange={(e) =>
                  setNewLabel({ ...newLabel, color: e.target.value })
                }
                className="h-[40px] w-[60px] rounded-lg border border-white/10 bg-[#0B1120] p-1 cursor-pointer"
              />
              <button
                onClick={handleAddCustom}
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Create Custom Label
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KHỐI 3: ANNOTATION GUIDELINES */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Annotation Guidelines
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Hướng dẫn chi tiết cho Annotator
            </p>
          </div>
          <button
            onClick={saveGuideline}
            disabled={isActionLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            {isActionLoading ? "Saving..." : "Save Guidelines"}
          </button>
        </div>
        <textarea
          value={guideline}
          onChange={(e) => setGuideline(e.target.value)}
          className="w-full h-[200px] rounded-xl border border-white/10 bg-[#0B1120] p-4 text-sm text-gray-300 outline-none focus:border-blue-500/50 resize-none leading-relaxed"
          placeholder="Viết hướng dẫn tại đây (Ví dụ: 1. Vẽ box sát đối tượng...)"
        />
      </div>
    </div>
  );
}
