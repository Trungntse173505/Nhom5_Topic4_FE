import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { Trash2, RotateCcw } from 'lucide-react';

const ImageCanvas = ({ selectedTool, selectedLabel, annotations, setAnnotations, imageUrl }) => {
  const [image] = useImage(imageUrl);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState(null);
  const stageRef = useRef(null);

  const getLabelColor = (label) => {
    const colors = { 
      'Vehicle': '#3b82f6', 
      'Pedestrian': '#10b981', 
      'Traffic Sign': '#f59e0b' 
    };
    return colors[label] || '#ffffff';
  };

  const handleMouseDown = (e) => {
    // Nếu click vào khung đã có, không bắt đầu vẽ mới
    if (e.target !== e.target.getStage() && e.target.className !== 'Image') return;
    if (selectedTool !== 'Bounding Box') return;
    
    const stage = e.target.getStage();
    const { x, y } = stage.getPointerPosition();
    
    setIsDrawing(true);
    setNewAnnotation({ x, y, width: 0, height: 0, label: selectedLabel, id: `box-${Date.now()}` });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !newAnnotation) return;
    const stage = e.target.getStage();
    const { x, y } = stage.getPointerPosition();
    setNewAnnotation(prev => ({ ...prev, width: x - prev.x, height: y - prev.y }));
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (newAnnotation && Math.abs(newAnnotation.width) > 10) {
      setAnnotations([...annotations, newAnnotation]);
    }
    setNewAnnotation(null);
  };

  return (
    <div className="w-full h-full bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center relative">
      
      {/* THANH THAO TÁC NHANH TRÊN ẢNH */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button 
          title="Hoàn tác (Xóa khung cuối)"
          onClick={() => setAnnotations(annotations.slice(0, -1))}
          className="p-2 bg-[#1e293b]/80 border border-slate-700 rounded-lg text-slate-300 hover:text-white backdrop-blur-md shadow-xl transition-all"
        >
          <RotateCcw size={18} />
        </button>
        <button 
          title="Xóa tất cả khung"
          onClick={() => window.confirm("Xóa sạch toàn bộ khung đã vẽ?") && setAnnotations([])}
          className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/40 backdrop-blur-md shadow-xl transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="absolute top-4 left-4 z-10 bg-black/60 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 backdrop-blur-md border border-white/10">
        Tool: <b className="text-white uppercase">{selectedTool}</b> | Click vào khung để xóa
      </div>

      <Stage 
        width={800} height={600}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
        ref={stageRef}
        style={{ cursor: selectedTool === 'Bounding Box' ? 'crosshair' : 'default' }}
      >
        <Layer>
          {image && <KonvaImage image={image} width={800} height={600} />}
          {annotations.map((ann) => (
            <Rect
              key={ann.id}
              x={ann.x} y={ann.y} width={ann.width} height={ann.height}
              stroke={getLabelColor(ann.label)}
              strokeWidth={3}
              fill={`${getLabelColor(ann.label)}22`}
              onClick={() => window.confirm("Xóa khung này?") && setAnnotations(annotations.filter(a => a.id !== ann.id))}
              onMouseEnter={(e) => { e.target.getStage().container().style.cursor = 'pointer'; }}
              onMouseLeave={(e) => { e.target.getStage().container().style.cursor = 'default'; }}
            />
          ))}
          {newAnnotation && (
            <Rect 
              x={newAnnotation.x} y={newAnnotation.y} width={newAnnotation.width} height={newAnnotation.height} 
              stroke={getLabelColor(newAnnotation.label)} strokeWidth={2} dash={[5, 5]} 
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageCanvas;