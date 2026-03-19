// Đường dẫn: src/pages/Annotator/Workspace/ImageCanvas.jsx
import React, { useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Group,
  Label,
  Tag,
  Text,
} from "react-konva";
import useImage from "use-image";
import { Trash2, RotateCcw } from "lucide-react";

// 👉 Import Component Menu dùng chung
import BoxContextMenu from "../../../common/BoxContextMenu";
import { getLabelDisplay } from "../../../../utils/aiHelper";

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
  const stageRef = useRef(null);

  const [selectedBoxId, setSelectedBoxId] = useState(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  const getLabelColor = (labelName) => {
    const matched = availableLabels.find((l) => l.name === labelName);
    return matched ? matched.color : "#ea580c";
  };

  const handleUndo = () => {
    if (annotations.length > 0) setAnnotations(annotations.slice(0, -1));
  };

  const handleClearAll = () => {
    if (
      window.confirm("Bạn có chắc muốn xóa TOÀN BỘ khung đã vẽ trên ảnh này?")
    ) {
      setAnnotations([]);
      setSelectedBoxId(null);
    }
  };

  const handleMouseDown = (e) => {
    if (e.target === e.target.getStage() || e.target.className === "Image") {
      setSelectedBoxId(null);
    }

    if (e.target !== e.target.getStage() && e.target.className !== "Image")
      return;
    if (selectedTool !== "Bounding Box" || !selectedLabel) return;

    const { x, y } = e.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setNewAnnotation({
      x,
      y,
      width: 0,
      height: 0,
      label: selectedLabel,
      id: `box-${Date.now()}`,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !newAnnotation) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    setNewAnnotation((prev) => ({
      ...prev,
      width: x - prev.x,
      height: y - prev.y,
    }));
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (
      newAnnotation &&
      Math.abs(newAnnotation.width) > 5 &&
      Math.abs(newAnnotation.height) > 5
    ) {
      setAnnotations([...annotations, newAnnotation]);
    }
    setNewAnnotation(null);
  };

  const handleBoxClick = (e, annId) => {
    e.cancelBubble = true;
    setSelectedBoxId(annId);
  };

  const handleChangeLabel = (annId, newLabelName) => {
    const matchedLabel = availableLabels.find((l) => l.name === newLabelName);
    setAnnotations(
      annotations.map((ann) =>
        ann.id === annId
          ? { ...ann, label: newLabelName, labelId: matchedLabel?.id }
          : ann,
      ),
    );
  };

  const handleDeleteBox = (annId) => {
    setAnnotations(annotations.filter((a) => a.id !== annId));
    setSelectedBoxId(null);
  };

  const selectedAnn = annotations.find((a) => a.id === selectedBoxId);

  return (
    <div className="w-full h-full bg-[#1e293b] flex items-center justify-center relative group overflow-hidden">
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

      <div className="shadow-2xl border border-slate-700 rounded-lg overflow-hidden bg-black relative">
        <Stage
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
          style={{
            cursor: selectedTool === "Bounding Box" ? "crosshair" : "default",
          }}
        >
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />
            )}

            {/* PHẦN 1: RENDER CÁC KHUNG ĐÃ VẼ */}
            {annotations.map((ann) => {
              const color = getLabelColor(ann.label);
              const isSelected = ann.id === selectedBoxId;
              const topX = Math.min(ann.x, ann.x + ann.width);
              const topY = Math.min(ann.y, ann.y + ann.height);

              return (
                <Group key={ann.id}>
                  <Rect
                    x={ann.x}
                    y={ann.y}
                    width={ann.width}
                    height={ann.height}
                    stroke={isSelected ? "#ffffff" : color}
                    strokeWidth={isSelected ? 4 : 3}
                    dash={isSelected ? [8, 4] : null}
                    fill={`${color}33`}
                    onClick={(e) => handleBoxClick(e, ann.id)}
                    onMouseEnter={(e) => {
                      e.target.getStage().container().style.cursor = "pointer";
                    }}
                    onMouseLeave={(e) => {
                      e.target.getStage().container().style.cursor =
                        "crosshair";
                    }}
                  />
                  <Label x={topX} y={topY - 24}>
                    <Tag fill={color} cornerRadius={4} />
                    <Text
                      // 👉 FIX 1: Gắn mặt nạ Tiếng Việt cho các nhãn đã vẽ
                      text={getLabelDisplay(ann.label)}
                      fill="white"
                      fontSize={12}
                      fontStyle="bold"
                      padding={4}
                    />
                  </Label>
                </Group>
              );
            })}

            {/* PHẦN 2: RENDER KHUNG ĐANG KÉO CHUỘT VẼ */}
            {newAnnotation &&
              (() => {
                const color = getLabelColor(newAnnotation.label);
                const topX = Math.min(
                  newAnnotation.x,
                  newAnnotation.x + newAnnotation.width,
                );
                const topY = Math.min(
                  newAnnotation.y,
                  newAnnotation.y + newAnnotation.height,
                );

                return (
                  <Group>
                    <Rect
                      x={newAnnotation.x}
                      y={newAnnotation.y}
                      width={newAnnotation.width}
                      height={newAnnotation.height}
                      stroke={color}
                      strokeWidth={2}
                      dash={[5, 5]}
                    />
                    <Label x={topX} y={topY - 24}>
                      <Tag fill={color} cornerRadius={4} />
                      <Text
                        // 👉 FIX 2: Gắn mặt nạ Tiếng Việt cho nhãn đang vẽ
                        text={getLabelDisplay(newAnnotation.label)}
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

        {/* 👉 GỌI COMPONENT DÙNG CHUNG RA ĐÂY LÀ XONG */}
        <BoxContextMenu
          selectedAnn={selectedAnn}
          availableLabels={availableLabels}
          CANVAS_WIDTH={CANVAS_WIDTH}
          CANVAS_HEIGHT={CANVAS_HEIGHT}
          onCancel={() => setSelectedBoxId(null)}
          onChangeLabel={handleChangeLabel}
          onDelete={handleDeleteBox}
        />
      </div>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-slate-400 font-medium bg-[#0f172a]/80 px-4 py-1.5 rounded-full backdrop-blur-sm border border-slate-700">
        Mẹo: Click vào khung hình để <b>Sửa nhãn</b> hoặc <b>Xóa</b>. Click ra
        ngoài để bỏ chọn.
      </p>
    </div>
  );
};

export default ImageCanvas;
