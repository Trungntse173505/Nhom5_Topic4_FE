// src/hooks/useProjectManagement.js
import { useState, useEffect } from "react";
// ĐÃ THÊM: Import hàm gọi API thống kê vào đây (sếp check lại tên hàm trong managerApi cho đúng nhé)
import {
  getProjectsList,
  createProject,
  getProjectStatistics,
  getProjectLabels,
  getUserPerformance,
  getLibraryLabels,
} from "../../api/managerApi";

export const useProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);

      // 1. Lấy danh sách vỏ dự án VÀ toàn bộ thư viện nhãn (để map category)
      const [listData, libRes] = await Promise.all([
        getProjectsList(),
        getLibraryLabels().catch(() => [])
      ]);
      const projectArray = Array.isArray(listData) ? listData : listData?.data || [];
      const libraryLabels = Array.isArray(libRes) ? libRes : libRes?.data || [];

      // 2. NHỒI THÊM THỐNG KÊ (STATISTICS), NHÃN VÀ USER VÀO TỪNG DỰ ÁN
      const projectsWithStats = await Promise.all(
        projectArray.map(async (proj) => {
          try {
            // Xác định ID của dự án
            const id = proj.projectID || proj.id;

            // Chạy song song API để gom Data đổ vào Bảng
            const [statsRes, perfRes, labelsRes] = await Promise.all([
              getProjectStatistics(id).catch(() => null),
              getUserPerformance(id).catch(() => []),
              getProjectLabels(id).catch(() => [])
            ]);

            const statsData = statsRes?.data || statsRes;
            const perfData = Array.isArray(perfRes) ? perfRes : perfRes?.data || [];
            const labelsData = Array.isArray(labelsRes) ? labelsRes : labelsRes?.data || [];

            // Chắt lọc Category / Topic của nhãn thay vì in tên từng nhãn ra
            const projectTopics = labelsData.map(l => {
              // Tìm xem nhãn này đến từ (hoặc giống với) nhãn nào trong thư viện
              const matchName = l.customName || l.labelName || l.name;
              const matchedLibLabel = libraryLabels.find(
                lib => lib.labelName === matchName || lib.labelID === l.labelId || lib.labelId === l.labelId
              );
              
              // Ưu tiên topic/category từ library (vd: Mixed, Audio, Video, Image)
              return matchedLibLabel?.category || matchedLibLabel?.topic || l.category || l.topic || "Khác";
            });
            const uniqueTopics = [...new Set(projectTopics)].filter(Boolean).join(", ");

            // Gộp data cũ và data thống kê mới vào làm 1 cục
            return {
              ...proj,
              totalDataItems: statsData?.totalItems || proj.totalDataItems || 0,
              completedItems: statsData?.completedItems || proj.completedItems || 0,
              rateComplete: statsData?.rateComplete || 0,
              memberCount: perfData.length,
              labelCategories: uniqueTopics
            };
          } catch (statsError) {
            console.error(
              `Lỗi lấy dữ liệu phụ cho dự án ${proj.projectName}:`,
              statsError,
            );
            return {
              ...proj,
              totalDataItems: proj.totalDataItems || 0,
              completedItems: proj.completedItems || 0,
              rateComplete: 0,
              memberCount: 0,
              labelCategories: ""
            };
          }
        }),
      );

      // 3. Set cái mảng đã được "bơm" đầy đủ vào State
      setProjects(projectsWithStats);
    } catch (error) {
      console.error("Lỗi kéo data dự án:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const createNewProject = async (formData) => {
    try {
      setIsCreating(true);

      const projectPayload = {
        projectName: formData.name,
        description: formData.description,
        topic: formData.topic,
        projectType: formData.type,
        guidelineUrl: formData.guideline || "Chưa có guideline",
      };

      console.log("Đang tạo vỏ dự án:", projectPayload);
      await createProject(projectPayload);

      alert("Tạo dự án thành công!");
      await fetchProjects(); // Cập nhật lại danh sách (nó sẽ tự chạy lại quy trình lấy stats ở trên)
      return true;
    } catch (error) {
      console.error("Lỗi tạo dự án:", error);
      alert(error.message || "Có lỗi xảy ra, check console nhé!");
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return { projects, isLoadingProjects, isCreating, createNewProject };
};
