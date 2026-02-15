import React from "react";

export default function WorkDistribution() {
  const tasks = ["IMG_0001.jpg", "IMG_0002.jpg", "IMG_0003.jpg"];
  const annotators = ["Sarah Annotator", "Lisa Annotator"];
  const reviewers = ["Mike Reviewer"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Column 1: Unassigned Tasks */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Unassigned Tasks</h2>
          <p className="text-sm text-gray-400 mt-1">3 tasks available</p>
        </div>
        <div className="space-y-3">
          {tasks.map((task, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#1E293B] p-4 cursor-grab hover:border-white/20 transition-colors"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="12" r="1" />
                <circle cx="9" cy="5" r="1" />
                <circle cx="9" cy="19" r="1" />
                <circle cx="15" cy="12" r="1" />
                <circle cx="15" cy="5" r="1" />
                <circle cx="15" cy="19" r="1" />
              </svg>
              <span className="text-gray-300 text-sm">{task}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2: Annotators */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Annotators</h2>
          <p className="text-sm text-gray-400 mt-1">Assign labeling tasks</p>
        </div>
        <div className="space-y-4">
          {annotators.map((name, idx) => (
            <div
              key={idx}
              className="border border-dashed border-white/10 rounded-xl p-6 bg-[#0B1120]/50 flex justify-between items-center transition-colors hover:border-white/20"
            >
              <span className="text-sm font-medium text-gray-300">{name}</span>
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1E293B] text-xs text-gray-400 border border-white/5">
                0
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Column 3: Reviewers */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Reviewers</h2>
          <p className="text-sm text-gray-400 mt-1">Assign review tasks</p>
        </div>
        <div className="space-y-4">
          {reviewers.map((name, idx) => (
            <div
              key={idx}
              className="border border-dashed border-white/10 rounded-xl p-6 bg-[#0B1120]/50 flex justify-between items-center transition-colors hover:border-white/20"
            >
              <span className="text-sm font-medium text-gray-300">{name}</span>
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1E293B] text-xs text-gray-400 border border-white/5">
                0
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
