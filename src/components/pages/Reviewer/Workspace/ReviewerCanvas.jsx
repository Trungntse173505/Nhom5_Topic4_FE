import React, { useMemo, useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { getLabelDisplay } from "../../../../utils/aiHelper";

const ReviewerCanvas = ({
  currentItem,
  toggleAnnotationApproval,
  activeBoxId,
  setActiveBoxId,
  availableLabels = [],
}) => {
  const containerRef = useRef(null);
  const [img, status] = useImage(currentItem?.filePath || "", "anonymous");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const ANNOTATOR_WIDTH = 800;
  const ANNOTATOR_HEIGHT = 600;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [currentItem]);

  const renderData = useMemo(() => {
    if (status !== "loaded" || !img || containerSize.width === 0) return null;
    const scale = Math.min(
      containerSize.width / ANNOTATOR_WIDTH,
      containerSize.height / ANNOTATOR_HEIGHT,
    );
    return {
      scale,
      offsetX: (containerSize.width - ANNOTATOR_WIDTH * scale) / 2,
      offsetY: (containerSize.height - ANNOTATOR_HEIGHT * scale) / 2,
    };
  }, [img, status, containerSize]);

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || e.target.attrs.image) {
      if (setActiveBoxId) setActiveBoxId(null);
    }
  };

  if (status === "failed") {
    return (
      <div className="w-full h-full bg-[#1e293b] flex flex-col items-center justify-center text-rose-500 gap-2">
        <span className="text-3xl">💔</span>
        <p className="font-semibold">Lỗi không thể tải ảnh!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#1e293b] flex items-center justify-center cursor-crosshair overflow-hidden"
    >
      {!renderData ? (
        <div className="text-slate-500 animate-pulse font-medium flex flex-col items-center gap-2">
          <span className="text-2xl">🖼️</span>
          Đang đồng bộ tọa độ không gian...
        </div>
      ) : (
        <Stage
          width={containerSize.width}
          height={containerSize.height}
          onClick={handleStageClick}
        >
          <Layer
            x={renderData.offsetX}
            y={renderData.offsetY}
            scaleX={renderData.scale}
            scaleY={renderData.scale}
          >
            <KonvaImage
              image={img}
              x={0}
              y={0}
              width={ANNOTATOR_WIDTH}
              height={ANNOTATOR_HEIGHT}
            />

            {(currentItem?.annotations || []).map((ann) => {
              if (activeBoxId && activeBoxId !== ann.idDetail) return null;

              let bx = 0,
                by = 0,
                bw = 0,
                bh = 0;

              try {
                let parsedData = ann.annotationData;
                while (typeof parsedData === "string") {
                  parsedData = JSON.parse(parsedData);
                }
                bx = Number(parsedData?.x || parsedData?.xmin) || 0;
                by = Number(parsedData?.y || parsedData?.ymin) || 0;
                bw =
                  Number(
                    parsedData?.width ||
                      (parsedData?.xmax ? parsedData.xmax - bx : 0),
                  ) || 0;
                bh =
                  Number(
                    parsedData?.height ||
                      (parsedData?.ymax ? parsedData.ymax - by : 0),
                  ) || 0;
              } catch (e) {
                return null;
              }

              if (bw === 0 || bh === 0) return null;

              const labelName = ann.content || "Chưa có nhãn";
              const labelDef = availableLabels.find(
                (l) => l.name?.toLowerCase() === labelName.toLowerCase(),
              );

              // 🎨 Lấy chuẩn 1 màu duy nhất từ CSDL cho cả KHUNG và NỀN CHỮ
              const themeColor = labelDef?.color || "#3B82F6";

              const invScale = 1 / renderData.scale;

              return (
                <React.Fragment key={`box-${ann.idDetail}`}>
                  {/* Viền của Box */}
                  <Rect
                    x={bx}
                    y={by}
                    width={bw}
                    height={bh}
                    stroke={themeColor}
                    strokeWidth={
                      (activeBoxId === ann.idDetail ? 4 : 2) * invScale
                    }
                    fill={`${themeColor}${activeBoxId === ann.idDetail ? "40" : "1A"}`}
                    onMouseEnter={(e) => {
                      e.target.getStage().container().style.cursor = "pointer";
                    }}
                    onMouseLeave={(e) => {
                      e.target.getStage().container().style.cursor =
                        "crosshair";
                    }}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      if (setActiveBoxId) setActiveBoxId(ann.idDetail);
                    }}
                  />

                  {/* Nền của tên nhãn (Dùng luôn themeColor để trùng màu với viền) */}
                  <Rect
                    x={bx}
                    y={by - 24 * invScale}
                    width={100 * invScale}
                    height={24 * invScale}
                    fill={themeColor}
                    opacity={0.9}
                    cornerRadius={4}
                  />

                  {/* Tên Label */}
                  <Text
                    x={bx + 4 * invScale}
                    y={by - 18 * invScale}
                    text={getLabelDisplay(labelName)}
                    fontSize={12 * invScale}
                    fill="#fff"
                    fontStyle="bold"
                  />
                </React.Fragment>
              );
            })}
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default ReviewerCanvas;
