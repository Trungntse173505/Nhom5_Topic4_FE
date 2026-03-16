import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDatasetUpload } from "../../../hooks/Manager/useDatasetUpload";

// Import cái card 3D ảo ma vào đây (Đã căn chuẩn đường dẫn)
import { CardContainer, CardBody, CardItem } from "../../common/3d-card";
// Bổ sung import cái nút Animated cực mượt mới tạo
import { AnimatedButton } from "../../common/AnimatedButton";

// =====================================================================
// BÍ KÍP 3: CÁI VỎ HỘP ĐÓNG BĂNG CHO TỪNG DÒNG DATA (Chống Lag Bảng)
// =====================================================================
const DataRowItem = React.memo(({ item }) => {
  const finalLink = item.filePath || item.fileUrl || item.url || "";
  const isAssigned = item.isAssigned === true;
  const statusText = isAssigned ? "Đã giao Task" : "Chưa giao";

  return (
    <tr className="hover:bg-white/[0.04] transition-colors">
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
            {item.fileName || finalLink.split("/").pop() || "Xem file"}
          </a>
        ) : (
          <span className="text-rose-400">Không có link</span>
        )}
      </td>
      <td className="px-4 py-4">
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            isAssigned
              ? "bg-emerald-500/10 text-emerald-400"
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
});

