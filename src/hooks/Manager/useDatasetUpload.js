// src/hooks/useDatasetUpload.js
import { useState, useEffect } from "react";
import { getProjectDetail, uploadDataToProject } from "../../api/managerApi";
import {
  sortDataByType,
  enrichItemWithFileInfo,
} from "../../utils/fileTypeDetector";

export const useDatasetUpload = (projectId) => {
  const [dataItems, setDataItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Kéo dữ liệu cũ về đổ ra bảng
  const fetchProjectData = async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const res = await getProjectDetail(projectId);
      let items = res.dataItems || res.data?.dataItems || [];

      // ✅ Enrichment: Extract fileName + detect dataType từ URL
      items = items.map((item, idx) =>
        enrichItemWithFileInfo(item, `file_${idx}`),
      );

      // ✅ Sort theo loại file: IMAGE -> VIDEO -> AUDIO -> TEXT
      const sortedItems = sortDataByType(items);
      setDataItems(sortedItems);
    } catch (error) {
      console.error("Lỗi lấy chi tiết dự án:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  // Hàm xử lý upload
  const uploadFiles = async (files, fileType) => {
    if (!files || files.length === 0) return false;

    const UPLOAD_PRESET = "react_upload";
    const CLOUD_NAME = "dlgsidnr2";

    try {
      setIsUploading(true);
      const uploadedItems = []; // Lưu {fileName, fileUrl} để xử lý nội bộ

      // 1. Gửi file lên Cloudinary
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", UPLOAD_PRESET);
          data.append("folder", `Datasets/${fileType}`); // Phân loại thư mục trên Cloudinary

          // ✅ Set public_id để giữ lại tên file gốc trong URL
          const fileNameWithoutExt = file.name.substring(
            0,
            file.name.lastIndexOf("."),
          );
          data.append(
            "public_id",
            `Datasets/${fileType}/${fileNameWithoutExt}`,
          );

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
            { method: "POST", body: data },
          );

          if (!response.ok) {
            throw new Error(`Lỗi upload ${file.name}: ${response.statusText}`);
          }

          const result = await response.json();
          if (result.secure_url) {
            uploadedItems.push({
              fileName: file.name, // ✅ Lấy tên file gốc
              fileUrl: result.secure_url,
            });
          } else {
            throw new Error(
              `File ${file.name}: Không nhận được URL từ Cloudinary`,
            );
          }
        } catch (err) {
          console.error(`❌ Upload file ${file.name} thất bại:`, err);
          // Không throw, chỉ log để tiếp tục upload những file khác
        }
      });

      await Promise.all(uploadPromises);

      // 🔍 Kiểm tra có file nào upload thất bại không
      if (uploadedItems.length === 0) {
        throw new Error(
          "❌ Toàn bộ file upload thất bại! Vui lòng kiểm tra file và thử lại.",
        );
      }

      if (uploadedItems.length < files.length) {
        console.warn(
          `⚠️ Chỉ upload thành công ${uploadedItems.length}/${files.length} file. Một số file bị lỗi.`,
        );
      }

      // =========================================================
      // 👉 FIX LỖI 400: Gọt bớt data, chỉ lấy mảng chuỗi đường link
      // =========================================================
      const onlyUrls = uploadedItems.map((item) => item.fileUrl);

      // 🔍 Validate trước khi gửi: không có item nào có fileUrl rỗng
      const invalidUrls = onlyUrls.filter((url) => !url || url.trim() === "");
      if (invalidUrls.length > 0) {
        throw new Error(
          `❌ ${invalidUrls.length} file có URL trống! Không thể gửi lên server.`,
        );
      }

      // 🎯 Log chi tiết để debug
      console.log("=== UPLOAD DEBUG ===");
      console.log("📁 Files:", files.length);
      console.log("☁️ Uploaded URLs to Backend:", onlyUrls);

      // Gửi nguyên cái mảng URL này xuống Backend
      await uploadDataToProject(projectId, onlyUrls, fileType);

      alert(`Upload thành công ${uploadedItems.length} files!`);

      // 3. Tải lại bảng data
      await fetchProjectData();
      return true;
    } catch (error) {
      console.error("Lỗi upload:", error);
      alert(error.message || "Có lỗi khi upload file!");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { dataItems, isLoading, isUploading, uploadFiles };
};
