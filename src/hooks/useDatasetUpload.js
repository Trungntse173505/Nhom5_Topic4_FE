// src/hooks/useDatasetUpload.js
import { useState, useEffect } from "react";
import { getProjectDetail, uploadDataToProject } from "../api/managerApi";

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
      // Lấy mảng dataItems từ response BE để hiển thị
      setDataItems(res.dataItems || res.data?.dataItems || []);
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
      const uploadedUrls = [];

      // 1. Gửi file lên Cloudinary
      const uploadPromises = Array.from(files).map(async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);
        data.append("folder", `Datasets/${fileType}`); // Phân loại thư mục trên Cloudinary

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          { method: "POST", body: data },
        );

        const result = await response.json();
        if (result.secure_url) uploadedUrls.push(result.secure_url);
      });

      await Promise.all(uploadPromises);

      // 2. Gửi mảng link cho Backend
      await uploadDataToProject(projectId, uploadedUrls, fileType);

      alert(`Upload thành công ${uploadedUrls.length} files!`);

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
