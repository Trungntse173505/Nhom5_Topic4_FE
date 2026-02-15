import React from "react";

export default function LabelSetEditor() {
  const existingLabels = [
    { name: "Vehicle", color: "#3B82F6", bgClass: "bg-blue-500" },
    { name: "Pedestrian", color: "#10B981", bgClass: "bg-emerald-500" },
    { name: "Traffic Sign", color: "#F59E0B", bgClass: "bg-amber-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Column 1: Label Classes */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Label Classes</h2>
          <p className="text-sm text-gray-400 mt-1">
            Define object classes for annotation
          </p>
        </div>

        {/* Existing Labels */}
        <div className="space-y-3 mb-8">
          {existingLabels.map((label, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center rounded-xl border border-white/5 bg-[#1E293B] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${label.bgClass}`}></div>
                <span className="text-sm text-gray-200">{label.name}</span>
              </div>
              <button className="text-gray-500 hover:text-rose-400 transition-colors">
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

        {/* Add New Label Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Label Name
            </label>
            <input
              type="text"
              placeholder="e.g., Vehicle"
              className="w-full rounded-lg border border-white/10 bg-[#0B1120] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Color
            </label>
            <div className="flex gap-3">
              <div className="flex h-[42px] w-[50px] items-center justify-center rounded-lg border border-white/10 bg-[#0B1120]">
                <div className="w-6 h-6 rounded bg-blue-500"></div>
              </div>
              <input
                type="text"
                defaultValue="#3b82f6"
                className="flex-1 rounded-lg border border-white/10 bg-[#0B1120] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-colors mt-2">
            + Add Label Class
          </button>
        </div>
      </div>

      {/* Column 2: Annotation Guidelines */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Annotation Guidelines
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Instructions for annotators
          </p>
        </div>

        <div className="mb-6">
          <textarea
            className="w-full h-[280px] rounded-xl border border-white/10 bg-[#1E293B] p-4 text-sm text-gray-300 outline-none focus:border-blue-500/50 resize-none leading-relaxed"
            defaultValue={`1. Ensure all bounding boxes are tight and accurate\n2. Label all visible objects, even if partially occluded\n3. Use polygon tool for irregular shapes\n4. Verify labels before submission`}
          />
        </div>

        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
          Save Guidelines
        </button>
      </div>
    </div>
  );
}
