import React from 'react';
const SidebarLeft = ({ currentImageId, onSelectImage, taskStatus = 'Rejected' }) => {
  
  const images = [
    { id: 'IMG_0001', status: 'Done' },
    { id: 'IMG_0002', status: 'Done' },
    { id: 'IMG_0003', status: 'Rejected', note: 'Misaligned bounding box' },
    { id: 'IMG_0004', status: 'Done' }, 
    { id: 'IMG_0005', status: 'Done' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0f172a] flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white">My Tasks</h2>
        <p className="text-xs text-slate-400 mt-1">{images.length} tasks assigned</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {images.map((img) => {
          const isActive = currentImageId === img.id;
          
          return (
            <div 
              key={img.id}
              onClick={() => onSelectImage && onSelectImage(img.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isActive ? 'border-blue-500 bg-[#1e293b]' : 'border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {img.id}.jpg
                </span>

                {taskStatus !== 'New' && (
                  <>
                    {img.status === 'Done' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                        Done
                      </span>
                    )}
                    {img.status === 'Rejected' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                        Rejected
                      </span>
                    )}
                  </>
                )}
              </div>
              
              {taskStatus !== 'New' && img.status === 'Rejected' && img.note && (
                <p className="text-xs text-red-400 mt-2 flex items-start gap-1">
                  <span className="mt-0.5">✕</span> {img.note}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default SidebarLeft;