import React, { useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDatasetUpload } from "../../../hooks/useDatasetUpload";

// Import cái card 3D ảo ma vào đây (Đã căn chuẩn đường dẫn)
import { CardContainer, CardBody, CardItem } from "../../common/3d-card";

export default function DatasetUpload() {
  const { projectId: paramProjectId } = useParams();
  const location = useLocation();

  const projectId = paramProjectId || location.pathname.split("/").pop();

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

    const isSuccess = await uploadFiles(selectedFiles, fileType);
    if (isSuccess) {
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
      {" "}
      {/* Tăng khoảng cách ra xíu cho form dễ lắc */}
      {/* ========================================== */}
      {/* KHỐI 1: HEADER & UPLOAD ZONE (3D)            */}
      {/* ========================================== */}
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

        {/* --- KHU VỰC 3D CARD UPLOAD --- */}
        <CardContainer containerClassName="w-full mt-2" className="w-full">
          <CardBody
            className="w-full h-auto min-h-[250px] bg-[#0B1120] border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group/card"
            style={{ transformStyle: "preserve-3d" }}
          >
            <CardItem
              translateZ="20"
              className="w-full h-full flex flex-col items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFiles.length > 0 ? (
                <CardItem
                  translateZ="60"
                  className="text-emerald-400 font-medium flex flex-col items-center"
                >
                  <svg
                    className="mx-auto h-16 w-16 mb-4 opacity-80 drop-shadow-2xl"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span className="text-lg drop-shadow-md">
                    Đã chọn {selectedFiles.length} file chờ upload
                  </span>
                </CardItem>
              ) : (
                <>
                  <CardItem
                    translateZ="80"
                    className="mb-5 text-gray-400 group-hover/card:text-blue-400 transition-colors drop-shadow-2xl"
                  >
                    <svg
                      width="60"
                      height="60"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </CardItem>
                  <CardItem
                    translateZ="50"
                    className="text-xl font-medium text-white mb-2 drop-shadow-md"
                  >
                    Bấm vào đây để chọn Files
                  </CardItem>
                  <CardItem translateZ="30" className="text-sm text-gray-500">
                    Supported: JPG, PNG, TXT, MP3, MP4...
                  </CardItem>
                </>
              )}

              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardItem>
          </CardBody>
        </CardContainer>

        {selectedFiles.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleStartUpload}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
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
      {/* ========================================== */}
      {/* KHỐI 2: BẢNG DATA MANAGEMENT (CŨNG 3D)       */}
      {/* ========================================== */}
      <CardContainer containerClassName="w-full" className="w-full">
        {/* Nền của Card (Cái mảng to đùng phía sau) */}
        <CardBody
          className="w-full bg-[#151D2F] border border-white/5 rounded-xl p-6 shadow-2xl transition-colors group/card"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Tiêu đề bảng nảy lên cao xíu */}
          <CardItem translateZ="60" className="w-full mb-6">
            <h2 className="text-xl font-bold text-white drop-shadow-lg">
              Uploaded Data Management
            </h2>
          </CardItem>

          {/* Nguyên cái khối BẢNG nảy lên (Đã đắp nền #0B1120 và gỡ bỏ overflow để 3D hoạt động) */}
          <CardItem
            translateZ="40"
            className="w-full rounded-lg bg-[#0B1120] border border-white/10 p-2 shadow-xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            {isLoading ? (
              <div className="text-center text-gray-500 py-6">
                Đang tải danh sách data...
              </div>
            ) : dataItems.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                Dự án này chưa có data nào. Hãy upload ở trên nhé!
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-gray-400 border-b border-white/5">
                  <tr>
                    <th className="px-4 py-4 rounded-tl-lg font-medium">
                      Link Dữ liệu
                    </th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 rounded-tr-lg font-medium text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dataItems.map((item, i) => {
                    const finalLink =
                      item.filePath || item.fileUrl || item.url || "";
                    const isAssigned = item.isAssigned === true;
                    const statusText = isAssigned ? "Assigned" : "Unassigned";

                    return (
                      <tr
                        key={item.dataID || i}
                        className="hover:bg-white/[0.04] transition-colors"
                      >
                        <td
                          className="px-4 py-4 text-gray-200 truncate max-w-[200px]"
                          title={finalLink}
                        >
                          {finalLink ? (
                            <a
                              href={finalLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {item.fileName ||
                                finalLink.split("/").pop() ||
                                "Xem file"}
                            </a>
                          ) : (
                            <span className="text-rose-400">Không có link</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                              isAssigned
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-gray-500/10 text-gray-400"
                            }`}
                          >
                            {statusText}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {finalLink && (
                            <a
                              href={finalLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors text-xs"
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
            )}
          </CardItem>
        </CardBody>
      </CardContainer>
      {/* ========================================== */}
    </div>
  );
}
