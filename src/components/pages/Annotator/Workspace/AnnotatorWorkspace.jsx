import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import ImageCanvas from './ImageCanvas';
import TextEditor from './TextEditor';
import AudioEditor from './AudioEditor';
import { Save, LogOut, Loader2, AlertTriangle, Send } from 'lucide-react';

import { useWorkspace } from '../../../../hooks/Annotator/useWorkspace';
import { useSubmitTask } from '../../../../hooks/Annotator/useSubmitTask';
import { useFlagItem } from '../../../../hooks/Annotator/useFlagItem';

const AnnotatorWorkspace = () => {
  // Lấy ID từ URL
  const params = useParams();
  const activeTaskId = params.taskId || params.id;
  
  const navigate = useNavigate();

  // Gọi Master Hook
  const { 
    dataType, 
    files, 
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
    toolbarConfig 
  } = useWorkspace(activeTaskId);

  const { submit, isSubmitting } = useSubmitTask();
  const { flag, isFlagging } = useFlagItem();

  // Log debug để kiểm tra dữ liệu nhãn từ API Azure
  console.log("Files:", files, "Labels:", availableLabels);

  const handleFlagClick = async () => {
    if (!currentFileId) return;
    const isConfirm = window.confirm("Ảnh này bị mờ/hỏng và không thể gán nhãn. Bạn có chắc muốn báo lỗi?");
    if (isConfirm) {
      try {
        await flag(currentFileId);
        alert("Đã đánh dấu ảnh bị lỗi!");
      } catch (err) {
        alert("Lỗi: Không thể báo lỗi ảnh này.");
      }
    }
  };

  const handleSubmitClick = async () => {
    const isConfirm = window.confirm("Bạn có chắc chắn muốn NỘP BÀI?");
    if (isConfirm) {
      try {
        await submit(activeTaskId);
        alert("🎉 Chúc mừng! Bạn đã nộp bài thành công.");
        navigate('/annotator'); 
      } catch (err) {
        alert(err?.response?.data || "Chưa thể nộp bài. Vui lòng kiểm tra lại xem còn ảnh nào sót không!");
      }
    }
  };

  const renderEditor = () => {
    if (isLoading) return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

    const fileData = files.find(f => f.id === currentFileId);
    
    // FIX: Đã bổ sung availableLabels vào props truyền xuống Editor
    const props = { 
      selectedTool, 
      selectedLabel, 
      annotations, 
      setAnnotations, 
      fileData, 
      imageUrl: fileData?.url,
      availableLabels // <--- Biến quan trọng để ImageCanvas tra cứu màu sắc
    };
    
    switch(dataType) {
      case 'text': return <TextEditor {...props} />;
      case 'audio': return <AudioEditor {...props} />;
      default: return <ImageCanvas {...props} />;
    }
  };

  if (!activeTaskId) {
    return <div className="p-8 text-white">Lỗi: Không tìm thấy ID của Task trên đường dẫn URL.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200">
      <header className="flex justify-between items-center px-6 py-3 border-b border-slate-800 bg-[#1e293b]">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">Workspace</h1>
        </div>

        <div className="flex bg-[#0f172a] p-1 rounded-lg border border-slate-800">
          {toolbarConfig?.map(tool => (
            <button
              key={tool}
              onClick={() => setSelectedTool(tool)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedTool === tool ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {tool}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleFlagClick} 
            disabled={isFlagging || isLoading} 
            className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 px-3 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
          >
            <AlertTriangle size={16}/> Báo lỗi ảnh
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving || isLoading} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16}/>} Lưu Tọa Độ
          </button>
          <div className="w-px h-6 bg-slate-700 mx-2"></div>
          <button 
            onClick={handleSubmitClick} 
            disabled={isSubmitting || isLoading} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-500/20 transition-all disabled:opacity-50"
          >
            <Send size={16}/> Nộp Bài
          </button>
          <button onClick={() => navigate('/annotator')} className="p-2 hover:bg-slate-800 rounded-lg ml-2 text-slate-400 hover:text-white">
            <LogOut size={20}/>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SidebarLeft files={files} currentItemId={currentFileId} onSelectItem={handleSelectFile} />
        <main className="flex-1 overflow-hidden relative flex flex-col">{renderEditor()}</main>
        <SidebarRight availableLabels={availableLabels} selectedLabel={selectedLabel} setSelectedLabel={setSelectedLabel} />
      </div>
    </div>
  );
};

export default AnnotatorWorkspace;