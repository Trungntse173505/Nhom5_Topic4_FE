import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import ImageCanvas from './ImageCanvas';
import VideoCanvas from './VideoCanvas'; 
import TextEditor from './TextEditor';
import AudioEditor from './AudioEditor';
import { Save, LogOut, Loader2, AlertTriangle, Send } from 'lucide-react';

import { useWorkspace } from '../../../../hooks/Annotator/useWorkspace';
import { useSubmitTask } from '../../../../hooks/Annotator/useSubmitTask';
import { useFlagItem } from '../../../../hooks/Annotator/useFlagItem';

const AnnotatorWorkspace = () => {
  const { taskId, id } = useParams();
  const activeTaskId = taskId || id;
  const navigate = useNavigate();

  // Bổ sung default value = [] để chống lỗi sập trang khi đang load data
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
    toolbarConfig = [] 
  } = useWorkspace(activeTaskId);

  const { submit } = useSubmitTask();
  const { flag } = useFlagItem();

  const handleFlagClick = async () => {
    if (!currentFileId || !window.confirm("File này bị mờ/hỏng. Bạn có chắc muốn báo lỗi?")) return;
    try {
      await flag(currentFileId);
      alert("Đã đánh dấu file bị lỗi!");
    } catch {
      alert("Lỗi: Không thể báo lỗi file này.");
    }
  };

  const handleSubmitClick = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn NỘP BÀI?")) return;
    try {
      await submit(activeTaskId);
      alert("🎉 Chúc mừng! Bạn đã nộp bài thành công.");
      navigate('/annotator'); 
    } catch (err) {
      alert(err?.response?.data || "Chưa thể nộp bài. Hãy kiểm tra lại!");
    }
  };

  
  const fileData = files.find(f => f.id === currentFileId);

  const getFileType = (url) => {
    if (!url) return 'image'; 
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('.mp4') || urlLower.includes('.webm') || urlLower.includes('.mov')) {
      return 'video';
    }
    if (urlLower.includes('.mp3') || urlLower.includes('.wav')) {
      return 'audio';
    }
    if (urlLower.includes('.txt')) {
      return 'text';
    }
    return 'image';
  };

  const actualType = getFileType(fileData?.url);

  // --- HÀM HIỂN THỊ VÙNG CANVAS CHÍNH ---
  
  const renderEditor = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        </div>
      );
    }

    const props = { selectedTool, selectedLabel, annotations, setAnnotations, fileData, availableLabels };
    
    if (actualType === 'video') return <VideoCanvas {...props} videoUrl={fileData?.url} />;
    if (actualType === 'text') return <TextEditor {...props} />;
    if (actualType === 'audio') return <AudioEditor {...props} />;
    return <ImageCanvas {...props} imageUrl={fileData?.url} />;
  };

  // --- RENDER GIAO DIỆN TỔNG ---

  if (!activeTaskId) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Lỗi: Không tìm thấy ID Task.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200">
      
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-700 bg-gray-800">
        
        <div className="flex-1">
           <span className="font-bold text-gray-400 text-sm uppercase">Không gian làm việc</span>
        </div>

        {/* Thanh công cụ (Tools) */}
        <div className="flex justify-center flex-1">
          {actualType === 'image' ? (
            <div className="flex bg-gray-900 p-1 rounded border border-gray-700">
              {toolbarConfig.map(tool => (
                <button
                  key={tool}
                  onClick={() => setSelectedTool(tool)}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    selectedTool === tool 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm font-medium text-blue-400 bg-blue-900/30 border border-blue-500/30 px-4 py-1.5 rounded">
              Chế độ: Phân loại {actualType === 'video' ? 'Video' : 'Dữ liệu'}
            </div>
          )}
        </div>

        {/* Cụm nút bấm bên phải */}
        <div className="flex items-center justify-end gap-2 flex-1">
          <button 
            onClick={handleFlagClick} 
            className="flex items-center gap-2 bg-red-900/30 text-red-400 hover:bg-red-800/50 border border-red-500/30 px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            <AlertTriangle size={16}/> Báo lỗi
          </button>
          
          <button 
            onClick={handleSave} 
            disabled={isSaving || isLoading} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16}/>} Lưu
          </button>
          
          <div className="w-px h-6 bg-gray-600 mx-1"></div> 
          
          <button 
            onClick={handleSubmitClick} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            <Send size={16}/> Nộp Bài
          </button>
          
          <button 
            onClick={() => navigate('/annotator')} 
            className="p-2 ml-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <LogOut size={18}/>
          </button>
        </div>
      </header>

      {/* 2. KHU VỰC THAO TÁC (CHIA 3 CỘT) */}
      <div className="flex flex-1 overflow-hidden">
        
        <SidebarLeft files={files} currentItemId={currentFileId} onSelectItem={handleSelectFile} />
        
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