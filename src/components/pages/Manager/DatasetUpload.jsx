import React from "react";

export default function DatasetUpload() {
  const files = [
    {
      name: "IMG_2024_001.jpg",
      size: "2.4 MB",
      date: "2026-02-27",
      status: "Unassigned",
    },
    {
      name: "IMG_2024_002.jpg",
      size: "1.8 MB",
      date: "2026-02-27",
      status: "Assigned",
    },
    {
      name: "batch_01_labels.json",
      size: "15 KB",
      date: "2026-02-26",
      status: "Assigned",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Khối Upload */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Bulk Dataset Upload
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Upload images and annotations for labeling
          </p>
        </div>
        <div className="border-2 border-dashed border-white/10 rounded-xl p-16 flex flex-col items-center justify-center text-center transition-colors hover:border-blue-500/50 hover:bg-white/[0.02] cursor-pointer">
          <div className="mb-4 text-gray-400">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <p className="text-base font-medium text-white mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Supported formats: JPG, PNG, YOLO, VOC
          </p>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all">
            Select Files
          </button>
        </div>
      </div>

      {/* MỚI: Bảng Quản lý Data */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-white mb-4">
          Uploaded Data Management
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0B1120] text-gray-400">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg font-medium">
                  File Name
                </th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Upload Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 rounded-tr-lg font-medium text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {files.map((f, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-gray-200">{f.name}</td>
                  <td className="px-4 py-3 text-gray-500">{f.size}</td>
                  <td className="px-4 py-3 text-gray-500">{f.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${f.status === "Assigned" ? "bg-blue-500/10 text-blue-400" : "bg-gray-500/10 text-gray-400"}`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-400 hover:text-blue-300 text-xs underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
