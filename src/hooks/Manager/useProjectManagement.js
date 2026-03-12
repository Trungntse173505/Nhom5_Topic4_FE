// src/hooks/useProjectManagement.js
import { useState, useEffect } from "react";
import { getProjectsList, createProject } from "../../api/managerApi";

export const useProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isCreating, setIsCreating] = useState(false); // Đổi tên state cho chuẩn nghĩa

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const data = await getProjectsList();
      const projectArray = Array.isArray(data) ? data : data?.data || [];
      setProjects(projectArray);
    } catch (error) {
      console.error("Lỗi kéo data dự án:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Hàm tạo dự án giờ chỉ nhận đúng formData
  const createNewProject = async (formData) => {
    try {
      setIsCreating(true);

      // Payload gửi lên API 1 (Tạo vỏ dự án)
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
      await fetchProjects(); // Cập nhật lại danh sách ngoài màn hình
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
