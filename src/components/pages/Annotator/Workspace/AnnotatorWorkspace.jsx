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
import {
  calculateIoU,
  applyNMS,
  getLabelDisplay,
} from "../../../../utils/aiHelper";

// 👉 TẬN DỤNG "BẢO BỐI" CỦA SẾP
import { VI_TO_EN_DICT } from "../../../../utils/dictionary";

// Hàm dịch ngầm Tiếng Việt -> Tiếng Anh dùng bộ từ điển chuẩn
const translateToEnglish = (viLabel) => {
  // Chuẩn hóa chữ Việt (bỏ dấu) để khớp với key trong VI_TO_EN_DICT của sếp
  const cleanVi = viLabel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  return VI_TO_EN_DICT[cleanVi] || viLabel.toLowerCase().trim();
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

  const uniqueLabels = React.useMemo(() => {
    return Array.from(
      new Map(availableLabels.map((item) => [item.name, item])).values(),
    );
  }, [availableLabels]);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../../../workers/aiWorker.js", import.meta.url),
      { type: "module" },
    );

    workerRef.current.onmessage = (event) => {
      const { status, data, result, task, message, error } = event.data;

      if (status === "progress") {
        if (data && data.total)
          setAiProgress(`${Math.round((data.loaded / data.total) * 100)}%`);
        else if (data && data.loaded)
          setAiProgress(`${(data.loaded / 1024 / 1024).toFixed(1)} MB`);
      } else if (status === "log") {
        console.log("🤖 AI Báo Cáo:", message);
      } else if (status === "error") {
        console.error("Lỗi AI:", error);
        setIsAILoading(false);
      } else if (status === "complete") {
        console.log(`AI [${task}] XONG:`, result);
        const currentAnnos = annotationsRef.current || [];

        // XỬ LÝ VIDEO & AUDIO
        if (task === "analyze_video" || task === "analyze_audio") {
          if (result && result.length > 0) {
            const aiEngLabel = result[0].label;

            const matched = uniqueLabels.find(
              (l) =>
                translateToEnglish(l.name) === aiEngLabel ||
                l.name.toLowerCase() === aiEngLabel.toLowerCase(),
            );

            if (matched) {
              setSelectedLabel(matched.name);
              setAnnotations([
                {
                  id: `ai_${task}_${Date.now()}`,
                  label: matched.name,
                  labelId: matched.id,
                  isAiGenerated: true,
                  text:
                    task === "analyze_video"
                      ? "Phân loại Video"
                      : "Phân loại Âm thanh",
                },
              ]);
            } else {
              alert(
                `🤖 AI phân tích được là '${aiEngLabel}' nhưng không có trong Bộ Nhãn của sếp!`,
              );
            }
          } else {
            alert("🤖 AI: Không chắc chắn nội dung này thuộc thể loại nào!");
          }
          setIsAILoading(false);
          return;
        }

        // XỬ LÝ ẢNH
        if (task === "detect_image") {
          if (!result || result.length === 0) {
            alert("🤖 AI: Không tìm thấy vật thể nào!");
            setIsAILoading(false);
            return;
          }
          const currentFile = fileDataRef.current;
          const img = new window.Image();
          img.src = currentFile.url;
          img.onload = () => {
            const scaleX = 800 / (img.naturalWidth || 800);
            const scaleY = 600 / (img.naturalHeight || 600);
            let newAnnos = [];
            result.forEach((item, index) => {
              const matched = uniqueLabels.find(
                (l) =>
                  translateToEnglish(l.name) === item.label.toLowerCase() ||
                  l.name.toLowerCase() === item.label.toLowerCase(),
              );
              if (matched) {
                newAnnos.push({
                  id: `ai_${Date.now()}_${index}`,
                  labelId: matched.id,
                  label: matched.name,
                  x: item.box.xmin * scaleX,
                  y: item.box.ymin * scaleY,
                  width: (item.box.xmax - item.box.xmin) * scaleX,
                  height: (item.box.ymax - item.box.ymin) * scaleY,
                  isAiGenerated: true,
                });
              }
            });
            setAnnotations([...currentAnnos, ...newAnnos]);
            setIsAILoading(false);
          };
          return;
        }

        // XỬ LÝ TEXT
        else if (task === "analyze_text") {
          const newTextAnnos = result.map((item) => {
            const matched =
              uniqueLabels.find(
                (l) =>
                  translateToEnglish(l.name) === item.label.toLowerCase() ||
                  l.name.toLowerCase() === item.label.toLowerCase(),
              ) || uniqueLabels[0];
            return {
              ...item,
              label: matched?.name,
              labelId: matched?.id,
              isAiGenerated: true,
            };
          });
          setAnnotations(
            [...currentAnnos, ...newTextAnnos].sort(
              (a, b) => a.start - b.start,
            ),
          );
        }
        setIsAILoading(false);
      }
    };
    return () => workerRef.current?.terminate();
  }, [uniqueLabels, setAnnotations, setSelectedLabel]);

  const getFileType = (url) => {
    if (!url) return "image";
    const urlL = url.toLowerCase();
    if (
      urlL.includes(".mp4") ||
      urlL.includes(".webm") ||
      urlL.includes(".mov")
    )
      return "video";
    if (urlL.includes(".mp3") || urlL.includes(".wav")) return "audio";
    if (urlL.includes(".txt")) return "text";
    return "image";
  };
  const actualType = getFileType(fileData?.url);

  const handleRunAI = async () => {
    if (!fileData?.url) return alert("Không tìm thấy đường dẫn file!");
    if (!uniqueLabels || uniqueLabels.length === 0)
      return alert("Sếp phải tạo Bộ Nhãn trước!");

    setIsAILoading(true);
    setAiProgress(0);

    // 👉 DỊCH BỘ NHÃN SANG TIẾNG ANH ĐỂ BƠM CHO AI CLAP/CLIP
    const translatedLabels = uniqueLabels.map((l) =>
      translateToEnglish(l.name),
    );

    try {
      if (actualType === "image") {
        workerRef.current.postMessage({
          type: "detect_image",
          payload: { imageSrc: fileData.url },
        });
      } else if (actualType === "video") {
        const tempVideo = document.createElement("video");
        tempVideo.crossOrigin = "anonymous";
        tempVideo.src = fileData.url;
        tempVideo.onloadeddata = () => {
          tempVideo.currentTime = 1;
        };
        tempVideo.onseeked = () => {
          const canvas = document.createElement("canvas");
          canvas.width = tempVideo.videoWidth;
          canvas.height = tempVideo.videoHeight;
          canvas
            .getContext("2d")
            .drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          workerRef.current.postMessage({
            type: "analyze_video",
            payload: {
              videoFrame: canvas.toDataURL("image/jpeg"),
              candidateLabels: translatedLabels,
            },
          });
        };
        tempVideo.onerror = () => {
          setIsAILoading(false);
          alert("Lỗi đọc Video!");
        };
      } else if (actualType === "audio") {
        try {
          const response = await fetch(fileData.url);
          const arrayBuffer = await response.arrayBuffer();
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const audioCtx = new AudioContext({ sampleRate: 48000 });
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const audioData = audioBuffer.getChannelData(0);

          workerRef.current.postMessage({
            type: "analyze_audio",
            payload: {
              audioData: audioData,
              candidateLabels: translatedLabels,
            },
          });
        } catch (err) {
          console.error(err);
          alert("Lỗi đọc dữ liệu âm thanh!");
          setIsAILoading(false);
        }
      } else if (actualType === "text") {
        const textContent = await fetch(fileData.url).then((r) => r.text());
        workerRef.current.postMessage({
          type: "analyze_text",
          payload: {
            text: textContent,
            candidateLabels: uniqueLabels.map((l) => l.name),
          },
        });
      }
    } catch (error) {
      console.error(error);
      setIsAILoading(false);
    }
  };

  const handleFlagClick = async () => {
    if (!currentFileId || !window.confirm("Báo lỗi file này?")) return;
    try {
      await flag(currentFileId);
      alert("Đã báo lỗi!");
    } catch {
      alert("Lỗi báo cáo.");
    }
  };

  const handleSubmitClick = async () => {
    if (!canEdit || !window.confirm("NỘP BÀI?")) return;
    try {
      await submit(activeTaskId);
      alert("Nộp bài thành công.");
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
      availableLabels: uniqueLabels,
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
            Làm việc
          </span>
          <button
            onClick={handleRunAI}
            disabled={!canEdit || isAILoading || !fileData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 text-white text-xs font-bold rounded-md disabled:opacity-50"
          >
            {isAILoading ? (
              <span className="animate-pulse">⏳ Đang phân tích...</span>
            ) : (
              <>
                <Sparkles size={14} /> AI Suggest
              </>
            )}
          </button>
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
              Chế độ:{" "}
              {actualType === "video"
                ? "Phân loại Video"
                : actualType === "audio"
                  ? "Phân loại Âm thanh"
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
          availableLabels={uniqueLabels}
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
