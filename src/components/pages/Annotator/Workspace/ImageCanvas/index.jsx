import React, { useRef, useState, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { Trash2, RotateCcw } from "lucide-react";

import BoxContextMenu from "../../../../common/BoxContextMenu";
import AnnotationBox from "./AnnotationBox";
import DrawingBox from "./DrawingBox";

const ImageCanvas = ({
  selectedTool,
  selectedLabel,
  availableLabels = [],
  annotations,
  setAnnotations,
  imageUrl,
}) => {
  const [image] = useImage(imageUrl, "anonymous");
  const [isDrawing, setIsDrawing] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState(null);
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  
  const stageRef = useRef(null);
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  const getLabelColor = useCallback((labelName) => {
    const matched = availableLabels.find((l) => l.name === labelName);
    return matched ? matched.color : "#ea580c";
  }, [availableLabels]);

  const handleUndo = () => {
    if (annotations.length > 0) setAnnotations(annotations.slice(0, -1));
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc muốn xóa TOÀN BỘ khung đã vẽ trên ảnh này?")) {
      setAnnotations([]);
      setSelectedBoxId(null);
    }
  };

  const handleBoxSelect = useCallback((e, annId) => {
    e.cancelBubble = true;
    setSelectedBoxId(annId);
  }, []);

  const handleMouseDown = (e) => {
    if (e.target === e.target.getStage() || e.target.className === "Image") {
      setSelectedBoxId(null);
    }

    if (e.target !== e.target.getStage() && e.target.className !== "Image") return;
    if (selectedTool !== "Bounding Box" || !selectedLabel) return;

    const { x, y } = e.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setNewAnnotation({
      x, y, width: 0, height: 0, label: selectedLabel, id: `box-${Date.now()}`,
      isApproved: "New" // Khung vẽ mới luôn là New
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !newAnnotation) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    setNewAnnotation((prev) => ({
      ...prev, width: x - prev.x, height: y - prev.y,
    }));
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (newAnnotation && Math.abs(newAnnotation.width) > 5 && Math.abs(newAnnotation.height) > 5) {
      setAnnotations([...annotations, newAnnotation]);
    }
    setNewAnnotation(null);
  };

  const handleChangeLabel = (annId, newLabelName) => {
    const matchedLabel = availableLabels.find((l) => l.name === newLabelName);
    setAnnotations(
      annotations.map((ann) =>
        // 🔥 ĐÃ FIX: Chỉnh sửa nhãn là tước quyền Reviewer, reset về "New"
        ann.id === annId ? { ...ann, label: newLabelName, labelId: matchedLabel?.id, isApproved: "New" } : ann
      )
    );
  };

  const handleDeleteBox = (annId) => {
    setAnnotations(annotations.filter((a) => a.id !== annId));
    setSelectedBoxId(null);
  };

  const selectedAnn = annotations.find((a) => a.id === selectedBoxId);

  return (
    <div className="w-full h-full bg-[#1e293b] flex items-center justify-center relative group overflow-hidden">
      {/* TOOLBAR */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleUndo} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 bg-[#0f172a]/80 backdrop-blur-md rounded-lg border border-slate-700 hover:text-white hover:bg-slate-800 transition-all shadow-xl">
          <RotateCcw size={14} /> Hoàn tác
        </button>
        <button onClick={handleClearAll} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-400 bg-[#0f172a]/80 backdrop-blur-md rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all shadow-xl">
          <Trash2 size={14} /> Xóa sạch
        </button>
      </div>

      <div className="shadow-2xl border border-slate-700 rounded-lg overflow-hidden bg-black relative">
        <Stage
          width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
          ref={stageRef}
          style={{ cursor: selectedTool === "Bounding Box" ? "crosshair" : "default" }}
        >
          <Layer>
            {image && <KonvaImage image={image} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />}

            {/* Render các khung tĩnh đã vẽ */}
            {annotations.map((ann) => (
              <AnnotationBox
                key={ann.id}
                annotation={ann}
                isSelected={ann.id === selectedBoxId}
                color={getLabelColor(ann.label)}
                onSelect={handleBoxSelect}
              />
            ))}

            {/* Render khung đang kéo (Dynamic) */}
            <DrawingBox 
              newAnnotation={newAnnotation} 
              color={newAnnotation ? getLabelColor(newAnnotation.label) : ""} 
            />
          </Layer>
        </Stage>

        <BoxContextMenu
          selectedAnn={selectedAnn}
          availableLabels={availableLabels}
          CANVAS_WIDTH={CANVAS_WIDTH} CANVAS_HEIGHT={CANVAS_HEIGHT}
          onCancel={() => setSelectedBoxId(null)}
          onChangeLabel={handleChangeLabel}
          onDelete={handleDeleteBox}
        />
      </div>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-slate-400 font-medium bg-[#0f172a]/80 px-4 py-1.5 rounded-full backdrop-blur-sm border border-slate-700">
        Mẹo: Click vào khung hình để <b>Sửa nhãn</b> hoặc <b>Xóa</b>. Click ra ngoài để bỏ chọn.
      </p>
    </div>
  );
};

export default ImageCanvas;