import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Image, Layer, Rect, Stage, Text } from 'react-konva';
import useImage from 'use-image';

const KonvaPreview = ({ task, classColor }) => {
  const containerRef = useRef(null);
  const [img] = useImage(task?.imageUrl || '');
  const [stageSize, setStageSize] = useState({ width: 560, height: 340 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resize = () => {
      const rect = el.getBoundingClientRect();
      setStageSize({
        width: Math.max(360, Math.floor(rect.width)),
        height: Math.max(260, Math.floor(rect.height)),
      });
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const imageBox = useMemo(() => {
    if (!img) return null;
    const naturalW = img.width || 512;
    const naturalH = img.height || 512;
    const scaleToFit = Math.min(stageSize.width / naturalW, stageSize.height / naturalH);
    const displayW = naturalW * scaleToFit;
    const displayH = naturalH * scaleToFit;
    const x = (stageSize.width - displayW) / 2;
    const y = (stageSize.height - displayH) / 2;
    return { x, y, displayW, displayH, scaleToFit };
  }, [img, stageSize.height, stageSize.width]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <ClipboardCheck size={18} className="text-blue-300" />
          Preview
        </p>
      </div>

      <div ref={containerRef} className="flex-1 rounded-2xl border border-slate-700 bg-[#0b1220] overflow-hidden">
        <Stage width={stageSize.width} height={stageSize.height}>
          <Layer>
            {img && imageBox && (
              <Image image={img} x={imageBox.x} y={imageBox.y} width={imageBox.displayW} height={imageBox.displayH} opacity={0.95} />
            )}

            {imageBox &&
              (task?.annotations || []).map((a, idx) => {
                const stroke = classColor(a.label);
                const x = imageBox.x + a.x * imageBox.scaleToFit;
                const y = imageBox.y + a.y * imageBox.scaleToFit;
                const w = a.width * imageBox.scaleToFit;
                const h = a.height * imageBox.scaleToFit;
                return (
                  <React.Fragment key={`${task.id}-${idx}`}>
                    <Rect x={x} y={y} width={w} height={h} stroke={stroke} strokeWidth={2} />
                    <Rect x={x} y={Math.max(0, y - 18)} width={Math.min(w, 140)} height={18} fill={stroke} opacity={0.9} />
                    <Text x={x + 6} y={Math.max(2, y - 16)} text={a.label} fontSize={11} fill="#0b1220" fontStyle="bold" />
                  </React.Fragment>
                );
              })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default KonvaPreview;
