import { useState, useEffect } from "react";
import {
  getProjectsList,
  exportProjectData,
  getExportHistories,
} from "../../api/managerApi";

export const useExportData = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [histories, setHistories] = useState([]);

  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 1. Lấy danh sách dự án khi vừa vào trang
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const res = await getProjectsList();
        // Lọc chỉ lấy các dự án đang Active hoặc Closed (bỏ qua bản nháp nếu có)
        const allProjs = Array.isArray(res) ? res : res.data || [];
        setProjects(allProjs);
      } catch (error) {
        console.error("Lỗi lấy danh sách dự án:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // 2. Kéo lịch sử Export mỗi khi đổi Dự án
  const fetchHistory = async (id) => {
    setIsLoadingHistory(true);
    try {
      const res = await getExportHistories(id);
      setHistories(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
      setHistories([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchHistory(selectedProjectId);
    } else {
      setHistories([]); // Xóa trắng bảng nếu không chọn dự án nào
    }
  }, [selectedProjectId]);

  // 3. Bấm nút Xuất dữ liệu
  const handleExport = async () => {
    if (!selectedProjectId) return alert("Vui lòng chọn dự án!");
    setIsExporting(true);
    try {
      await exportProjectData(selectedProjectId);
      alert(
        "Yêu cầu xuất dữ liệu thành công! Vui lòng chờ giây lát và xem trong lịch sử.",
      );
      await fetchHistory(selectedProjectId); // Tải lại bảng lịch sử để thấy file mới
    } catch (error) {
      alert(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    histories,
    isLoadingProjects,
    isLoadingHistory,
    isExporting,
    handleExport,
  };
};
