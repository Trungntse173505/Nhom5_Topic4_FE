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
      const uploadedItems = []; // Thay đổi: lưu {fileName, fileUrl} thay vì chỉ URL

      // 1. Gửi file lên Cloudinary
      const uploadPromises = Array.from(files).map(async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);
        data.append("folder", `Datasets/${fileType}`); // Phân loại thư mục trên Cloudinary

        // ✅ Set public_id để giữ lại tên file gốc trong URL
        // Ví dụ: file.name = "myimage.jpg" → public_id = "Datasets/Pic/myimage"
        // URL sẽ là: https://res.cloudinary.com/[cloud]/image/upload/Datasets/Pic/myimage.jpg
        const fileNameWithoutExt = file.name.substring(
          0,
          file.name.lastIndexOf("."),
        );
        data.append("public_id", `Datasets/${fileType}/${fileNameWithoutExt}`);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          { method: "POST", body: data },
        );

        const result = await response.json();
        if (result.secure_url) {
          uploadedItems.push({
            fileName: file.name, // ✅ Lấy tên file gốc
            fileUrl: result.secure_url,
          });
        }
      });

      await Promise.all(uploadPromises);

      // 2. Gửi mảng {fileName, fileUrl, dataType} cho Backend
      const itemsWithType = uploadedItems.map((item) => ({
        ...item,
        dataType: fileType, // ✅ Thêm dataType từ fileType tham số
      }));
      await uploadDataToProject(projectId, itemsWithType, fileType);

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
