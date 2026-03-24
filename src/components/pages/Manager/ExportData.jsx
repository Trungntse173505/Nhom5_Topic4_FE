import React, { useState } from "react";
import { useExportData } from "../../../hooks/Manager/useExportData";

export default function ExportData() {
  const [format, setFormat] = useState("YOLO"); // Mặc định để YOLO vì đây là định dạng export đang được hỗ trợ

  // Lấy toàn bộ data và hàm từ Hook
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    histories,
    isLoadingProjects,
    isLoadingHistory,
    isExporting,
    handleExport,
  } = useExportData();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Xuất Dữ Liệu</h1>
        <p className="text-sm text-gray-400 mt-1">
          Tải xuống các chú thích đã phê duyệt với định dạng bạn chọn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: FORM XUẤT DỮ LIỆU CỦA ÔNG */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
            <div className="space-y-6">
              {/* Chọn dự án */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Chọn Dự Án
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={isLoadingProjects}
                  className="w-full rounded-lg border border-white/10 bg-[#0B1120] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                >
                  <option value="">-- Chọn một dự án --</option>
                  {projects.map((p) => {
                    const pid = p.projectID || p.id;
                    return (
                      <option key={pid} value={pid}>
                        {p.projectName || "Dự án không tên"}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Chọn định dạng (Chỉ làm màu UI vì API POST /exports chưa nhận params này) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Định Dạng Xuất
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["YOLO", "COCO", "VOC", "JSON", "CSV"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                        format === fmt
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-white/10 bg-[#0B1120] text-gray-400 hover:border-white/20"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thông tin Export */}
              <div
                className={`p-4 rounded-lg border transition-colors ${selectedProjectId ? "bg-emerald-500/10 border-emerald-500/20" : "bg-gray-500/10 border-gray-500/20"}`}
              >
                <div
                  className={`flex items-center gap-2 mb-1 ${selectedProjectId ? "text-emerald-400" : "text-gray-400"}`}
                >
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
                  <span className="text-sm font-medium">
                    {selectedProjectId
                      ? "Sẵn sàng Xuất"
                      : "Chờ sự lựa chọn dự án..."}
                  </span>
                </div>
                <p
                  className={`text-xs ${selectedProjectId ? "text-emerald-500/70" : "text-gray-500"}`}
                >
                  {selectedProjectId
                    ? `Các task đã duyệt sẽ được biên dịch thành tớp ${format}.`
                    : "Vui lòng chọn một dự án để tiếp tục."}
                </p>
              </div>

              <button
                onClick={() => handleExport(format)}
                disabled={!selectedProjectId || isExporting}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
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
                    Tải Xuống {format}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG LỊCH SỬ EXPORT */}
        <div className="lg:col-span-2">
          <div className="bg-[#151D2F] border border-white/5 rounded-xl shadow-sm overflow-hidden h-full min-h-[500px] flex flex-col">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">
                Lịch sử xuất dữ liệu
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Lịch sử xuất dữ liệu của dự án được chọn
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!selectedProjectId ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-gray-500">
                  <span className="text-4xl mb-3 opacity-50">📂</span>
                  <p>Vui lòng chọn một dự án ở bên trái để xem lịch sử.</p>
                </div>
              ) : isLoadingHistory ? (
                <div className="text-center py-20 text-gray-500 animate-pulse">
                  Đang tải lịch sử...
                </div>
              ) : histories.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  Dự án này chưa từng được xuất dữ liệu. Bấm nút bên trái để
                  tạo!
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#0B1120] text-gray-400 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 font-medium border-b border-white/5">
                          Export ID
                        </th>
                        <th className="px-6 py-4 font-medium border-b border-white/5">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-4 font-medium border-b border-white/5">
                          Format
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {histories.map((hist, idx) => {
                        const id =
                          hist.exportId ||
                          hist.id ||
                          hist.exportID ||
                          `EXP-${idx}`;
                        const date =
                          hist.exportDate || hist.createdAt || hist.date;
                        const exportFormat =
                          hist.format ||
                          hist.exportFormat ||
                          hist.fileFormat ||
                          hist.type ||
                          "-";

                        return (
                          <tr
                            key={idx}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4 text-gray-300 font-medium">
                              #{id?.toString().substring(0, 8) || id}
                            </td>
                            <td className="px-6 py-4 text-gray-400">
                              {date
                                ? new Date(date).toLocaleString("vi-VN")
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-gray-300 font-medium">
                              {exportFormat}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
