import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ManagerLayout from "./ManagerLayout";
import DatasetUpload from "./DatasetUpload";
import WorkDistribution from "./WorkDistribution";
import LabelSetEditor from "./LabelSetEditor";
import TaskTracking from "./TaskTracking";

// 1. Import bộ công cụ API và Hook
import { getProjectDetail } from "../../../api/managerApi";
import { useProjectActions } from "../../../hooks/useProjectActions";

// Tách Component Overview Content - Chấp nhận props data từ cha truyền xuống
const OverviewContent = ({ project }) => {
  // Tính toán sơ bộ dựa trên dữ liệu BE trả về
  const total = project?.totalDataItems || 0;

  return (
    <div className="space-y-6">
      {/* Header dự án */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {project?.projectName || "Đang tải..."}
          </h2>
          <p className="text-sm text-gray-400">
            Topic: {project?.topic || "N/A"}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${project?.status === "Open" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}
        >
          {project?.status || "Unknown"}
        </span>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Total Items</h3>
          <p className="text-4xl font-bold text-white mt-3 mb-6">{total}</p>
          <div className="w-full bg-[#0B1120] h-1.5 rounded-full"></div>
        </div>

        {/* Các card còn lại nếu BE chưa trả về số liệu chính xác, mình tạm để số giả hoặc tính toán */}
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Labeled</h3>
          <p className="text-4xl font-bold text-[#3B82F6] mt-3 mb-6">0</p>
          <p className="text-xs text-gray-500 italic">
            Dữ liệu đang cập nhật...
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Progress</h3>
          <p className="text-4xl font-bold text-[#10B981] mt-3 mb-6">0%</p>
          <div className="w-full bg-[#0B1120] h-1.5 rounded-full"></div>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Type</h3>
          <p className="text-2xl font-bold text-white mt-3 mb-6">
            {project?.projectType || "N/A"}
          </p>
          <p className="text-xs text-gray-500">Dữ liệu hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white">Project Info</h2>
            <p className="text-sm text-gray-400 mt-1">Mô tả dự án</p>
          </div>
          <div className="text-gray-300 text-sm leading-relaxed">
            {project?.description || "Không có mô tả cho dự án này."}
          </div>
          <div className="mt-6 p-4 bg-[#0B1120] rounded-lg border border-white/5">
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">
              Guideline Link
            </p>
            <a
              href={project?.guidelineUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 text-sm hover:underline break-all"
            >
              {project?.guidelineUrl || "Chưa có hướng dẫn"}
            </a>
          </div>
        </div>

        {/* Placeholder cho Annotator Performance */}
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-8 shadow-sm flex flex-col justify-center items-center text-gray-500">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="mb-4 opacity-20"
          >
            <path d="M12 20V10M18 20V4M6 20v-4" />
          </svg>
          <p>Biểu đồ năng suất sẽ hiển thị khi có Task được giao.</p>
        </div>
      </div>
    </div>
  );
};

export default function ManagerDashboard() {
  const { projectId } = useParams(); // Lấy ID từ URL
  const [activeTab, setActiveTab] = useState("overview");

  // State lưu thông tin dự án
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Sử dụng Hook hành động
  const { isActionLoading, handleChangeStatus } = useProjectActions(projectId);

  // Hàm lấy dữ liệu dự án từ BE
  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await getProjectDetail(projectId);
      setProject(data);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [projectId]);

  const renderTabContent = () => {
    if (loading && activeTab === "overview") {
      return (
        <div className="py-20 text-center text-gray-500">
          Đang tải dữ liệu dự án...
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return <OverviewContent project={project} />;
      case "upload":
        return <DatasetUpload />;
      case "distribution":
        return <WorkDistribution project={project} onRefresh={fetchDetail} />;
      case "tracking":
        return <TaskTracking />;
      case "labels":
        return <LabelSetEditor />;
      default:
        return null;
    }
  };

  return (
    <ManagerLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      // Truyền thêm header action để Dashboard có nút bấm
      rightHeader={
        <div className="flex gap-2">
          {project?.status === "Open" && (
            <button
              disabled={isActionLoading}
              onClick={() => handleChangeStatus("Closed", fetchDetail)}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              {isActionLoading ? "..." : "Đóng dự án"}
            </button>
          )}
        </div>
      }
    >
      {renderTabContent()}
    </ManagerLayout>
  );
}
