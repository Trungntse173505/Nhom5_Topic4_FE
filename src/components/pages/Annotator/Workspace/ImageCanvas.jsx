import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Group, Label, Tag, Text } from 'react-konva';
import useImage from 'use-image';
import { Trash2, RotateCcw } from 'lucide-react';

const ImageCanvas = ({ selectedTool, selectedLabel, availableLabels = [], annotations, setAnnotations, imageUrl }) => {
  const [image] = useImage(imageUrl, 'anonymous');
  const [isDrawing, setIsDrawing] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState(null);
  const stageRef = useRef(null);

  // LOGIC SO KHỚP MÀU: Tra cứu màu từ "cuốn sổ cái" availableLabels
  const getLabelColor = (labelName) => {
    const matched = availableLabels.find(l => l.name === labelName);
    return matched ? matched.color : '#ffffff'; 
  };

  // --- HÀM HỖ TRỢ ---
  const handleUndo = () => {
    if (annotations.length > 0) {
      setAnnotations(annotations.slice(0, -1));
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc muốn xóa TOÀN BỘ khung đã vẽ trên ảnh này?")) {
      setAnnotations([]);
    }
  };

  // --- LOGIC VẼ ---
  const handleMouseDown = (e) => {
    if (e.target !== e.target.getStage() && e.target.className !== 'Image') return;
    if (selectedTool !== 'Bounding Box' || !selectedLabel) return;
    
    const { x, y } = e.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setNewAnnotation({ x, y, width: 0, height: 0, label: selectedLabel, id: `box-${Date.now()}` });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !newAnnotation) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    setNewAnnotation(prev => ({ ...prev, width: x - prev.x, height: y - prev.y }));
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (newAnnotation && Math.abs(newAnnotation.width) > 5 && Math.abs(newAnnotation.height) > 5) {
      setAnnotations([...annotations, newAnnotation]);
    }
    setNewAnnotation(null);
  };

  return (
    <div className="w-full h-full bg-[#1e293b] flex items-center justify-center relative group">
      
      {/* THANH CÔNG CỤ NỘI BỘ (UNDO / DELETE) - TỰ HIỆN KHI HOVER */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handleUndo}
          title="Hoàn tác (Ctrl+Z)"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 bg-[#0f172a]/80 backdrop-blur-md rounded-lg border border-slate-700 hover:text-white hover:bg-slate-800 transition-all shadow-xl"
        >
          <RotateCcw size={14} /> Hoàn tác
        </button>
        <button 
          onClick={handleClearAll}
          title="Xóa sạch khung hình"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-400 bg-[#0f172a]/80 backdrop-blur-md rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all shadow-xl"
        >
          <Trash2 size={14} /> Xóa sạch
        </button>
      </div>

      {/* CANVAS VẼ */}
      <div className="shadow-2xl border border-slate-700 rounded-lg overflow-hidden bg-black">
        <Stage 
          width={800} height={600} 
          onMouseDown={handleMouseDown} 
          onMouseMove={handleMouseMove} 
          onMouseUp={handleMouseUp}
          ref={stageRef}
          style={{ cursor: selectedTool === 'Bounding Box' ? 'crosshair' : 'default' }}
        >
          <Layer>
            {image && <KonvaImage image={image} width={800} height={600} />}
            
            {/* RENDER CÁC KHUNG ĐÃ VẼ */}
            {annotations.map((ann) => {
              const color = getLabelColor(ann.label);
              // Tính tọa độ Top-Left để đặt Label chuẩn dù kéo ngược
              const topX = Math.min(ann.x, ann.x + ann.width);
              const topY = Math.min(ann.y, ann.y + ann.height);

              return (
                <Group key={ann.id}>
                  <Rect
                    x={ann.x} y={ann.y} width={ann.width} height={ann.height}
                    stroke={color} 
                    strokeWidth={3}
                    fill={`${color}33`} 
                    onClick={() => setAnnotations(annotations.filter(a => a.id !== ann.id))}
                    onMouseEnter={(e) => { e.target.getStage().container().style.cursor = 'pointer' }}
                    onMouseLeave={(e) => { e.target.getStage().container().style.cursor = 'crosshair' }}
                  />
                  <Label x={topX} y={topY - 24}>
                    <Tag fill={color} cornerRadius={4} />
                    <Text 
                      text={ann.label} 
                      fill="white" 
                      fontSize={12} 
                      fontStyle="bold"
                      padding={4} 
                    />
                  </Label>
                </Group>
              );
            })}

            {/* RENDER KHUNG ĐANG VẼ (NEW ANNOTATION) */}
            {newAnnotation && (() => {
              const color = getLabelColor(newAnnotation.label);
              const topX = Math.min(newAnnotation.x, newAnnotation.x + newAnnotation.width);
              const topY = Math.min(newAnnotation.y, newAnnotation.y + newAnnotation.height);
              
              return (
                <Group>
                  <Rect 
                    x={newAnnotation.x} y={newAnnotation.y} width={newAnnotation.width} height={newAnnotation.height} 
                    stroke={color} strokeWidth={2} dash={[5, 5]} 
                  />
                  <Label x={topX} y={topY - 24}>
                    <Tag fill={color} cornerRadius={4} />
                    <Text 
                      text={newAnnotation.label} 
                      fill="white" 
                      fontSize={12} 
                      fontStyle="bold"
                      padding={4} 
                    />
                  </Label>
                </Group>
              );
            })()}
          </Layer>
        </Stage>
      </div>

      {/* HƯỚNG DẪN NHANH */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-medium bg-[#0f172a]/50 px-3 py-1 rounded-full backdrop-blur-sm">
        Mẹo: Click vào khung hình để xóa nhanh khung đó.
      </p>
    </div>
  );
};

export default ImageCanvas;