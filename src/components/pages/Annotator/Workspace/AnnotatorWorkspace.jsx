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
    status,
    toolbarConfig = [] 
  } = useWorkspace(activeTaskId);

  const { submit } = useSubmitTask();
  const { flag } = useFlagItem();

  // SỬA: Cho phép sửa (canEdit) khi trạng thái là Đang làm HOẶC Bị từ chối
  const canEdit = ['InProgress', 'Rejected'].includes(status);

  const handleFlagClick = async () => {
    if (!canEdit || !currentFileId || !window.confirm("File này bị mờ/hỏng. Bạn có chắc muốn báo lỗi?")) return;
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
      // Vì status là Rejected (làm lại) hoặc InProgress (làm mới), ta gọi submit bình thường
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
    if (urlLower.includes('.mp4') || urlLower.includes('.webm') || urlLower.includes('.mov')) return 'video';
    if (urlLower.includes('.mp3') || urlLower.includes('.wav')) return 'audio';
    if (urlLower.includes('.txt')) return 'text';
    return 'image';
  };

  const actualType = getFileType(fileData?.url);

  const renderEditor = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        </div>
      );
    }
    const props = { selectedTool, selectedLabel, annotations, setAnnotations, fileData, availableLabels, readOnly: !canEdit };
    if (actualType === 'video') return <VideoCanvas {...props} videoUrl={fileData?.url} />;
    if (actualType === 'text') return <TextEditor {...props} />;
    if (actualType === 'audio') return <AudioEditor {...props} />;
    return <ImageCanvas {...props} imageUrl={fileData?.url} />;
  };

  if (!activeTaskId) return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Lỗi ID Task.</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200">
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-700 bg-gray-800">
        <div className="flex-1 flex items-center gap-2">
           <span className="font-bold text-gray-400 text-sm uppercase">Không gian làm việc</span>
           <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${canEdit ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
             {status || "N/A"}
           </span>
        </div>

        <div className="flex justify-center flex-1">
          {actualType === 'image' ? (
            <div className="flex bg-gray-900 p-1 rounded border border-gray-700">
              {toolbarConfig.map(tool => (
                <button
                  key={tool}
                  onClick={() => setSelectedTool(tool)}
                  disabled={!canEdit}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    selectedTool === tool ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                  } disabled:opacity-30`}
                >
                  {tool}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm font-medium text-blue-400 bg-blue-900/30 border border-blue-500/30 px-4 py-1.5 rounded">
              Chế độ: {canEdit ? `Phân loại ${actualType}` : `Xem lại dữ liệu`}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 flex-1">
          <button onClick={handleFlagClick} disabled={!canEdit} className="flex items-center gap-2 bg-red-900/30 text-red-400 disabled:opacity-30 border border-red-500/30 px-3 py-2 rounded text-sm font-medium transition-colors"><AlertTriangle size={16}/> Báo lỗi</button>
          
          <button 
            onClick={handleSave} 
            disabled={isSaving || isLoading || !canEdit} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:bg-gray-700 disabled:text-gray-500"
          >
            {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16}/>} Lưu
          </button>
          
          <div className="w-px h-6 bg-gray-600 mx-1"></div> 
          
          <button onClick={handleSubmitClick} disabled={!canEdit} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-30"><Send size={16}/> Nộp Bài</button>
          
          <button onClick={() => navigate('/annotator')} className="p-2 ml-1 text-gray-400 hover:text-white rounded transition-colors"><LogOut size={18}/></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SidebarLeft files={files} currentItemId={currentFileId} onSelectItem={handleSelectFile} />
        <main className="flex-1 overflow-hidden relative flex flex-col bg-[#0b1220]">{renderEditor()}</main>
        <SidebarRight availableLabels={availableLabels} selectedLabel={selectedLabel} setSelectedLabel={setSelectedLabel} actualType={actualType} annotations={annotations} setAnnotations={setAnnotations} />
      </div>
    </div>
  );
};

export default AnnotatorWorkspace;