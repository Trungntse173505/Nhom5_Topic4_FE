import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import ImageCanvas from './ImageCanvas';
import TextEditor from './TextEditor';
import AudioEditor from './AudioEditor';
import { useWorkspace } from '../../../../hooks/useWorkspace';
import { Save, LogOut, Loader2 } from 'lucide-react';

const AnnotatorWorkspace = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { 
    dataType, files, currentFileId, handleSelectFile,
    selectedTool, setSelectedTool, selectedLabel, setSelectedLabel, 
    annotations, setAnnotations, isLoading, toolbarConfig 
  } = useWorkspace(taskId);

  const renderEditor = () => {
    if (isLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    const props = { selectedTool, selectedLabel, annotations, setAnnotations, fileData: files.find(f => f.id === currentFileId) };
    
    switch(dataType) {
      case 'text': return <TextEditor {...props} />;
      case 'audio': return <AudioEditor {...props} />;
      default: return <ImageCanvas {...props} imageUrl={props.fileData?.url} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200">
      <header className="flex justify-between items-center px-6 py-3 border-b border-slate-800 bg-[#1e293b]">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">Workspace</h1>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded uppercase">{dataType} Mode</span>
        </div>

        {/* ĐÂY LÀ PHẦN HIỂN THỊ CÁC NÚT NHẤN (Bounding Box, Polygon...) */}
        <div className="flex bg-[#0f172a] p-1 rounded-lg border border-slate-800">
          {toolbarConfig.map(tool => (
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

        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold"><Save size={16}/> Save & Next</button>
          <button onClick={() => navigate('/annotator')} className="p-2 hover:bg-slate-800 rounded-lg"><LogOut size={20}/></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SidebarLeft files={files} currentItemId={currentFileId} onSelectItem={handleSelectFile} />
        <main className="flex-1 overflow-hidden relative flex flex-col">{renderEditor()}</main>
        <SidebarRight selectedLabel={selectedLabel} setSelectedLabel={setSelectedLabel} dataType={dataType} />
      </div>
    </div>
  );
};

export default AnnotatorWorkspace;