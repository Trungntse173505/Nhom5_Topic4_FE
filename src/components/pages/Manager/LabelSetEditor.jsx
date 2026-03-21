// Đường dẫn: src/pages/Manager/ProjectSettings/LabelSetEditor.jsx (Hoặc tương tự)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useLabelManagement } from "../../../hooks/Manager/useLabelManagement";
import { useProjectActions } from "../../../hooks/Manager/useProjectActions";
import { CardSpotlight } from "../../common/card-spotlight";

import { getLabelDisplay, normalizeText } from "../../../utils/aiHelper";
import { VI_TO_EN_DICT } from "../../../utils/dictionary";

const CategoryAccordion = React.memo(
  ({ category, labels, isExpanded, onToggle, projectLabels, onImport }) => {
    const totalLabels = labels.length;

    return (
      <div className="bg-[#0B1120] border border-white/5 rounded-xl overflow-hidden transition-all duration-300">
        <button
          onClick={() => onToggle(category)}
          className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isExpanded ? "bg-[#1E293B]" : "hover:bg-white/5"}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
              {category}
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">
              {totalLabels}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180 text-blue-400" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
        >
          <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 border-t border-white/5 pt-4">
            {labels.map((lib, idx) => {
              const targetId = lib.labelID || lib.id;
              const targetName = lib.labelName || lib.name || "Không tên";
              const targetColor = lib.defaultColor || lib.color || "#64748b";

              const isImported = projectLabels.some(
                (pl) =>
                  pl.labelID === targetId ||
                  pl.projectLabelID === targetId ||
                  pl.projectLabelId === targetId ||
                  pl.id === targetId,
              );

              return (
                <div
                  key={targetId || idx}
                  className={`flex items-center justify-between rounded-lg border p-2.5 h-[40px] transition-colors ${isImported ? "border-emerald-500/30 bg-emerald-500/5 cursor-not-allowed" : "border-white/10 bg-[#151D2F] hover:border-white/30"}`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: targetColor }}
                    ></div>
                    <span
                      className={`text-xs truncate max-w-[80px] ${isImported ? "text-gray-500" : "text-gray-300"}`}
                      title={targetName}
                    >
                      {getLabelDisplay(targetName)}
                    </span>
                  </div>
                  {!isImported ? (
                    <button
                      onClick={() => onImport([targetId])}
                      className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/40 transition-all flex-shrink-0"
                    >
                      Nhập
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 flex-shrink-0 font-bold">
                      ✔ Đã thêm
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

const ProjectLabelItem = React.memo(({ label, onRemove }) => {
  // 👉 FIX: Đã thêm chính xác chữ `projectLabelID` (Chữ ID viết hoa) theo đúng cấu trúc BE trả về!
  const targetId =
    label.projectLabelID || label.projectLabelId || label.id || label.labelID;

  const targetName =
    label.customName || label.labelName || label.name || "Không tên";
  const targetColor =
    label.colorCode || label.defaultColor || label.color || "#64748b";

  return (
    <div className="flex justify-between items-center rounded-xl border border-white/5 bg-[#1E293B] px-4 py-3 group hover:border-white/20 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded flex-shrink-0"
          style={{ backgroundColor: targetColor }}
        ></div>
        <span className="text-sm text-gray-200" title={targetName}>
          {getLabelDisplay(targetName)}
        </span>

        {label.isCustom && (
          <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Tùy chỉnh
          </span>
        )}
      </div>
      <button
        onClick={() => {
          console.log("🛠 Đang gửi ID này xuống BE để xóa:", targetId);
          onRemove(targetId);
        }}
        className="text-gray-500 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all flex-shrink-0"
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
});

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

  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    if (project?.guidelineUrl) setGuideline(project.guidelineUrl);
  }, [project]);

  const groupedLibrary = useMemo(() => {
    return libraryLabels.reduce((acc, label) => {
      const cat = label.category || "Chưa phân loại";

      if (cat.toUpperCase() === "PROJECT_CUSTOM") return acc;

      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(label);
      return acc;
    }, {});
  }, [libraryLabels]);

  const handleAddCustom = useCallback(async () => {
    if (!newLabel.name) return;

    const cleanInput = normalizeText(newLabel.name);
    const mappedName = VI_TO_EN_DICT[cleanInput] || newLabel.name;

    const payload = {
      labelName: mappedName,
      defaultColor: newLabel.color,
      customName: mappedName,
      colorCode: newLabel.color,
      url: "",
    };
    const success = await createCustom(payload);
    if (success) setNewLabel({ name: "", color: "#3B82F6" });
  }, [newLabel, createCustom]);

  const saveGuideline = useCallback(() => {
    handleUpdateGuideline(guideline, onRefresh);
  }, [guideline, handleUpdateGuideline, onRefresh]);

  const toggleCategory = useCallback((category) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSpotlight className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col h-[500px]">
          <div className="mb-6 relative z-10">
            <h2 className="text-lg font-semibold text-white">Kho Nhãn Mẫu</h2>
            <p className="text-sm text-gray-400 mt-1">
              Bấm vào chủ đề để xem và Nhập nhãn
            </p>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {Object.keys(groupedLibrary).length === 0 ? (
              <p className="text-center text-gray-600 text-sm py-10">
                Kho nhãn trống.
              </p>
            ) : (
              Object.keys(groupedLibrary).map((category, catIdx) => (
                <CategoryAccordion
                  key={catIdx}
                  category={category}
                  labels={groupedLibrary[category]}
                  isExpanded={expandedCategory === category}
                  onToggle={toggleCategory}
                  projectLabels={projectLabels}
                  onImport={importFromLib}
                />
              ))
            )}
          </div>
        </CardSpotlight>

        <CardSpotlight className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col h-[500px]">
          <div className="mb-6 relative z-10">
            <h2 className="text-lg font-semibold text-white">Nhãn Của Dự Án</h2>
            <p className="text-sm text-gray-400 mt-1">
              Các nhãn đang được dùng trong dự án này
            </p>
          </div>

          <div className="space-y-3 mb-8 overflow-y-auto pr-2 flex-1 custom-scrollbar">
            {projectLabels.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm">Dự án chưa có nhãn nào.</p>
                <p className="text-gray-600 text-xs mt-1">
                  Nhập từ kho bên trái hoặc tạo mới ở dưới.
                </p>
              </div>
            ) : (
              projectLabels.map((label, idx) => (
                <ProjectLabelItem
                  key={
                    label.projectLabelID ||
                    label.projectLabelId ||
                    label.id ||
                    idx
                  }
                  label={label}
                  onRemove={removeLabel}
                />
              ))
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <input
              type="text"
              value={newLabel.name}
              onChange={(e) =>
                setNewLabel({ ...newLabel, name: e.target.value })
              }
              placeholder="VD: Ô tô, Người..."
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
                + Tạo Nhãn Tùy Chỉnh
              </button>
            </div>
          </div>
        </CardSpotlight>
      </div>
    </div>
  );
}
