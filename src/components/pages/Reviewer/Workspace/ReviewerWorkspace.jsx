import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReviewerSidebarLeft from "./ReviewerSidebarLeft";
import ReviewerSidebarRight from "./ReviewerSidebarRight";

// IMPORT TẤT CẢ CÁC LOẠI CANVAS VÀO ĐÂY
import ReviewerCanvas from "./ReviewerCanvas"; // Hình ảnh
import ReviewerVideoCanvas from "./ReviewerVideoCanvas"; // Video
import ReviewerTextViewer from "./ReviewerTextViewer"; // Văn bản
import ReviewerAudioViewer from "./ReviewerAudioViewer"; // Âm thanh

import { LogOut, Loader2, ArrowLeft } from "lucide-react";
import { useTaskDetail } from "../../../../hooks/Reviewer/useTaskDetail";
import { useReviewerActions } from "../../../../hooks/Reviewer/useReviewActions";

// HÀM BẢO BỐI: Tự động phân loại file dựa trên đuôi file (extension)
const getFileType = (filePath) => {
  if (!filePath) return "image"; // Fallback an toàn

  const ext = filePath.split("?")[0].split(".").pop().toLowerCase();

  if (["mp4", "avi", "mov", "mkv", "webm"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "flac", "m4a"].includes(ext)) return "audio";
  if (["txt", "csv", "json", "pdf", "doc", "docx"].includes(ext)) return "text";

  return "image"; // Mặc định là ảnh (jpg, png, jpeg...)
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

  const currentItem = taskDetail.items?.[currentImageIndex];

  // SOI ĐUÔI FILE HIỆN TẠI ĐỂ QUYẾT ĐỊNH RENDER CANVAS NÀO
  const currentFileType = getFileType(currentItem?.filePath);

  // HÀM CHIA VIỆC RENDER CANVAS
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
            availableLabels={taskDetail?.availableLabels || []}
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
        {/* SIDEBAR TRÁI */}
        <ReviewerSidebarLeft
          items={taskDetail.items}
          currentIndex={currentImageIndex}
          onSelectIndex={setCurrentImageIndex}
        />

        {/* CANVAS CHÍNH (TỰ ĐỘNG THAY ĐỔI THEO LOẠI FILE) */}
        <main className="flex-1 overflow-hidden relative flex flex-col bg-[#0b1220] p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-800 flex-1 overflow-hidden flex items-center justify-center relative">
            {renderCanvas()}
          </div>
        </main>

        {/* SIDEBAR PHẢI */}
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
