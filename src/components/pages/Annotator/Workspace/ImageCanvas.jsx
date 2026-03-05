import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { Trash2, RotateCcw } from 'lucide-react';

const ImageCanvas = ({ selectedTool, selectedLabel, availableLabels = [], annotations, setAnnotations, imageUrl }) => {
  const [image] = useImage(imageUrl);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState(null);
  const stageRef = useRef(null);

  // LOGIC SO KHỚP MÀU: Tra cứu màu từ "cuốn sổ cái" availableLabels
  const getLabelColor = (labelName) => {
    // Tìm nhãn có name trùng với label của khung hình
    const matched = availableLabels.find(l => l.name === labelName);
    // Trả về đúng mã hex color từ Backend, nếu không thấy thì mặc định trắng
    return matched ? matched.color : '#ffffff'; 
  };

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
    if (newAnnotation && Math.abs(newAnnotation.width) > 5) {
      setAnnotations([...annotations, newAnnotation]);
    }
    setNewAnnotation(null);
  };

  return (
    <div className="w-full h-full bg-[#1e293b] flex items-center justify-center relative">
      <Stage 
        width={800} height={600} 
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
        ref={stageRef}
        style={{ cursor: selectedTool === 'Bounding Box' ? 'crosshair' : 'default' }}
      >
        <Layer>
          {image && <KonvaImage image={image} width={800} height={600} />}
          
          {/* VẼ CÁC KHUNG CŨ & MỚI VỚI MÀU TRA CỨU ĐƯỢC */}
          {annotations.map((ann) => {
            const color = getLabelColor(ann.label); // Tra cứu màu ở đây
            return (
              <Rect
                key={ann.id}
                x={ann.x} y={ann.y} width={ann.width} height={ann.height}
                stroke={color} // Màu viền chuẩn
                strokeWidth={3}
                fill={`${color}33`} // Màu nền trong suốt cùng tông màu
                onClick={() => setAnnotations(annotations.filter(a => a.id !== ann.id))}
              />
            );
          })}

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