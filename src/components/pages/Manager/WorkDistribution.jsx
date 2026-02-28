import React, { useState } from "react";

export default function WorkDistribution() {
  const tasks = [
    "IMG_0001.jpg",
    "IMG_0002.jpg",
    "IMG_0003.jpg",
    "IMG_0004.jpg",
    "IMG_0005.jpg",
  ];
  const [selectedTasks, setSelectedTasks] = useState([]);

  const toggleTask = (task) => {
    setSelectedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task],
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cột 1: Chọn Task (Checkboxes) */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col h-[500px]">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Unassigned Files
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Select files to create a batch task
            </p>
          </div>
          <span className="text-sm text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
            {selectedTasks.length} selected
          </span>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-2">
          {tasks.map((task, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${selectedTasks.includes(task) ? "border-blue-500 bg-blue-500/10" : "border-white/5 bg-[#1E293B] hover:border-white/20"}`}
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded bg-[#0B1120] border-white/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-[#1E293B]"
                checked={selectedTasks.includes(task)}
                onChange={() => toggleTask(task)}
              />
              <span className="text-gray-300 text-sm">{task}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cột 2: Form Gán Việc & Deadline */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm h-fit">
        <h2 className="text-lg font-semibold text-white mb-6">
          Task Assignment
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Assign to Annotator
            </label>
            <select className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-blue-500">
              <option value="">-- Select Annotator --</option>
              <option>Sarah Annotator (Score: 95)</option>
              <option>Lisa Annotator (Score: 70)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Assign to Reviewer
            </label>
            <select className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-blue-500">
              <option value="">-- Select Reviewer --</option>
              <option>Mike Reviewer (Score: 100)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Deadline
            </label>
            <input
              type="date"
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-blue-500 [color-scheme:dark]"
            />
          </div>

          <button
            disabled={selectedTasks.length === 0}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:text-gray-400 text-white py-3 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
          >
            Create Task Batch
          </button>
        </div>
      </div>
    </div>
  );
}
