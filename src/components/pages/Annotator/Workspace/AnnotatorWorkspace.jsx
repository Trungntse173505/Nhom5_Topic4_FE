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

// 👉 HÀM KHỬ DẤU TIẾNG VIỆT & DẤU CÁCH
const normalizeText = (text) => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

// 👉 TỪ ĐIỂN MAP NHÃN
const VI_TO_EN_DICT = {
  "trai tim": "heart",
  "ma qr": "qr code",
  "xe may": "motorcycle",
  "xe buyt": "bus",
  "xe tai": "truck",
  "o to": "car",
  nguoi: "person",
  meo: "cat",
  cho: "dog",
};

// 🧠 THUẬT TOÁN NMS: TÍNH TOÁN ĐỘ ĐÈ NHAU CỦA 2 KHUNG (IoU)
const calculateIoU = (box1, box2) => {
  const xA = Math.max(box1.x, box2.x);
  const yA = Math.max(box1.y, box2.y);
  const xB = Math.min(box1.x + box1.width, box2.x + box2.width);
  const yB = Math.min(box1.y + box1.height, box2.y + box2.height);

  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const box1Area = box1.width * box1.height;
  const box2Area = box2.width * box2.height;
  const iou = interArea / (box1Area + box2Area - interArea);

  return iou;
};

