import React from "react";

export default function DatasetUpload() {
  return (
    <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">
          Bulk Dataset Upload
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Upload images and annotations for labeling
        </p>
      </div>

      {/* Drop Zone */}
      <div className="border-2 border-dashed border-white/10 rounded-xl p-16 flex flex-col items-center justify-center text-center transition-colors hover:border-blue-500/50 hover:bg-white/[0.02] cursor-pointer">
        <div className="mb-4 text-gray-400">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
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
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          Select Files
        </button>
      </div>
    </div>
  );
}
