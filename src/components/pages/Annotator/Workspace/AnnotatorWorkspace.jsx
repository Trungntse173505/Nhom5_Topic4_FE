import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import ImageCanvas from './ImageCanvas';
import { LogOut, SkipForward, Save } from 'lucide-react';

const AnnotatorWorkspace = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState('Select');
  const [selectedLabel, setSelectedLabel] = useState('Vehicle');
  const [annotations, setAnnotations] = useState([]); 

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200">
      {/* Top Navbar */}
      <header className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-[#1e293b]">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Annotator Workspace</h1>
          <span className="text-sm text-slate-400">trungntse... @fpt.edu.vn</span>
        </div>
        
        {/* Toolbars */}
        <div className="flex items-center gap-2 bg-[#0f172a] p-1 rounded-lg">
          {['Select', 'Bounding Box', 'Polygon', 'Brush'].map(tool => (
            <button
              key={tool}
              onClick={() => setSelectedTool(tool)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedTool === tool ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tool}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium">
            <SkipForward size={16} /> Skip
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium">
            <Save size={16} /> Save & Next
          </button>
          <button onClick={() => navigate('/annotator')} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarLeft currentTaskId={taskId} />
        
        <main className="flex-1 relative flex flex-col p-4">
           {/* Khu vực vẽ Canvas */}
           <ImageCanvas 
              selectedTool={selectedTool}
              selectedLabel={selectedLabel}
              annotations={annotations}
              setAnnotations={setAnnotations}
              imageUrl={`/sample-images/${taskId}.jpg`} 
           />
           
           {/* Bottom Info Bar */}
           <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-slate-400">
              <span>Tool: <strong className="text-white">{selectedTool}</strong></span>
              <span>Annotations: <strong className="text-white">{annotations.length}</strong></span>
              <span>Label: <strong className="text-white">{selectedLabel}</strong></span>
           </div>
        </main>

        <SidebarRight 
          selectedLabel={selectedLabel} 
          setSelectedLabel={setSelectedLabel} 
        />
      </div>
    </div>
  );
};

export default AnnotatorWorkspace;