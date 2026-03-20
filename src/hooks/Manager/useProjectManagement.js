// src/hooks/useProjectManagement.js
import { useState, useEffect } from "react";
// ĐÃ THÊM: Import hàm gọi API thống kê vào đây (sếp check lại tên hàm trong managerApi cho đúng nhé)
import {
  getProjectsList,
  createProject,
  getProjectStatistics,
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

      // 1. Lấy danh sách vỏ dự án trước
      const data = await getProjectsList();
      const projectArray = Array.isArray(data) ? data : data?.data || [];

      // 2. NHỒI THÊM THỐNG KÊ (STATISTICS) VÀO TỪNG DỰ ÁN
      const projectsWithStats = await Promise.all(
        projectArray.map(async (proj) => {
          try {
            // Xác định ID của dự án
            const id = proj.projectID || proj.id;

            // Gọi API lấy thống kê của riêng dự án này
            const statsRes = await getProjectStatistics(id);
            const statsData = statsRes.data || statsRes;

            // Gộp data cũ và data thống kê mới vào làm 1 cục
            return {
              ...proj,
              // Ghi đè mấy trường này bằng data thực tế từ API Stats
              totalDataItems: statsData?.totalItems || proj.totalDataItems || 0,
              completedItems:
                statsData?.completedItems || proj.completedItems || 0,
              rateComplete: statsData?.rateComplete || 0,
            };
          } catch (statsError) {
            console.error(
              `Lỗi lấy thống kê dự án ${proj.projectName}:`,
              statsError,
            );
            // Nếu lỗi lấy stats (ví dụ dự án mới tinh chưa có data) thì trả về 0 hết
            return {
              ...proj,
              totalDataItems: proj.totalDataItems || 0,
              completedItems: proj.completedItems || 0,
              rateComplete: 0,
            };
          }
        }),
      );

      // 3. Set cái mảng đã được "bơm" đầy đủ phần trăm vào State
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
