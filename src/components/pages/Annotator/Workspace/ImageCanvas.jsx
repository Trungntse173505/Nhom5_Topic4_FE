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
import { Trash2, RotateCcw, Edit3, X } from "lucide-react";

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

  // 👉 TRẠNG THÁI MỚI: THEO DÕI KHUNG ĐANG ĐƯỢC CHỌN
  const [selectedBoxId, setSelectedBoxId] = useState(null);

  // LOGIC SO KHỚP MÀU
  const getLabelColor = (labelName) => {
    const matched = availableLabels.find((l) => l.name === labelName);
    return matched ? matched.color : "#ea580c"; // Màu cam mặc định nếu AI đoán ra vật lạ
  };

  // --- HÀM HỖ TRỢ ---
  const handleUndo = () => {
    if (annotations.length > 0) {
      setAnnotations(annotations.slice(0, -1));
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm("Bạn có chắc muốn xóa TOÀN BỘ khung đã vẽ trên ảnh này?")
    ) {
      setAnnotations([]);
      setSelectedBoxId(null);
    }
  };

  // --- LOGIC VẼ VÀ CLICK ---
  const handleMouseDown = (e) => {
    // Nếu click ra khoảng không (Stage) hoặc nền Ảnh -> Bỏ chọn box hiện tại
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
      // Tùy chọn: Chọn luôn cái box vừa vẽ xong
      // setSelectedBoxId(newAnnotation.id);
    }
    setNewAnnotation(null);
  };

  // --- LOGIC CHỈNH SỬA BOX ---
  const handleBoxClick = (e, annId) => {
    e.cancelBubble = true; // Ngăn chặn sự kiện click rơi xuống nền Stage
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

  // Tìm dữ liệu của cái Box đang được chọn để làm Tọa độ vẽ Menu
  const selectedAnn = annotations.find((a) => a.id === selectedBoxId);

  return (
    <div className="w-full h-full bg-[#1e293b] flex items-center justify-center relative group overflow-hidden">
      {/* THANH CÔNG CỤ NỘI BỘ (UNDO / DELETE) */}
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
      <div className="shadow-2xl border border-slate-700 rounded-lg overflow-hidden bg-black relative">
        <Stage
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
          style={{
            cursor: selectedTool === "Bounding Box" ? "crosshair" : "default",
          }}
        >
          <Layer>
            {image && <KonvaImage image={image} width={800} height={600} />}

            {/* RENDER CÁC KHUNG ĐÃ VẼ */}
            {annotations.map((ann) => {
              const color = getLabelColor(ann.label);
              const isSelected = ann.id === selectedBoxId;

              // Tính tọa độ Top-Left để đặt Label chuẩn dù kéo ngược
              const topX = Math.min(ann.x, ann.x + ann.width);
              const topY = Math.min(ann.y, ann.y + ann.height);

              return (
                <Group key={ann.id}>
                  <Rect
                    x={ann.x}
                    y={ann.y}
                    width={ann.width}
                    height={ann.height}
                    // Nếu đang chọn thì viền sáng bừng và đứt nét
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

        {/* 👉 MENU POPUP CHỈNH SỬA BOX (NỔI TRÊN CANVAS) */}
        {selectedAnn && (
          <div
            className="absolute z-20 bg-[#0f172a] border border-slate-600 rounded-lg shadow-2xl p-2 flex flex-col gap-2 min-w-[180px] animate-in fade-in zoom-in duration-200"
            style={{
              // Neo popup vào cạnh phải của khung. Dùng Math.min/max để không bị rớt ra ngoài màn hình
              left: Math.min(
                Math.max(
                  Math.max(selectedAnn.x, selectedAnn.x + selectedAnn.width) +
                    10,
                  10,
                ),
                800 - 190,
              ),
              top: Math.min(
                Math.max(
                  Math.min(selectedAnn.y, selectedAnn.y + selectedAnn.height),
                  10,
                ),
                600 - 120,
              ),
            }}
          >
            <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-1">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Edit3 size={12} /> Sửa Khung
              </span>
              <button
                onClick={() => setSelectedBoxId(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* DROPDOWN CHỌN NHÃN */}
            <select
              value={selectedAnn.label}
              onChange={(e) =>
                handleChangeLabel(selectedAnn.id, e.target.value)
              }
              className="bg-slate-800 text-white text-sm rounded px-2 py-2 outline-none border border-slate-600 focus:border-blue-500 cursor-pointer"
            >
              {availableLabels.map((label) => (
                <option key={label.id} value={label.name}>
                  {label.name}
                </option>
              ))}
            </select>

            {/* NÚT XÓA */}
            <button
              onClick={() => handleDeleteBox(selectedAnn.id)}
              className="flex items-center justify-center gap-1.5 w-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white py-2 rounded text-sm transition-all border border-red-500/20 hover:border-red-500 mt-1"
            >
              <Trash2 size={14} /> Xóa Khung
            </button>
          </div>
        )}
      </div>

      {/* HƯỚNG DẪN NHANH ĐÃ SỬA */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-slate-400 font-medium bg-[#0f172a]/80 px-4 py-1.5 rounded-full backdrop-blur-sm border border-slate-700">
        Mẹo: Click vào khung hình để <b>Sửa nhãn</b> hoặc <b>Xóa</b>. Click ra
        ngoài để bỏ chọn.
      </p>
    </div>
  );
};

export default ImageCanvas;
