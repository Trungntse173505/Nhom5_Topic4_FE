import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

const ReviewerCanvas = ({ currentItem, toggleAnnotationApproval }) => {
  const containerRef = useRef(null);
  const [img] = useImage(currentItem?.filePath || '', 'anonymous');
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      setStageSize({ width: rect.width, height: rect.height });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [currentItem]);

  const imageBox = useMemo(() => {
    if (!img) return null;
    const naturalW = img.width || 800;
    const naturalH = img.height || 600;
    const scaleToFit = Math.min(stageSize.width / naturalW, stageSize.height / naturalH);
    return {
      x: (stageSize.width - (naturalW * scaleToFit)) / 2,
      y: (stageSize.height - (naturalH * scaleToFit)) / 2,
      displayW: naturalW * scaleToFit,
      displayH: naturalH * scaleToFit,
      scaleToFit
    };
  }, [img, stageSize]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#1e293b] flex items-center justify-center cursor-crosshair">
      <Stage width={stageSize.width} height={stageSize.height}>
        <Layer>
          {img && imageBox && (
            <KonvaImage image={img} x={imageBox.x} y={imageBox.y} width={imageBox.displayW} height={imageBox.displayH} />
          )}

          {imageBox && (currentItem?.annotations || []).map((ann) => {
            let box = { x: 0, y: 0, width: 0, height: 0 };
            try { box = JSON.parse(ann.annotationData); } catch (e) {}

            const x = imageBox.x + box.x * imageBox.scaleToFit;
            const y = imageBox.y + box.y * imageBox.scaleToFit;
            const w = box.width * imageBox.scaleToFit;
            const h = box.height * imageBox.scaleToFit;

            // Xanh (Đúng), Đỏ (Sai), Vàng (Chưa check)
            const strokeColor = ann.isApproved === true ? '#22c55e' : (ann.isApproved === false ? '#ef4444' : '#eab308');

            return (
              <React.Fragment key={ann.idDetail}>
                <Rect
                  x={x} y={y} width={w} height={h}
                  stroke={strokeColor} strokeWidth={3}
                  fill={`${strokeColor}22`}
                  onMouseEnter={(e) => { e.target.getStage().container().style.cursor = 'pointer'; }}
                  onMouseLeave={(e) => { e.target.getStage().container().style.cursor = 'crosshair'; }}
                  onClick={() => toggleAnnotationApproval(ann.idDetail, ann.isApproved)}
                />
                <Rect x={x} y={Math.max(0, y - 20)} width={Math.min(w, 100)} height={20} fill={strokeColor} opacity={0.9} />
                <Text x={x + 4} y={Math.max(4, y - 16)} text={ann.content} fontSize={12} fill="#fff" fontStyle="bold" />
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default ReviewerCanvas;