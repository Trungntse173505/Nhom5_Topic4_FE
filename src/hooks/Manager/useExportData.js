import { useState, useEffect } from "react";
import {
  getProjectsList,
  getExportHistories,
} from "../../api/managerApi";
import {
  exportCocoProjectData,
  exportYoloProjectData,
} from "../../api/managerExportApi";

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

  const downloadBlob = (data, filename) => {
    const blob = data instanceof Blob ? data : new Blob([data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  };

  const exportRequests = {
    YOLO: {
      label: "YOLO",
      filename: (projectId) => `project-${projectId}-yolo.zip`,
      request: exportYoloProjectData,
    },
    COCO: {
      label: "COCO",
      filename: (projectId) => `project-${projectId}-coco.json`,
      request: exportCocoProjectData,
    },
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchHistory(selectedProjectId);
    } else {
      setHistories([]); // Xóa trắng bảng nếu không chọn dự án nào
    }
  }, [selectedProjectId]);

  // 3. Bấm nút Xuất dữ liệu
  const handleExport = async (format) => {
    if (!selectedProjectId) return alert("Vui lòng chọn dự án!");

    const exportJob = exportRequests[String(format || "").toUpperCase()];
    if (!exportJob) {
      return alert("Chỉ hỗ trợ xuất dữ liệu theo định dạng YOLO hoặc COCO.");
    }

    setIsExporting(true);
    try {
      const res = await exportJob.request(selectedProjectId);
      downloadBlob(res, exportJob.filename(selectedProjectId));
      alert(
        `Yêu cầu xuất dữ liệu ${exportJob.label} thành công! File đã được tải xuống.`,
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setIsExporting(false);
    }

    fetchHistory(selectedProjectId).catch((error) => {
      console.error("Lỗi cập nhật lịch sử sau khi export:", error);
    });
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
