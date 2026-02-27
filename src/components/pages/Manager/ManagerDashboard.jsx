import React, { useState } from "react";
import ManagerLayout from "./ManagerLayout";
import DatasetUpload from "./DatasetUpload";
import WorkDistribution from "./WorkDistribution";
import LabelSetEditor from "./LabelSetEditor";
import TaskTracking from "./TaskTracking"; // <-- Đã import thêm Tab Tracking

// Tách Component Overview Content ra cho code sạch sẽ
const OverviewContent = () => {
  return (
    <div className="space-y-6">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Total Images</h3>
          <p className="text-4xl font-bold text-white mt-3 mb-6">500</p>
          <div className="w-full bg-[#0B1120] h-1.5 rounded-full"></div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Labeled</h3>
          <p className="text-4xl font-bold text-[#3B82F6] mt-3 mb-6">320</p>
          <div className="w-full bg-[#0B1120] h-1.5 rounded-full mb-3">
            <div
              className="bg-[#3B82F6] h-1.5 rounded-full"
              style={{ width: "64%" }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">64% complete</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Approved</h3>
          <p className="text-4xl font-bold text-[#10B981] mt-3 mb-6">275</p>
          <div className="w-full bg-[#0B1120] h-1.5 rounded-full mb-3">
            <div
              className="bg-[#10B981] h-1.5 rounded-full"
              style={{ width: "55%" }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">55% approved</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Rejected</h3>
          <p className="text-4xl font-bold text-[#F43F5E] mt-3 mb-6">45</p>
          <div className="w-full bg-[#0B1120] h-1.5 rounded-full mb-3">
            <div
              className="bg-[#F43F5E] h-1.5 rounded-full"
              style={{ width: "9%" }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">9% rejected</p>
        </div>
      </div>

      {/* Gộp Project Progress và Annotator Performance vào 1 dòng (Grid 2 cột) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress (Giữ nguyên của ông) */}
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white">
              Project Progress
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Overall dataset labeling status
            </p>
          </div>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-sm mb-3 text-gray-300">
                <span className="font-medium">Labeling Progress</span>
                <span className="text-gray-400">320 / 500</span>
              </div>
              <div className="w-full bg-[#0B1120] h-2.5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="bg-[#1E293B] h-2.5 rounded-full"
                  style={{ width: "64%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-3 text-gray-300">
                <span className="font-medium">Quality Approved</span>
                <span className="text-gray-400">275 / 320</span>
              </div>
              <div className="w-full bg-[#0B1120] h-2.5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="bg-[#1E293B] h-2.5 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* MỚI THÊM: Bảng Năng Suất Annotator */}
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Annotator Performance
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Task completion and quality in this project
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-[#0B1120] rounded-lg border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">
                  Sarah Annotator
                </p>
                <p className="text-xs text-emerald-400">Avg. 95% Approved</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">180</p>
                <p className="text-xs text-gray-500">tasks done</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-[#0B1120] rounded-lg border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Lisa Annotator</p>
                <p className="text-xs text-amber-400">Avg. 70% Approved</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">95</p>
                <p className="text-xs text-gray-500">tasks done</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component Assembly
export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewContent />;
      case "upload":
        return <DatasetUpload />;
      case "distribution":
        return <WorkDistribution />;
      case "tracking": // <-- MỚI THÊM: Tab Tracking
        return <TaskTracking />;
      case "labels":
        return <LabelSetEditor />;
      default:
        return null;
    }
  };

  return (
    <ManagerLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </ManagerLayout>
  );
}