export default function DatasetUpload({ project }) {
  const { projectId: paramProjectId } = useParams();
  const location = useLocation();

  const projectId = paramProjectId || location.pathname.split("/").pop();

  const { dataItems, isLoading, isUploading, uploadFiles } =
    useDatasetUpload(projectId);

  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileType, setFileType] = useState("Pic");

  // TỰ ĐỘNG MAP LOẠI DATA CỦA DỰ ÁN VÀO KHUNG UPLOAD
  useEffect(() => {
    if (project?.projectType) {
      const type = project.projectType.toLowerCase();
      if (type.includes("image") || type.includes("pic")) {
        setFileType("Pic");
      } else if (type.includes("video")) {
        setFileType("Video");
      } else if (type.includes("audio")) {
        setFileType("Audio");
      } else if (type.includes("text")) {
        setFileType("Text");
      } else if (type.includes("mixed")) {
        setFileType("Mixed");
      }
    }
  }, [project]);

  // =====================================================================
  // BÍ KÍP 1: GHI NHỚ TÍNH TOÁN BẰNG useMemo (Tránh não cá vàng)
  // =====================================================================
  const acceptTypes = useMemo(() => {
    switch (fileType) {
      case "Pic":
        return "image/*";
      case "Video":
        return "video/*";
      case "Audio":
        return "audio/*";
      case "Text":
        return "text/*,.json,.csv";
      case "Mixed":
        return "image/*,video/*,audio/*,text/*,.json,.csv";
      default:
        return "*/*";
    }
  }, [fileType]);

  const supportedText = useMemo(() => {
    switch (fileType) {
      case "Pic":
        return "Hỗ trợ: JPG, PNG, GIF, WEBP...";
      case "Video":
        return "Hỗ trợ: MP4, AVI, MOV...";
      case "Audio":
        return "Hỗ trợ: MP3, WAV, OGG...";
      case "Text":
        return "Hỗ trợ: TXT, CSV, JSON...";
      case "Mixed":
        return "Hỗ trợ: Ảnh, Video, Audio, Văn bản...";
      default:
        return "Supported files...";
    }
  }, [fileType]);

  // =====================================================================
  // BÍ KÍP 2: ĐÓNG BĂNG HÀNH ĐỘNG BẰNG useCallback
  // =====================================================================
  const handleFileSelect = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);

        // KIỂM TRA NGHIÊM NGẶT LOẠI FILE
        const isValid = files.every((file) => {
          if (fileType === "Pic") return file.type.startsWith("image/");
          if (fileType === "Video") return file.type.startsWith("video/");
          if (fileType === "Audio") return file.type.startsWith("audio/");
          if (fileType === "Text")
            return (
              file.type.startsWith("text/") ||
              file.name.endsWith(".json") ||
              file.name.endsWith(".csv")
            );
          if (fileType === "Mixed") {
            return (
              file.type.startsWith("image/") ||
              file.type.startsWith("video/") ||
              file.type.startsWith("audio/") ||
              file.type.startsWith("text/") ||
              file.name.endsWith(".json") ||
              file.name.endsWith(".csv")
            );
          }
          return true;
        });

        if (!isValid) {
          alert(
            `Lỗi: Vui lòng chỉ chọn đúng định dạng file cho loại dữ liệu "${fileType}" của dự án này!`,
          );
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        setSelectedFiles(files);
      }
    },
    [fileType],
  ); // Chỉ tạo lại hàm nếu fileType đổi

  const handleStartUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      alert("Hãy chọn file trước khi upload!");
      return;
    }

    const isSuccess = await uploadFiles(selectedFiles, fileType);
    if (isSuccess) {
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [selectedFiles, fileType, uploadFiles]);

  return (
    <div className="space-y-8">
      {/* ========================================== */}
      {/* KHỐI 1: HEADER & UPLOAD ZONE (3D)            */}
      {/* ========================================== */}
      <div className="rounded-xl border border-white/5 bg-[#151D2F]/90 backdrop-blur-sm p-6 shadow-sm">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Tải lên Dữ liệu Hàng loạt
            </h2>
            {project?.projectType && (
              <p className="text-sm text-gray-400 mt-1">
                Dự án hiện tại yêu cầu dữ liệu loại:{" "}
                <strong className="text-blue-400">{project.projectType}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Loại Data tải lên
            </label>
            <select
              value={fileType}
              disabled // KHÓA CỨNG DROPDOWN NÀY LẠI
              className="bg-[#0B1120] border border-white/10 rounded-lg px-3 py-1.5 text-gray-400 text-sm outline-none cursor-not-allowed opacity-80"
            >
              <option value="Pic">Pic (Ảnh)</option>
              <option value="Text">Text (Văn bản)</option>
              <option value="Audio">Audio (Âm thanh)</option>
              <option value="Video">Video</option>
              <option value="Mixed">Mixed (Hỗn hợp)</option>
            </select>
            <p className="text-[10px] text-rose-400/80 mt-1 italic text-right">
              * Cố định theo dự án
            </p>
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
                  <CardItem
                    translateZ="30"
                    className="text-sm text-blue-400/80 mt-1 font-medium"
                  >
                    {supportedText}
                  </CardItem>
                </>
              )}

              <input
                type="file"
                multiple
                accept={acceptTypes} // LỚP BẢO VỆ SỐ 1 ĐÃ ĐƯỢC TỐI ƯU
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardItem>
          </CardBody>
        </CardContainer>

        {selectedFiles.length > 0 && (
          <div className="mt-4 flex justify-end">
            <AnimatedButton onClick={handleStartUpload} disabled={isUploading}>
              {isUploading
                ? "⏳ Đang đẩy lên Server..."
                : "🚀 Bắt đầu Upload lên Server"}
            </AnimatedButton>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* KHỐI 2: BẢNG DATA MANAGEMENT (CŨNG 3D)       */}
      {/* ========================================== */}
      <CardContainer containerClassName="w-full" className="w-full">
        <CardBody
          className="w-full bg-[#151D2F]/90 backdrop-blur-sm border border-white/5 rounded-xl p-6 shadow-2xl transition-colors group/card"
          style={{ transformStyle: "preserve-3d" }}
        >
          <CardItem translateZ="60" className="w-full mb-6">
            <h2 className="text-xl font-bold text-white drop-shadow-lg">
              Quản lý Dữ liệu đã tải lên
            </h2>
          </CardItem>

          <CardItem
            translateZ="40"
            className="w-full rounded-lg bg-[#0B1120] border border-white/10 p-2 shadow-xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            {isLoading ? (
              <div className="text-center text-gray-500 py-6 animate-pulse">
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
                    <th className="px-4 py-4 font-medium">Trạng thái</th>
                    <th className="px-4 py-4 rounded-tr-lg font-medium text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                {/* ĐÃ TỐI ƯU: GỌI COMPONENT ĐÓNG BĂNG Ở ĐÂY */}
                <tbody className="divide-y divide-white/5">
                  {dataItems.map((item, i) => (
                    <DataRowItem key={item.dataID || i} item={item} />
                  ))}
                </tbody>
              </table>
            )}
          </CardItem>
        </CardBody>
      </CardContainer>
    </div>
  );
}
