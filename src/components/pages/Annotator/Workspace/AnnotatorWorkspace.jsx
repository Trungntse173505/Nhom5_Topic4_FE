// Đường dẫn: src/pages/Annotator/Workspace/AnnotatorWorkspace.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import ImageCanvas from "./ImageCanvas";
import VideoCanvas from "./VideoCanvas";
import TextEditor from "./TextEditor";
import AudioEditor from "./AudioEditor";
import {
  Save,
  LogOut,
  Loader2,
  AlertTriangle,
  Send,
  Sparkles,
} from "lucide-react";

import { useWorkspace } from "../../../../hooks/Annotator/useWorkspace";
import { useSubmitTask } from "../../../../hooks/Annotator/useSubmitTask";
import { useFlagItem } from "../../../../hooks/Annotator/useFlagItem";

const AnnotatorWorkspace = () => {
  const { taskId, id } = useParams();
  const activeTaskId = taskId || id;
  const navigate = useNavigate();

  const {
    files = [],
    currentFileId,
    handleSelectFile,
    availableLabels,
    selectedTool,
    setSelectedTool,
    selectedLabel,
    setSelectedLabel,
    annotations,
    setAnnotations,
    isLoading,
    isSaving,
    handleSave,
    toolbarConfig = [],
  } = useWorkspace(activeTaskId);

  const { submit } = useSubmitTask();
  const { flag } = useFlagItem();

  // ==========================================
  // VÙNG CODE MỚI: TÍCH HỢP EDGE AI
  // ==========================================
  const workerRef = useRef(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);

  // BÍ KÍP TRỊ LỖI UI: Bắt cóc state annotations hiện tại để AI không bị "mù"
  const annotationsRef = useRef(annotations);
  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  useEffect(() => {
    // KẾT NỐI XUỐNG TẦNG HẦM AI
    workerRef.current = new Worker(
      new URL("../../../../workers/aiWorker.js", import.meta.url),
      {
        type: "module",
      },
    );

    workerRef.current.onmessage = (event) => {
      const { status, data, result, task, message } = event.data;

      if (status === "progress") {
        setAiProgress(Math.round((data.loaded / data.total) * 100) || 0);
      } else if (status === "log") {
        console.log("🤖 AI Báo Cáo:", message);
      } else if (status === "complete") {
        console.log(`AI [${task}] TRẢ VỀ KẾT QUẢ CUỐI CÙNG:`, result);

        // Lấy danh sách annotations hiện hành trên màn hình
        const currentAnnos = annotationsRef.current || [];

        // 1. DÀNH CHO ẢNH VÀ VIDEO (VẼ KHUNG)
        if (task === "detect_image" || task === "detect") {
          const newAnnotations = result.map((item, index) => {
            const matchedLabel =
              availableLabels.find(
                (l) => l.name.toLowerCase() === item.label.toLowerCase(),
              ) || availableLabels[0];

            return {
              id: `ai_generated_${Date.now()}_${index}`,
              labelId: matchedLabel?.id || "unknown",
              labelName: item.label,
              x: item.box.xmin,
              y: item.box.ymin,
              width: item.box.xmax - item.box.xmin,
              height: item.box.ymax - item.box.ymin,
              score: item.score,
              isAiGenerated: true,
            };
          });

          // Bơm data ảnh kiểu mới (Ép trực tiếp mảng)
          setAnnotations([...currentAnnos, ...newAnnotations]);
        }

        // 2. DÀNH CHO AUDIO (TẠO KHUNG SÓNG ÂM)
        else if (task === "transcribe_audio") {
          alert("AI đã dịch xong Audio (Xem console log).");
        }

        // 3. DÀNH CHO VĂN BẢN (TỰ BÔI ĐEN VÀ GẮN NHÃN) - ĐẢM BẢO 100% LÊN MÀU
        else if (task === "analyze_text") {
          const newTextAnnotations = result.map((item) => {
            const matchedLabel =
              availableLabels.find((l) => l.name === item.label) ||
              availableLabels[0];

            return {
              start: item.start,
              end: item.end,
              label: matchedLabel?.name || "AI_Suggest",
              labelId: matchedLabel?.id,
              text: item.text,
              score: item.score,
              isAiGenerated: true,
            };
          });

          // Trộn data cũ trên màn hình với data AI vừa quét ra
          const combined = [...currentAnnos, ...newTextAnnotations];
          // Sắp xếp lại từ trái qua phải để TextEditor không bị lú
          setAnnotations(combined.sort((a, b) => a.start - b.start));
        }

        setIsAILoading(false);
      } else if (status === "error") {
        console.error("Lỗi AI:", event.data.error);
        alert("Lỗi quá trình chạy AI trên trình duyệt!");
        setIsAILoading(false);
      }
    };

    return () => workerRef.current?.terminate();
  }, [availableLabels, setAnnotations]);

  const fileData = files.find((f) => f.id === currentFileId);

  const getFileType = (url) => {
    if (!url) return "image";
    const urlLower = url.toLowerCase();

    if (
      urlLower.includes(".mp4") ||
      urlLower.includes(".webm") ||
      urlLower.includes(".mov")
    ) {
      return "video";
    }
    if (urlLower.includes(".mp3") || urlLower.includes(".wav")) {
      return "audio";
    }
    if (urlLower.includes(".txt")) {
      return "text";
    }
    return "image";
  };

  const actualType = getFileType(fileData?.url);

  const handleRunAI = async () => {
    if (!fileData?.url)
      return alert("Không tìm thấy đường dẫn file để chạy AI!");

    setIsAILoading(true);

    try {
      if (actualType === "image") {
        workerRef.current.postMessage({
          type: "detect_image",
          payload: { imageSrc: fileData.url },
        });
      } else if (actualType === "video") {
        alert(
          "Tính năng AI cho Video đang giả lập. Sẽ gửi link video gốc như là ảnh.",
        );
        workerRef.current.postMessage({
          type: "detect_image",
          payload: { imageSrc: fileData.url },
        });
      } else if (actualType === "audio") {
        alert("Tính năng AI cho Audio đang giả lập.");
        setIsAILoading(false);
      }

      // LUỒNG XỬ LÝ VĂN BẢN
      else if (actualType === "text") {
        if (!availableLabels || availableLabels.length === 0) {
          setIsAILoading(false);
          return alert(
            "Sếp phải tạo Bộ Nhãn (Pháp luật, Thể thao...) trước thì AI mới biết đường phân loại!",
          );
        }

        const textContent = await fetch(fileData.url).then((r) => r.text());
        const candidateLabels = availableLabels.map((l) => l.name);

        workerRef.current.postMessage({
          type: "analyze_text",
          payload: {
            text: textContent,
            candidateLabels: candidateLabels,
          },
        });
      }
    } catch (error) {
      console.error(error);
      setIsAILoading(false);
      alert("Lỗi khi chuẩn bị file cho AI.");
    }
  };
  // ==========================================

  const handleFlagClick = async () => {
    if (
      !currentFileId ||
      !window.confirm("File này bị mờ/hỏng. Bạn có chắc muốn báo lỗi?")
    )
      return;
    try {
      await flag(currentFileId);
      alert("Đã đánh dấu file bị lỗi!");
    } catch {
      alert("Lỗi: Không thể báo lỗi file này.");
    }
  };

  const handleSubmitClick = async () => {
    if (!canEdit || !window.confirm("Bạn có chắc chắn muốn NỘP BÀI?")) return;
    try {
      await submit(activeTaskId);
      alert("🎉 Chúc mừng! Bạn đã nộp bài thành công.");
      navigate("/annotator");
    } catch (err) {
      alert(err?.response?.data || "Chưa thể nộp bài. Hãy kiểm tra lại!");
    }
  };

  const renderEditor = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        </div>
      );
    }

    const props = {
      selectedTool,
      selectedLabel,
      annotations,
      setAnnotations,
      fileData,
      availableLabels,
    };

    if (actualType === "video")
      return <VideoCanvas {...props} videoUrl={fileData?.url} />;
    if (actualType === "text") return <TextEditor {...props} />;
    if (actualType === "audio") return <AudioEditor {...props} />;
    return <ImageCanvas {...props} imageUrl={fileData?.url} />;
  };

  if (!activeTaskId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Lỗi: Không tìm thấy ID Task.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200">
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-700 bg-gray-800">
        <div className="flex-1 flex items-center gap-4">
          <span className="font-bold text-gray-400 text-sm uppercase">
            Không gian làm việc
          </span>

          {(actualType === "image" ||
            actualType === "video" ||
            actualType === "audio" ||
            actualType === "text") && (
            <button
              onClick={handleRunAI}
              disabled={isAILoading || !fileData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-md shadow-lg shadow-purple-500/10 transition-all border border-purple-500/30 disabled:opacity-50"
            >
              {isAILoading ? (
                <span className="animate-pulse">
                  ⏳ Đang soi ({aiProgress}%)...
                </span>
              ) : (
                <>
                  <Sparkles size={14} /> AI Suggest
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex justify-center flex-1">
          {actualType === "image" ? (
            <div className="flex bg-gray-900 p-1 rounded border border-gray-700">
              {toolbarConfig.map((tool) => (
                <button
                  key={tool}
                  onClick={() => setSelectedTool(tool)}
                  disabled={!canEdit}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    selectedTool === tool
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm font-medium text-blue-400 bg-blue-900/30 border border-blue-500/30 px-4 py-1.5 rounded">
              Chế độ: Phân loại{" "}
              {actualType === "video"
                ? "Video"
                : actualType === "audio"
                  ? "Âm thanh"
                  : actualType === "text"
                    ? "Văn bản"
                    : "Dữ liệu"}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 flex-1">
          <button
            onClick={handleFlagClick}
            className="flex items-center gap-2 bg-red-900/30 text-red-400 hover:bg-red-800/50 border border-red-500/30 px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            <AlertTriangle size={16} /> Báo lỗi
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Save size={16} />
            )}{" "}
            Lưu
          </button>

          <div className="w-px h-6 bg-gray-600 mx-1"></div>

          <button
            onClick={handleSubmitClick}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            <Send size={16} /> Nộp Bài
          </button>

          <button
            onClick={() => navigate("/annotator")}
            className="p-2 ml-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SidebarLeft
          files={files}
          currentItemId={currentFileId}
          onSelectItem={handleSelectFile}
        />
        <main className="flex-1 overflow-hidden relative flex flex-col bg-[#0b1220]">
          {renderEditor()}
        </main>
        <SidebarRight
          availableLabels={availableLabels}
          selectedLabel={selectedLabel}
          setSelectedLabel={setSelectedLabel}
          actualType={actualType}
          annotations={annotations}
          setAnnotations={setAnnotations}
        />
      </div>
    </div>
  );
};

export default AnnotatorWorkspace;
