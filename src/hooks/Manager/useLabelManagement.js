import { useState, useEffect } from "react";
import {
  getLibraryLabels,
  getProjectLabels,
  importLabelsToProject,
  createCustomLabel,
  deleteProjectLabel,
  addLabelToLibrary,
} from "../../api/managerApi";

export const useLabelManagement = (projectId) => {
  const [libraryLabels, setLibraryLabels] = useState([]); // Nhãn mẫu
  const [projectLabels, setProjectLabels] = useState([]); // Nhãn dự án
  const [isLoading, setIsLoading] = useState(true);

  // Tải dữ liệu ban đầu
  const fetchAllLabels = async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const [libRes, projRes] = await Promise.all([
        getLibraryLabels(),
        getProjectLabels(projectId),
      ]);
      setLibraryLabels(libRes || []);
      setProjectLabels(projRes || []);
    } catch (error) {
      console.error("Lỗi load Labels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLabels();
  }, [projectId]);

  // Hành động 1: Import nhãn từ kho
  const handleImport = async (labelIds) => {
    try {
      await importLabelsToProject(projectId, labelIds);
      await fetchAllLabels(); // Refresh danh sách
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  // Hành động 2: Tạo nhãn mới + đồng thời lưu vào Label Library với topic "Tạo từ project"
  const handleCreateCustom = async (labelData) => {
    try {
      await createCustomLabel(projectId, labelData);

      // 🔄 Đồng thời lưu nhãn vào Label Library với category "Tạo từ project"
      try {
        await addLabelToLibrary({
          labelName: labelData.labelName || labelData.customName || labelData.name,
          defaultColor: labelData.defaultColor || labelData.colorCode || labelData.color || "#3B82F6",
          category: "Tạo từ project",
        });
        console.log("✅ Đã lưu nhãn tùy chỉnh vào Label Library (Tạo từ project)");
      } catch (libError) {
        // Nếu lưu vào library thất bại (VD: trùng tên), vẫn không ảnh hưởng đến việc tạo nhãn project
        console.warn("⚠️ Không thể lưu vào Label Library (có thể đã tồn tại):", libError.message);
      }

      await fetchAllLabels();
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  // Hành động 3: Xóa nhãn
  const handleDelete = async (projectLabelId) => {
    try {
      await deleteProjectLabel(projectLabelId);
      await fetchAllLabels();
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  // ĐÃ SỬA CHỖ NÀY: Mapping đúng tên hàm mà UI đang gọi
  return {
    libraryLabels,
    projectLabels,
    isLoading,
    importFromLib: handleImport, // Sửa thành importFromLib
    createCustom: handleCreateCustom, // Sửa thành createCustom
    removeLabel: handleDelete, // Sửa thành removeLabel
    refresh: fetchAllLabels,
  };
};
