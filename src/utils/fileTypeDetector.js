/**
 * Utility để phát hiện và sắp xếp data type
 */

// Định nghĩa các loại file extensions
const FILE_TYPES = {
  IMAGE: {
    key: "IMAGE",
    label: "Ảnh",
    shortLabel: "Pic",
    extensions: [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".bmp",
      ".svg",
      ".tiff",
    ],
    mimePatterns: ["image/"],
    color: "bg-blue-500/10 text-blue-400",
    icon: "🖼️",
  },
  VIDEO: {
    key: "VIDEO",
    label: "Video",
    shortLabel: "Video",
    extensions: [".mp4", ".avi", ".mov", ".mkv", ".flv", ".wmv", ".webm"],
    mimePatterns: ["video/"],
    color: "bg-purple-500/10 text-purple-400",
    icon: "🎬",
  },
  AUDIO: {
    key: "AUDIO",
    label: "Âm thanh",
    shortLabel: "Audio",
    extensions: [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a", ".wma"],
    mimePatterns: ["audio/"],
    color: "bg-amber-500/10 text-amber-400",
    icon: "🎵",
  },
  TEXT: {
    key: "TEXT",
    label: "Văn bản",
    shortLabel: "Text",
    extensions: [".txt", ".csv", ".json", ".pdf", ".doc", ".docx", ".xlsx"],
    mimePatterns: ["text/"],
    color: "bg-emerald-500/10 text-emerald-400",
    icon: "📄",
  },
};

/**
 * Extract tên file từ URL Cloudinary - với extension dựa trên type
 * URL format: https://res.cloudinary.com/[cloud_name]/[type]/upload/[path]/[public_id]
 * Ví dụ: https://res.cloudinary.com/dlgsidnr2/image/upload/Datasets/Pic/myimage
 * @param {string} fileUrl - URL của file từ Cloudinary
 * @returns {string} - Tên file với extension dự đoán (ví dụ: "myimage.jpg")
 */
export const extractFileNameFromUrl = (fileUrl = "") => {
  if (!fileUrl) return "";

  try {
    // Lấy phần sau dấu "/" cuối cùng (tên file)
    const parts = fileUrl.split("/");
    let fileName = parts[parts.length - 1];

    // Bỏ query params nếu có (ví dụ: ?...)
    fileName = fileName.split("?")[0];

    // Decode URL encoded characters
    fileName = decodeURIComponent(fileName);

    if (!fileName) return "";

    // ✅ Nếu tên file không có extension, thêm extension dựa trên file type từ URL
    if (!fileName.includes(".")) {
      const detectedType = detectFileType("", fileUrl);
      const extensionMap = {
        IMAGE: ".jpg",
        VIDEO: ".mp4",
        AUDIO: ".mp3",
        TEXT: ".pdf",
      };
      const ext = extensionMap[detectedType] || "";
      fileName = fileName + ext;
    }

    return fileName || "";
  } catch (error) {
    console.error("Lỗi extract file name từ URL:", error);
    return "";
  }
};

/**
 * Enrichment: Thêm fileName + dataType vào item nếu chưa có
 * @param {object} item - Data item
 * @param {string} defaultFileName - Tên file mặc định
 * @returns {object} - Item đã được enriched
 */
export const enrichItemWithFileInfo = (item = {}, defaultFileName = "file") => {
  // Lấy tên file từ các nguồn khác nhau
  let fileName =
    item.fileName ||
    item.name ||
    extractFileNameFromUrl(item.fileUrl || item.filePath) ||
    defaultFileName;

  // Detect type từ tên file
  const dataType =
    item.dataType || detectFileType(fileName, item.fileUrl || item.filePath);

  return {
    ...item,
    fileName,
    dataType: dataType || "OTHER",
  };
};

/**
 * Phát hiện loại file từ tên file hoặc URL Cloudinary
 * Priority:
 * 1. Detect từ URL Cloudinary path (ví dụ: /image/upload/ → IMAGE)
 * 2. Detect từ extension file (ví dụ: .jpg → IMAGE)
 * @param {string} fileName - Tên file (ví dụ: "image.jpg")
 * @param {string} fileUrl - URL của file (tùy chọn, để lấy extension hoặc type)
 * @returns {string} - Loại file: "IMAGE", "VIDEO", "AUDIO", "TEXT" hoặc null
 */
export const detectFileType = (fileName = "", fileUrl = "") => {
  const fullString = (fileName || fileUrl || "").toLowerCase();

  // ✅ PRIORITY 1: Detect từ URL Cloudinary path
  // Format: https://res.cloudinary.com/[cloud]/[TYPE]/upload/...
  // Ví dụ: https://res.cloudinary.com/dlgsidnr2/image/upload/Datasets/Pic/...
  if (fileUrl && fileUrl.includes("cloudinary.com")) {
    if (fileUrl.includes("/image/upload")) return "IMAGE";
    if (fileUrl.includes("/video/upload")) return "VIDEO";
    if (fileUrl.includes("/audio/upload")) return "AUDIO";
    if (fileUrl.includes("/raw/upload")) return "TEXT"; // raw = documents/text
  }

  // ✅ PRIORITY 2: Detect từ extension
  for (const [, typeInfo] of Object.entries(FILE_TYPES)) {
    for (const ext of typeInfo.extensions) {
      if (fullString.endsWith(ext)) {
        return typeInfo.key;
      }
    }
  }

  // Nếu không tìm thấy, trả về null
  return null;
};

/**
 * Lấy thông tin type từ key
 * @param {string} typeKey - Key của loại (IMAGE, VIDEO, AUDIO, TEXT)
 * @returns {object} - Thông tin chi tiết của loại
 */
export const getTypeInfo = (typeKey) => {
  return FILE_TYPES[typeKey] || null;
};

/**
 * Sắp xếp data theo loại file - VỚI DISPLAY NAME
 * @param {array} items - Mảng data items
 * @returns {object} - Object grouped theo type: { IMAGE: [], VIDEO: [], ...}
 *                    Mỗi item đã có displayName: "Ảnh 1", "Ảnh 2", "Video 1", ...
 */
export const groupDataByType = (items = []) => {
  const grouped = {
    IMAGE: [],
    VIDEO: [],
    AUDIO: [],
    TEXT: [],
    OTHER: [],
  };

  // Counters để tạo tên: Ảnh 1, Ảnh 2, ...
  const counters = {
    IMAGE: 1,
    VIDEO: 1,
    AUDIO: 1,
    TEXT: 1,
    OTHER: 1,
  };

  items.forEach((item) => {
    const detectedType = detectFileType(
      item.fileName || item.name,
      item.fileUrl || item.filePath,
    );

    const typeKey =
      detectedType && grouped[detectedType] ? detectedType : "OTHER";
    const typeLabel = FILE_TYPE_LABELS[typeKey];
    const displayName = `${typeLabel} ${counters[typeKey]}`;

    grouped[typeKey].push({
      ...item,
      dataType: typeKey,
      displayName, // ✅ Tên hiển thị: "Ảnh 1", "Video 1", ...
    });

    counters[typeKey]++;
  });

  return grouped;
};

/**
 * Flatten grouped data về array nhưng vẫn giữ displayName
 * @param {object} grouped - Object grouped từ groupDataByType
 * @returns {array} - Flat array với displayName
 */
export const flattenGroupedData = (grouped = {}) => {
  const ORDER = ["IMAGE", "VIDEO", "AUDIO", "TEXT", "OTHER"];
  const result = [];

  ORDER.forEach((typeKey) => {
    if (grouped[typeKey] && grouped[typeKey].length > 0) {
      result.push(...grouped[typeKey]);
    }
  });

  return result;
};

/**
 * Sắp xếp data: IMAGE -> VIDEO -> AUDIO -> TEXT -> OTHER
 * @param {array} items - Mảng data items
 * @returns {array} - Mảng đã sắp xếp
 */
export const sortDataByType = (items = []) => {
  const grouped = groupDataByType(items);
  return flattenGroupedData(grouped);
};

/**
 * Lấy danh sách type summary: "2 Ảnh, 1 Video, 3 Văn bản"
 * @param {array} items - Mảng data items
 * @returns {string} - String tóm tắt
 */
export const getTypeSummary = (items = []) => {
  const grouped = groupDataByType(items);
  const ORDER = ["IMAGE", "VIDEO", "AUDIO", "TEXT"];
  const summaryParts = [];

  ORDER.forEach((type) => {
    if (grouped[type] && grouped[type].length > 0) {
      const typeInfo = FILE_TYPES[type];
      summaryParts.push(`${grouped[type].length} ${typeInfo.label}`);
    }
  });

  return summaryParts.join(", ") || "Không có dữ liệu";
};

export const FILE_TYPE_COLORS = {
  IMAGE: "bg-blue-500/10 text-blue-400",
  VIDEO: "bg-purple-500/10 text-purple-400",
  AUDIO: "bg-amber-500/10 text-amber-400",
  TEXT: "bg-emerald-500/10 text-emerald-400",
  OTHER: "bg-gray-500/10 text-gray-400",
};

export const FILE_TYPE_LABELS = {
  IMAGE: "Ảnh",
  VIDEO: "Video",
  AUDIO: "Âm thanh",
  TEXT: "Văn bản",
  OTHER: "Khác",
};

export const FILE_TYPE_ICONS = {
  IMAGE: "🖼️",
  VIDEO: "🎬",
  AUDIO: "🎵",
  TEXT: "📄",
  OTHER: "📎",
};
