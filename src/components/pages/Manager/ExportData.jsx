import React, { useState } from "react";

export default function ExportData() {
  const [format, setFormat] = useState("YOLO");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Export Dataset</h1>
        <p className="text-sm text-gray-400 mt-1">
          Download approved annotations in your preferred format
        </p>
      </div>

      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-8 shadow-sm max-w-2xl">
        <div className="space-y-6">
          {/* Chọn dự án */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Project
            </label>
            <select className="w-full rounded-lg border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50">
              <option>Phân loại biển báo giao thông</option>
              <option>Gán nhãn cảm xúc hội thoại</option>
            </select>
          </div>

          {/* Chọn định dạng */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["YOLO", "VOC", "JSON", "CSV"].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${format === fmt ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-white/10 bg-[#0B1120] text-gray-400 hover:border-white/20"}`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Thông tin Export */}
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span className="text-sm font-medium">Ready to Export</span>
            </div>
            <p className="text-xs text-emerald-500/70">
              275 Approved tasks will be compiled into a .zip file.
            </p>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              ></path>
            </svg>
            Download Dataset
          </button>
        </div>
      </div>
    </div>
  );
}
