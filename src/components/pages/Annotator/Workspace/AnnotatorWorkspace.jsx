import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import ImageCanvas from "./ImageCanvas/index";
import VideoCanvas from "./VideoCanvas/index";
import TextEditor from "./TextEditor/index";
import AudioEditor from "./AudioEditor/index";
import { Save, LogOut, Loader2, Send, Sparkles, Scale, XCircle, Tag } from "lucide-react";

import { useWorkspace } from "../../../../hooks/Annotator/useWorkspace";
import { useSubmitTask } from "../../../../hooks/Annotator/useSubmitTask";
import { useAIAssistant } from "../../../../hooks/useAIAssistant";
import RejectTaskModals from "./../Dispute/RejectTaskModals"; 

// 🔥 IMPORT COMPONENT MODAL BÁO THIẾU LABEL MỚI TẠO
import MissingLabelModal from "./MissingLabelModal";

const AnnotatorWorkspace = () => {
  const { taskId, id } = useParams();
  const activeTaskId = taskId || id;
  const navigate = useNavigate();

  const {
    files = [], currentFileId, handleSelectFile, availableLabels,
    selectedTool, setSelectedTool, selectedLabel, setSelectedLabel,
    annotations, setAnnotations, isLoading, isSaving, handleSave,
    toolbarConfig = [], status,
  } = useWorkspace(activeTaskId);

  const { submit } = useSubmitTask();

  const [rejectMode, setRejectMode] = useState("none"); 
  
  // 🔥 State quản lý bật/tắt Popup báo thiếu Label
  const [isMissingLabelModalOpen, setIsMissingLabelModalOpen] = useState(false);

  // 🔥 FIX 1: ÉP RESET LABEL VỀ NULL KHI MỚI VÀO HOẶC ĐỔI FILE
  // Việc này chặn lỗi "chưa chọn vẫn ra label đầu tiên"
  useEffect(() => {
    if (activeTaskId || currentFileId) {
      setSelectedLabel(null);
    }
  }, [activeTaskId, currentFileId, setSelectedLabel]);

  useEffect(() => {
    if (status === "Rejected" && rejectMode === "none") {
      setRejectMode("prompting");
    }
  }, [status, rejectMode]);

  const canEdit = status === "InProgress" || (status === "Rejected" && rejectMode === "resolved");

  const fileData = files.find((f) => f.id === currentFileId);
  const uniqueLabels = React.useMemo(() => Array.from(new Map(availableLabels.map((item) => [item.name, item])).values()), [availableLabels]);

  const getFileType = (url) => {
    if (!url) return "image";
    const urlL = url.toLowerCase();
    if (urlL.includes(".mp4") || urlL.includes(".webm") || urlL.includes(".mov")) return "video";
    if (urlL.includes(".mp3") || urlL.includes(".wav")) return "audio";
    if (urlL.includes(".txt")) return "text";
    return "image";
  };
  const actualType = getFileType(fileData?.url);

  const { isAILoading, handleRunAI } = useAIAssistant({
    fileData, actualType, uniqueLabels, annotations, setAnnotations, setSelectedLabel,
  });

  const handleSubmitClick = async () => {
    if (!canEdit || !window.confirm("NỘP BÀI?")) return;
    try {
      await submit(activeTaskId);
      alert("Nộp bài thành công.");
      navigate("/annotator");
    } catch (err) { alert(err?.response?.data || "Chưa thể nộp bài!"); }
  };

  const renderEditor = () => {
    if (isLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;
    const props = { selectedTool, selectedLabel, annotations, setAnnotations, fileData, availableLabels: uniqueLabels };
    if (actualType === "video") return <VideoCanvas {...props} videoUrl={fileData?.url} />;
    if (actualType === "text") return <TextEditor {...props} />;
    if (actualType === "audio") return <AudioEditor {...props} />;
    return <ImageCanvas {...props} imageUrl={fileData?.url} />;
  };

  if (!activeTaskId) return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Lỗi: Không tìm thấy ID Task.</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200 relative overflow-hidden">
      
      <RejectTaskModals mode={rejectMode} setMode={setRejectMode} taskId={activeTaskId} />

      {/* 🔥 GỌI COMPONENT MODAL Ở ĐÂY */}
      <MissingLabelModal 
        isOpen={isMissingLabelModalOpen} 
        onClose={() => setIsMissingLabelModalOpen(false)} 
        taskId={activeTaskId} 
      />

      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-700 bg-gray-800 z-10">
        <div className="flex-1 flex items-center gap-4">
          <span className="font-bold text-gray-400 text-sm uppercase">Làm việc</span>
          <button
            onClick={handleRunAI}
            disabled={!canEdit || isAILoading || !fileData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 text-white text-xs font-bold rounded-md disabled:opacity-50"
          >
            {isAILoading ? <span className="animate-pulse">⏳ Đang phân tích...</span> : <><Sparkles size={14} /> AI Suggest</>}
          </button>
        </div>

        <div className="flex justify-center flex-1">
          {actualType === "image" ? (
            <div className="flex bg-gray-900 p-1 rounded border border-gray-700">
              {toolbarConfig.map((tool) => (
                <button
                  key={tool} onClick={() => setSelectedTool(tool)} disabled={!canEdit}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${selectedTool === tool ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700"}`}
                >
                  {tool}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm font-medium text-blue-400 bg-blue-900/30 px-4 py-1.5 rounded border border-blue-500/30">
              Chế độ: {actualType === "video" ? "Phân loại Video" : actualType === "audio" ? "Phân loại Âm thanh" : actualType === "text" ? "Văn bản" : "Dữ liệu"}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 flex-1">
          {rejectMode === "deciding" ? (
            <div className="flex gap-2 animate-in slide-in-from-right duration-300">
              <button onClick={() => setRejectMode("disputing")} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded text-sm font-bold transition-all shadow-lg">
                <Scale size={16} /> Khiếu nại kết quả
              </button>
              <button onClick={() => setRejectMode("confirm_skip")} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded text-sm font-bold transition-all border border-slate-500">
                <XCircle size={16} /> Bỏ qua & Sửa lại
              </button>
            </div>
          ) : (
            <>
              {/* 🔥 NÚT BẬT MODAL */}
              <button 
                onClick={() => setIsMissingLabelModalOpen(true)} 
                disabled={!canEdit} 
                className="flex items-center gap-2 bg-red-900/30 hover:bg-red-800/50 text-red-400 px-3 py-2 rounded text-sm font-medium disabled:opacity-50 transition-colors"
              >
                <Tag size={16} /> Thiếu Label
              </button>
              
              <button onClick={handleSave} disabled={!canEdit || isSaving || isLoading} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />} Lưu
              </button>
              <div className="w-px h-6 bg-gray-600 mx-1"></div>
              <button onClick={handleSubmitClick} disabled={!canEdit} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
                <Send size={16} /> Nộp Bài
              </button>
            </>
          )}
          <button onClick={() => navigate("/annotator")} className="p-2 ml-1 text-gray-400 hover:text-white rounded">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SidebarLeft 
          files={files} 
          currentItemId={currentFileId} 
          onSelectItem={(id) => handleSelectFile(id, canEdit)} 
        />
        <main className="flex-1 overflow-hidden relative flex flex-col bg-[#0b1220]">{renderEditor()}</main>
        <SidebarRight availableLabels={uniqueLabels} selectedLabel={selectedLabel} setSelectedLabel={setSelectedLabel} actualType={actualType} annotations={annotations} setAnnotations={setAnnotations} />
      </div>
    </div>
  );
};
export default AnnotatorWorkspace;