import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

const ImageCanvas = ({ selectedTool, selectedLabel, annotations, setAnnotations, imageUrl }) => {
  const [image] = useImage(imageUrl);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState(null);
  const stageRef = useRef(null);

  const getLabelColor = (label) => {
    const colors = { 'Vehicle': '#3b82f6', 'Pedestrian': '#10b981', 'Traffic Sign': '#f59e0b' };
    return colors[label] || '#ffffff';
  };

  const handleMouseDown = (e) => {
    if (selectedTool !== 'Bounding Box') return;
    const { x, y } = e.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setNewAnnotation({ x, y, width: 0, height: 0, label: selectedLabel, id: Date.now().toString() });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || selectedTool !== 'Bounding Box') return;
    const { x, y } = e.target.getStage().getPointerPosition();
    
    setNewAnnotation(prev => ({
      ...prev,
      width: x - prev.x,
      height: y - prev.y,
    }));
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (Math.abs(newAnnotation.width) > 5 && Math.abs(newAnnotation.height) > 5) {
      setAnnotations([...annotations, newAnnotation]);
    }
    setNewAnnotation(null);
  };

  return (
    <div className="w-full h-full bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center">
      <Stage 
        width={800} 
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
        style={{ cursor: selectedTool === 'Bounding Box' ? 'crosshair' : 'default' }}
      >
        <Layer>
          {/* Render Ảnh Background */}
          {image && <KonvaImage image={image} width={800} height={600} />}
          
          {/* Render các Box đã vẽ */}
          {annotations.map((ann) => (
            <Rect
              key={ann.id}
              x={ann.x}
              y={ann.y}
              width={ann.width}
              height={ann.height}
              stroke={getLabelColor(ann.label)}
              strokeWidth={2}
              fill={`${getLabelColor(ann.label)}33`}
            />
          ))}

          {/* Render Box đang vẽ dở */}
          {newAnnotation && (
            <Rect
              x={newAnnotation.x}
              y={newAnnotation.y}
              width={newAnnotation.width}
              height={newAnnotation.height}
              stroke={getLabelColor(newAnnotation.label)}
              strokeWidth={2}
              dash={[5, 5]} 
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageCanvas;