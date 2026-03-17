// Đường dẫn: src/pages/Annotator/Workspace/VideoCanvas.jsx
import React, { useRef, useState } from "react";
import { Stage, Layer, Rect, Group, Label, Tag, Text } from "react-konva";
import { Trash2, RotateCcw } from "lucide-react";
// 👉 Import Component dùng chung
import BoxContextMenu from "../../../common/BoxContextMenu";

const VideoCanvas = ({
  selectedTool,
  selectedLabel,
  availableLabels = [],
  annotations,
  setAnnotations,
  videoUrl,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState(null);
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const stageRef = useRef(null);
  const videoRef = useRef(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 450;

  const getLabelColor = (labelName) => {
    const matched = availableLabels.find((l) => l.name === labelName);
    return matched ? matched.color : "#ea580c";
  };

  const handleUndo = () => {
    if (annotations.length > 0) setAnnotations(annotations.slice(0, -1));
  };
  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc muốn xóa TOÀN BỘ khung trên video này?")) {
      setAnnotations([]);
      setSelectedBoxId(null);
    }
  };

  const handleMouseDown = (e) => {
    if (e.target === e.target.getStage()) setSelectedBoxId(null);
    if (e.target !== e.target.getStage()) return;
    if (selectedTool !== "Bounding Box" || !selectedLabel) return;

    if (videoRef.current) videoRef.current.pause();
    const { x, y } = e.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setNewAnnotation({
      x,
      y,
      width: 0,
      height: 0,
      label: selectedLabel,
      id: `vid-box-${Date.now()}`,
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
      <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleUndo}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 bg-[#0f172a]/80 backdrop-blur-md rounded-lg border border-slate-700 hover:text-white hover:bg-slate-800 transition-all shadow-xl"
        >
          <RotateCcw size={14} /> Hoàn tác
        </button>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-400 bg-[#0f172a]/80 backdrop-blur-md rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all shadow-xl"
        >
          <Trash2 size={14} /> Xóa sạch
        </button>
      </div>

      <div
        className="relative shadow-2xl border border-slate-700 rounded-lg bg-black"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="absolute top-0 left-0 w-full h-full object-contain z-0"
        >
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>

        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-auto">
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
                        e.target.getStage().container().style.cursor =
                          "pointer";
                      }}
                      onMouseLeave={(e) => {
                        e.target.getStage().container().style.cursor =
                          "crosshair";
                      }}
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

        {/* 👉 GỌI COMPONENT DÙNG CHUNG CỰC KỲ NGẮN GỌN */}
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
        Mẹo: Dùng thanh tiến trình video để tìm cảnh, sau đó vẽ khung lên vật
        thể cần gán nhãn.
      </p>
    </div>
  );
};

export default VideoCanvas;
