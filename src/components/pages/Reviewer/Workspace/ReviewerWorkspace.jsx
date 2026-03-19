// Đường dẫn: src/pages/Reviewer/Workspace/ReviewerWorkspace.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReviewerSidebarLeft from "./ReviewerSidebarLeft";
import ReviewerSidebarRight from "./ReviewerSidebarRight";

import ReviewerCanvas from "./ReviewerCanvas";
import ReviewerVideoCanvas from "./ReviewerVideoCanvas";
import ReviewerTextViewer from "./ReviewerTextViewer";
import ReviewerAudioViewer from "./ReviewerAudioViewer";

import { LogOut, Loader2, ArrowLeft } from "lucide-react";
import { useTaskDetail } from "../../../../hooks/Reviewer/useTaskDetail";
import { useReviewerActions } from "../../../../hooks/Reviewer/useReviewActions";

const getFileType = (filePath) => {
  if (!filePath) return "image";

  const ext = filePath.split("?")[0].split(".").pop().toLowerCase();

  if (["mp4", "avi", "mov", "mkv", "webm"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "flac", "m4a"].includes(ext)) return "audio";
  if (["txt", "csv", "json", "pdf", "doc", "docx"].includes(ext)) return "text";

  return "image";
};

const ReviewerWorkspace = () => {
  const params = useParams();
  const activeTaskId = params.taskId || params.id;
  const navigate = useNavigate();

  const { taskDetail, isLoading, error, toggleAnnotationApproval } =
    useTaskDetail(activeTaskId);
  const { approveTask, rejectTask, isProcessing } = useReviewerActions();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeBoxId, setActiveBoxId] = useState(null);

  useEffect(() => {
    setActiveBoxId(null);
  }, [currentImageIndex]);

  if (isLoading)
    return (
      <div className="flex h-screen bg-[#0f172a] items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  if (error || !taskDetail)
    return (
      <div className="flex h-screen bg-[#0f172a] items-center justify-center text-white flex-col gap-4">
        <p>Lỗi: Không tìm thấy dữ liệu Task ({error})</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Quay lại
        </button>
      </div>
    );

  // 🚨 BẬT RADAR QUÉT TÌM BẢNG MÀU TRONG API REVIEWER 🚨
  console.log(
    "🕵️‍♂️ KIỂM TRA DỮ LIỆU TỪ BACKEND TRẢ VỀ (taskDetail):",
    taskDetail,
  );

  // Càn quét mọi ngóc ngách để tìm mảng labels
  const labelsList =
    taskDetail?.availableLabels ||
    taskDetail?.labels ||
    taskDetail?.project?.labels ||
    taskDetail?.project?.labelDefs ||
    taskDetail?.projectLabels ||
    taskDetail?.categories ||
    [];

  console.log("🎨 Mảng Label moi được từ Backend:", labelsList);

  const currentItem = taskDetail.items?.[currentImageIndex];
  const currentFileType = getFileType(currentItem?.filePath);

  const renderCanvas = () => {
    if (!currentItem)
      return <div className="text-slate-500">Không có dữ liệu</div>;

    const commonProps = {
      currentItem,
      toggleAnnotationApproval,
      activeBoxId,
      setActiveBoxId,
    };

    switch (currentFileType) {
      case "video":
        return <ReviewerVideoCanvas {...commonProps} />;
      case "audio":
        return <ReviewerAudioViewer currentItem={currentItem} />;
      case "text":
        return (
          <ReviewerTextViewer
            currentItem={currentItem}
            activeAnnotationId={activeBoxId}
            setActiveAnnotationId={setActiveBoxId}
            // 👉 ÉP TRUYỀN BẢNG MÀU VÀO ĐÂY
            availableLabels={labelsList}
          />
        );
      case "image":
      default:
        return <ReviewerCanvas {...commonProps} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200">
      <header className="flex justify-between items-center px-6 py-3 border-b border-slate-800 bg-[#1e293b]">
        <div className="flex items-center gap-4 flex-1 text-left">
          <button
            onClick={() => navigate("/reviewer")}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              {taskDetail.taskName}
            </h1>
            <p className="text-xs text-slate-400">
              {taskDetail.projectName} • {taskDetail.taskID?.substring(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0f172a] px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 text-sm font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
            Đang duyệt bài
          </div>
          <div className="w-px h-6 bg-slate-700 mx-1"></div>
          <button
            onClick={() => navigate("/reviewer")}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <ReviewerSidebarLeft
          items={taskDetail.items}
          currentIndex={currentImageIndex}
          onSelectIndex={setCurrentImageIndex}
        />
        <main className="flex-1 overflow-hidden relative flex flex-col bg-[#0b1220] p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-800 flex-1 overflow-hidden flex items-center justify-center relative">
            {renderCanvas()}
          </div>
        </main>
        <ReviewerSidebarRight
          taskId={activeTaskId}
          items={taskDetail.items}
          onSelectIndex={setCurrentImageIndex}
          currentItem={currentItem}
          toggleAnnotationApproval={toggleAnnotationApproval}
          approveTask={approveTask}
          rejectTask={rejectTask}
          isProcessing={isProcessing}
          activeBoxId={activeBoxId}
          setActiveBoxId={setActiveBoxId}
        />
      </div>
    </div>
  );
};

export default ReviewerWorkspace;
