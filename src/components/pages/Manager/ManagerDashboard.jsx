import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ManagerLayout from "./ManagerLayout";
import DatasetUpload from "./DatasetUpload";
import WorkDistribution from "./WorkDistribution";
import LabelSetEditor from "./LabelSetEditor";
import TaskTracking from "./TaskTracking";

// 1. Thay getUsersList bằng 2 API available cho chuẩn xác
import {
  getProjectDetail,
  getAvailableAnnotators,
  getAvailableReviewers,
} from "../../../api/managerApi";
import { useProjectActions } from "../../../hooks/useProjectActions";
import { useProjectStats } from "../../../hooks/useProjectStats";

const OverviewContent = ({ project, projectId, allUsers }) => {
  const { stats, performance, isLoadingStats } = useProjectStats(projectId);

  const totalItems =
    stats?.totalItems || stats?.totalDataItems || project?.totalDataItems || 0;
  const labeledItems = stats?.labeledItems || stats?.completedItems || 0;
  const progressRate =
    stats?.progressRate ||
    stats?.progress ||
    (totalItems > 0 ? Math.round((labeledItems / totalItems) * 100) : 0);
  const pendingItems = totalItems - labeledItems;

  return (
    <div className="space-y-6">
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
          className={`px-3 py-1 rounded-full text-xs font-bold ${project?.status === "Open" || project?.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}
        >
          {project?.status || "Unknown"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm relative overflow-hidden">
          <h3 className="text-gray-400 text-sm font-medium relative z-10">
            Total Items
          </h3>
          <p className="text-4xl font-bold text-white mt-3 mb-6 relative z-10">
            {totalItems}
          </p>
          <div className="w-full bg-[#0B1120] h-1.5 rounded-full relative z-10"></div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Labeled</h3>
          <p className="text-4xl font-bold text-[#3B82F6] mt-3 mb-6">
            {isLoadingStats ? "..." : labeledItems}
          </p>
          <p className="text-xs text-gray-500 italic">
            Còn lại {pendingItems > 0 ? pendingItems : 0} items
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Progress</h3>
          <p className="text-4xl font-bold text-[#10B981] mt-3 mb-6">
            {isLoadingStats ? "..." : `${progressRate}%`}
          </p>
          <div className="w-full bg-[#0B1120] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#10B981] h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressRate}%` }}
            ></div>
          </div>
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
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-8 shadow-sm h-fit">
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

        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col h-[400px]">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Annotator Performance
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Năng suất làm việc của nhân sự
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {isLoadingStats ? (
              <div className="text-center py-10 text-gray-500 text-sm animate-pulse">
                Đang phân tích số liệu...
              </div>
            ) : performance.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="text-3xl mb-2">📊</span>
                <p className="text-sm">Chưa có dữ liệu hiệu suất.</p>
                <p className="text-xs mt-1">
                  Hãy giao Task cho Annotator trước.
                </p>
              </div>
            ) : (
              performance.map((perf, idx) => {
                // Lấy userId (chữ d thường) từ API performance
                const uid = perf.userId;

                // DÒ TÊN: So sánh với trường userID (chữ D hoa) từ danh sách tổng
                const matchedUser = allUsers.find(
                  (u) => u.userID === uid || u.userId === uid || u.id === uid,
                );

                // Lấy fullName
                const name =
                  matchedUser?.fullName ||
                  `User #${uid?.substring(0, 5) || "N/A"}`;

                // Map đúng các biến thống kê từ BE
                const total = perf.totalTasks || 0;
                const approved = perf.approvedTasks || 0;
                const rejectRate = perf.rejectRate || 0;

                return (
                  <div
                    key={idx}
                    className="bg-[#0B1120] border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Tỉ lệ sai sót:{" "}
                            <span
                              className={
                                rejectRate > 20
                                  ? "text-rose-400 font-bold"
                                  : "text-emerald-400"
                              }
                            >
                              {rejectRate}%
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-400">
                          {approved} / {total}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          Đã duyệt / Tổng
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-[#151D2F] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{
                          width: `${total > 0 ? (approved / total) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ManagerDashboard() {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]); // Chứa cả Annotator lẫn Reviewer
  const [loading, setLoading] = useState(true);

  const { isActionLoading, handleChangeStatus } = useProjectActions(projectId);

  // GỌI 3 API CÙNG LÚC ĐỂ LẤY FULL DATA TÊN
  const fetchDetailAndUsers = async () => {
    try {
      setLoading(true);
      const [projData, annRes, revRes] = await Promise.all([
        getProjectDetail(projectId),
        getAvailableAnnotators().catch(() => []),
        getAvailableReviewers().catch(() => []),
      ]);

      const annotators = Array.isArray(annRes) ? annRes : annRes?.data || [];
      const reviewers = Array.isArray(revRes) ? revRes : revRes?.data || [];

      // Gộp 2 mảng lại thành 1 kho từ điển để dò tên
      setProject(projData);
      setAllUsers([...annotators, ...reviewers]);
    } catch (error) {
      console.error("Lỗi kéo data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailAndUsers();
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
        return (
          <OverviewContent
            project={project}
            projectId={projectId}
            allUsers={allUsers}
          />
        );
      case "upload":
        return <DatasetUpload />;
      case "distribution":
        return (
          <WorkDistribution project={project} onRefresh={fetchDetailAndUsers} />
        );
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
      rightHeader={
        <div className="flex gap-2">
          {project?.status === "Open" && (
            <button
              disabled={isActionLoading}
              onClick={() => handleChangeStatus("Closed", fetchDetailAndUsers)}
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