// 🧠 THUẬT TOÁN NMS: LỌC BỎ KHUNG TRÙNG LẶP
const applyNMS = (boxes, iouThreshold = 0.4) => {
  // Sắp xếp khung theo điểm tự tin từ cao xuống thấp
  const sortedBoxes = [...boxes].sort((a, b) => b.score - a.score);
  const selectedBoxes = [];

  while (sortedBoxes.length > 0) {
    const currentBox = sortedBoxes.shift(); // Lấy khung có điểm cao nhất
    selectedBoxes.push(currentBox);

    // Xóa tất cả các khung bị đè lên khung hiện tại quá nhiều (>= 40%)
    for (let i = sortedBoxes.length - 1; i >= 0; i--) {
      if (calculateIoU(currentBox, sortedBoxes[i]) > iouThreshold) {
        sortedBoxes.splice(i, 1);
      }
    }
  }
  return selectedBoxes;
};

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
    status,
  } = useWorkspace(activeTaskId);

  const canEdit = status === "InProgress" || status === "Rejected";

  const { submit } = useSubmitTask();
  const { flag } = useFlagItem();

  const workerRef = useRef(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);

  const annotationsRef = useRef(annotations);
  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  const fileDataRef = useRef(null);
  const fileData = files.find((f) => f.id === currentFileId);
  useEffect(() => {
    fileDataRef.current = fileData;
  }, [fileData]);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../../../workers/aiWorker.js", import.meta.url),
      { type: "module" },
    );

    workerRef.current.onmessage = (event) => {
      const { status, data, result, task, message } = event.data;

      if (status === "progress") {
        setAiProgress(Math.round((data.loaded / data.total) * 100) || 0);
      } else if (status === "log") {
        console.log("🤖 AI Báo Cáo:", message);
      } else if (status === "complete") {
        console.log(`AI [${task}] TRẢ VỀ KẾT QUẢ CUỐI CÙNG:`, result);

        const currentAnnos = annotationsRef.current || [];

        // 1. DÀNH CHO ẢNH VÀ VIDEO
        if (task === "detect_image" || task === "detect") {
          if (!result || result.length === 0) {
            alert("🤖 AI: Bức ảnh này trống trơn, không tìm thấy gì!");
            setIsAILoading(false);
            return;
          }

          const currentFile = fileDataRef.current;
          if (!currentFile || !currentFile.url) return;

          const img = new window.Image();
          img.src = currentFile.url;
          img.onload = () => {
            const origW = img.naturalWidth || 800;
            const origH = img.naturalHeight || 600;

            const scaleX = 800 / origW;
            const scaleY = 600 / origH;

            let newAnnotations = [];

            result.forEach((item, index) => {
              const aiLabel = item.label.toLowerCase();

              const matchedLabel = availableLabels.find((l) => {
                const cleanViName = normalizeText(l.name);
                const enName = VI_TO_EN_DICT[cleanViName] || cleanViName;
                return enName === aiLabel;
              });

              if (matchedLabel) {
                newAnnotations.push({
                  id: `ai_generated_${Date.now()}_${index}`,
                  labelId: matchedLabel.id,
                  label: matchedLabel.name,
                  x: item.box.xmin * scaleX,
                  y: item.box.ymin * scaleY,
                  width: (item.box.xmax - item.box.xmin) * scaleX,
                  height: (item.box.ymax - item.box.ymin) * scaleY,
                  score: item.score,
                  isAiGenerated: true,
                });
              }
            });

            if (newAnnotations.length === 0) {
              alert(
                "🤖 AI: Đã quét xong nhưng KHÔNG CÓ vật thể nào thuộc Bộ Nhãn của bạn!",
              );
            } else {
              // 👉 ÁP DỤNG LƯỚI LỌC NMS ĐỂ XÓA CÁC KHUNG BỊ ĐÈ NHAU
              const cleanAnnotations = applyNMS(newAnnotations, 0.4);

              setAnnotations([...currentAnnos, ...cleanAnnotations]);
            }

            setIsAILoading(false);
          };

          return;
        }

        // 2. DÀNH CHO AUDIO
        else if (task === "transcribe_audio") {
          alert("🤖 AI đã dịch xong Audio (Xem console log).");
        }

        // 3. DÀNH CHO VĂN BẢN
        else if (task === "analyze_text") {
          if (!result || result.length === 0) {
            alert("🤖 AI: Đã đọc xong nhưng không khớp nhãn nào!");
          } else {
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
            const combined = [...currentAnnos, ...newTextAnnotations];
            setAnnotations(combined.sort((a, b) => a.start - b.start));
          }
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

  const getFileType = (url) => {
    if (!url) return "image";
    const urlLower = url.toLowerCase();
    if (
      urlLower.includes(".mp4") ||
      urlLower.includes(".webm") ||
      urlLower.includes(".mov")
    )
      return "video";
    if (urlLower.includes(".mp3") || urlLower.includes(".wav")) return "audio";
    if (urlLower.includes(".txt")) return "text";
    return "image";
  };
  const actualType = getFileType(fileData?.url);

  const handleRunAI = async () => {
    if (!fileData?.url)
      return alert("Không tìm thấy đường dẫn file để chạy AI!");
    if (!availableLabels || availableLabels.length === 0)
      return alert("Sếp phải tạo Bộ Nhãn trước!");

    setIsAILoading(true);
    try {
      if (actualType === "image") {
        workerRef.current.postMessage({
          type: "detect_image",
          payload: { imageSrc: fileData.url },
        });
      } else if (actualType === "video") {
        alert("Tính năng AI cho Video đang giả lập.");
        workerRef.current.postMessage({
          type: "detect_image",
          payload: { imageSrc: fileData.url },
        });
      } else if (actualType === "audio") {
        alert("Tính năng AI cho Audio đang giả lập.");
        setIsAILoading(false);
      } else if (actualType === "text") {
        const textContent = await fetch(fileData.url).then((r) => r.text());
        const candidateLabelsText = availableLabels.map((l) => l.name);
        workerRef.current.postMessage({
          type: "analyze_text",
          payload: { text: textContent, candidateLabels: candidateLabelsText },
        });
      }
    } catch (error) {
      console.error(error);
      setIsAILoading(false);
      alert("Lỗi khi chuẩn bị file cho AI.");
    }
  };

  const handleFlagClick = async () => {
    if (!currentFileId || !window.confirm("File bị mờ/hỏng. Báo lỗi?")) return;
    try {
      await flag(currentFileId);
      alert("Đã báo lỗi!");
    } catch {
      alert("Lỗi báo cáo.");
    }
  };

  const handleSubmitClick = async () => {
    if (!canEdit || !window.confirm("Bạn có chắc chắn muốn NỘP BÀI?")) return;
    try {
      await submit(activeTaskId);
      alert("🎉 Chúc mừng! Bạn đã nộp bài thành công.");
      navigate("/annotator");
    } catch (err) {
      alert(err?.response?.data || "Chưa thể nộp bài!");
    }
  };

  const renderEditor = () => {
    if (isLoading)
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        </div>
      );
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

  if (!activeTaskId)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Lỗi: Không tìm thấy ID Task.
      </div>
    );

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
              disabled={!canEdit || isAILoading || !fileData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 text-white text-xs font-bold rounded-md disabled:opacity-50"
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
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${selectedTool === tool ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700"}`}
                >
                  {tool}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm font-medium text-blue-400 bg-blue-900/30 px-4 py-1.5 rounded border border-blue-500/30">
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
            disabled={!canEdit}
            className="flex items-center gap-2 bg-red-900/30 text-red-400 px-3 py-2 rounded text-sm font-medium disabled:opacity-50"
          >
            <AlertTriangle size={16} /> Báo lỗi
          </button>
          <button
            onClick={handleSave}
            disabled={!canEdit || isSaving || isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium disabled:opacity-50"
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
            disabled={!canEdit}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
          >
            <Send size={16} /> Nộp Bài
          </button>
          <button
            onClick={() => navigate("/annotator")}
            className="p-2 ml-1 text-gray-400 hover:text-white rounded"
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
