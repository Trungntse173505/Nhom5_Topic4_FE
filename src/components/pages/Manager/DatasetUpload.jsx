import React, { useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom"; // Import thêm useLocation
import { useDatasetUpload } from "../../../hooks/useDatasetUpload";

export default function DatasetUpload() {
  const { projectId: paramProjectId } = useParams();
  const location = useLocation();

  // BỌC LÓT CỰC MẠNH: Nếu useParams bị undefined, tự động chặt ID từ thanh URL xuống!
  const projectId = paramProjectId || location.pathname.split("/").pop();

  // Gọi Hook với ID chuẩn
  const { dataItems, isLoading, isUploading, uploadFiles } =
    useDatasetUpload(projectId);

  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileType, setFileType] = useState("Pic");

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Hãy chọn file trước khi upload!");
      return;
    }

    // Ném file vào Hook để nó lo vụ Cloudinary và Backend
    const isSuccess = await uploadFiles(selectedFiles, fileType);
    if (isSuccess) {
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Khối Upload */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Bulk Dataset Upload
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Upload images, text, or audio for labeling
            </p>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Loại Data tải lên
            </label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="bg-[#0B1120] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm outline-none"
            >
              <option value="Pic">Pic (Ảnh)</option>
              <option value="Text">Text</option>
              <option value="Audio">Audio</option>
              <option value="Video">Video</option>
            </select>
          </div>
        </div>

        {/* Khung Kéo Thả / Bấm Chọn */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors hover:border-blue-500/50 hover:bg-white/[0.02] cursor-pointer"
        >
          {selectedFiles.length > 0 ? (
            <div className="text-emerald-400 font-medium">
              <svg
                className="mx-auto h-12 w-12 mb-3 opacity-80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Đã chọn {selectedFiles.length} file chờ upload
            </div>
          ) : (
            <>
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
                Bấm vào đây để chọn Files
              </p>
              <p className="text-sm text-gray-500">
                Supported: JPG, PNG, TXT, MP3, MP4...
              </p>
            </>
          )}

          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleStartUpload}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    ></circle>
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      className="opacity-75"
                    ></path>
                  </svg>
                  Đang xử lý Cloudinary...
                </>
              ) : (
                "🚀 Bắt đầu Upload lên Server"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Bảng Quản lý Data (Đổ dữ liệu thật từ BE) */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-white mb-4">
          Uploaded Data Management
        </h2>

        {isLoading ? (
          <div className="text-center text-gray-500 py-6">
            Đang tải danh sách data...
          </div>
        ) : dataItems.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            Dự án này chưa có data nào. Hãy upload ở trên nhé!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B1120] text-gray-400">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg font-medium">
                    Link Dữ liệu
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg font-medium text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dataItems.map((item, i) => {
                  // Móc đúng tên biến BE trả về (filePath)
                  const finalLink =
                    item.filePath || item.fileUrl || item.url || "";

                  // Xử lý status: BE trả về isAssigned (true/false)
                  const isAssigned = item.isAssigned === true;
                  const statusText = isAssigned ? "Assigned" : "Unassigned";

                  return (
                    <tr
                      key={item.dataID || i}
                      className="hover:bg-white/[0.02]"
                    >
                      <td
                        className="px-4 py-3 text-gray-200 truncate max-w-xs"
                        title={finalLink}
                      >
                        {finalLink ? (
                          <a
                            href={finalLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            {/* Hiển thị fileName cho đẹp, nếu ko có thì hiện rút gọn của link */}
                            {item.fileName ||
                              finalLink.split("/").pop() ||
                              "Xem file"}
                          </a>
                        ) : (
                          <span className="text-rose-400">Không có link</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            isAssigned
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {statusText}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {finalLink && (
                          <a
                            href={finalLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs underline"
                          >
                            Mở xem
                          </a>
                        )}
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
  );
}
