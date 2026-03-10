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

  const { 
    files, currentFileId, handleSelectFile, availableLabels,
    selectedTool, setSelectedTool, selectedLabel, setSelectedLabel, 
    annotations, setAnnotations, isLoading, isSaving, handleSave, toolbarConfig 
  } = useWorkspace(activeTaskId);

  const { submit } = useSubmitTask();
  const { flag } = useFlagItem();

  const handleFlagClick = async () => {
    if (!currentFileId || !window.confirm("File này bị mờ/hỏng và không thể gán nhãn. Bạn có chắc muốn báo lỗi?")) return;
    try {
      await flag(currentFileId);
      alert("Đã đánh dấu file bị lỗi!");
    } catch {
      alert("Lỗi: Không thể báo lỗi file này.");
    }
  };

  // Rút gọn hàm nộp bài bằng Return sớm
  const handleSubmitClick = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn NỘP BÀI?")) return;
    try {
      await submit(activeTaskId);
      alert("🎉 Chúc mừng! Bạn đã nộp bài thành công.");
      navigate('/annotator'); 
    } catch (err) {
      alert(err?.response?.data || "Chưa thể nộp bài. Vui lòng kiểm tra lại xem còn file nào sót không!");
    }
  };

  // 1. NHẬN DIỆN LOẠI FILE (Dùng array .some() để code ngắn gọn hơn)
  const fileData = files.find(f => f.id === currentFileId);
  const urlLower = fileData?.url?.toLowerCase() || '';
  
  const actualType = ['mp4', 'webm', 'mov'].some(ext => urlLower.includes(ext)) ? 'video' 
                   : ['mp3', 'wav'].some(ext => urlLower.includes(ext)) ? 'audio' 
                   : 'image';

  // 2. HÀM RENDER EDITOR CHÍNH
  const renderEditor = () => {
    if (isLoading) return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
    const props = { selectedTool, selectedLabel, annotations, setAnnotations, fileData, availableLabels };
    if (actualType === 'video') return <VideoCanvas {...props} videoUrl={fileData?.url} />;
    if (actualType === 'text') return <TextEditor {...props} />;
    if (actualType === 'audio') return <AudioEditor {...props} />;
    return <ImageCanvas {...props} imageUrl={fileData?.url} />;
  };

  if (!activeTaskId) return <div className="p-8 text-white">Lỗi: Không tìm thấy ID Task.</div>;

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200">
      <header className="flex justify-between items-center px-6 py-3 border-b border-slate-800 bg-[#1e293b]">
        <div className="flex items-center gap-4"></div>

        {actualType === 'image' ? (
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
        ) : (
          <div className="text-sm font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-lg">
            Chế độ: Phân loại {actualType === 'video' ? 'Video' : 'Dữ liệu'}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={handleFlagClick} className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 px-3 py-2 rounded-lg text-sm font-bold transition-all">
            <AlertTriangle size={16}/> Báo lỗi
          </button>
          <button onClick={handleSave} disabled={isSaving || isLoading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all disabled:opacity-50">
            {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16}/>} Lưu Kết Quả
          </button>
          <div className="w-px h-6 bg-slate-700 mx-2"></div>
          <button onClick={handleSubmitClick} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-5 py-2 rounded-lg text-sm font-bold shadow-lg transition-all">
            <Send size={16}/> Nộp Bài
          </button>
          <button onClick={() => navigate('/annotator')} className="p-2 hover:bg-slate-800 rounded-lg ml-2 text-slate-400 hover:text-white">
            <LogOut size={20}/>
          </button>
        </div>
      </header>

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