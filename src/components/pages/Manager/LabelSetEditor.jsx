import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useProjectActions } from "../../../hooks/useProjectActions";

export default function LabelSetEditor({ project, onRefresh }) {
  const { projectId } = useParams();

  // 1. Lấy các hàm xử lý từ Hook
  const { isActionLoading, handleUpdateInfo, handleUpdateGuideline } =
    useProjectActions(projectId);

  // State quản lý danh sách nhãn (Khởi tạo từ dữ liệu project nếu có)
  const [labels, setLabels] = useState(
    project?.labels || [
      { name: "Vehicle", color: "#3B82F6", bgClass: "bg-blue-500" },
      { name: "Pedestrian", color: "#10B981", bgClass: "bg-emerald-500" },
    ],
  );

  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3B82F6");

  // State quản lý hướng dẫn (Guideline)
  const [guideline, setGuideline] = useState(project?.guidelineUrl || "");

  // Hàm thêm nhãn mới vào danh sách tạm thời
  const addLabel = () => {
    if (!newLabelName) return;
    setLabels([
      ...labels,
      { name: newLabelName, color: newLabelColor, bgClass: "" },
    ]);
    setNewLabelName("");
  };

  // Hàm xóa nhãn
  const removeLabel = (index) => {
    setLabels(labels.filter((_, i) => i !== index));
  };

  // 2. Hàm gọi API lưu Nhãn dán (Dùng API PUT update project info)
  const saveLabelSet = () => {
    // Giả định BE nhận trường 'labels' trong API PUT
    handleUpdateInfo({ labels: labels }, onRefresh);
  };

  // 3. Hàm gọi API lưu Guideline (Dùng API POST guideline)
  const saveGuideline = () => {
    handleUpdateGuideline(guideline, onRefresh);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Column 1: Label Classes */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">Label Classes</h2>
            <p className="text-sm text-gray-400 mt-1">
              Define object classes for annotation
            </p>
          </div>
          <button
            onClick={saveLabelSet}
            disabled={isActionLoading}
            className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-all"
          >
            {isActionLoading ? "Saving..." : "Save Labels"}
          </button>
        </div>

        <div className="space-y-3 mb-8 max-h-[200px] overflow-y-auto pr-2">
          {labels.map((label, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center rounded-xl border border-white/5 bg-[#1E293B] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded`}
                  style={{ backgroundColor: label.color || "#ccc" }}
                ></div>
                <span className="text-sm text-gray-200">{label.name}</span>
              </div>
              <button
                onClick={() => removeLabel(idx)}
                className="text-gray-500 hover:text-rose-400 transition-colors"
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
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="Label Name (e.g., Traffic Sign)"
            className="w-full rounded-lg border border-white/10 bg-[#0B1120] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
          />
          <div className="flex gap-3">
            <input
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              className="h-[42px] w-[50px] rounded-lg border border-white/10 bg-[#0B1120] p-1 cursor-pointer"
            />
            <input
              type="text"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-[#0B1120] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
            />
          </div>
          <button
            onClick={addLabel}
            className="w-full bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            + Add to List
          </button>
        </div>
      </div>

      {/* Column 2: Annotation Guidelines */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Annotation Guidelines
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Instructions for annotators
          </p>
        </div>

        <div className="flex-1 mb-6">
          <textarea
            value={guideline}
            onChange={(e) => setGuideline(e.target.value)}
            className="w-full h-[300px] rounded-xl border border-white/10 bg-[#1E293B] p-4 text-sm text-gray-300 outline-none focus:border-blue-500/50 resize-none leading-relaxed"
            placeholder="1. Ensure all bounding boxes are tight..."
          />
        </div>

        <button
          onClick={saveGuideline}
          disabled={isActionLoading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {isActionLoading ? "Uploading..." : "Save Guidelines"}
        </button>
      </div>
    </div>
  );
}
