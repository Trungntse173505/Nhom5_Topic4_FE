import React, { useMemo, useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import { getLabelDisplay } from "../../../../utils/aiHelper";

const ReviewerVideoCanvas = ({
  currentItem,
  toggleAnnotationApproval,
  activeBoxId,
  setActiveBoxId,
  availableLabels = [],
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [currentTime, setCurrentTime] = useState(0);

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
    if (containerSize.width === 0) return null;
    const scale = Math.min(
      containerSize.width / ANNOTATOR_WIDTH,
      containerSize.height / ANNOTATOR_HEIGHT,
    );
    return {
      scale,
      offsetX: (containerSize.width - ANNOTATOR_WIDTH * scale) / 2,
      offsetY: (containerSize.height - ANNOTATOR_HEIGHT * scale) / 2,
    };
  }, [containerSize]);

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      if (setActiveBoxId) setActiveBoxId(null);
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    }
  };

  if (!currentItem?.filePath) {
    return (
      <div className="w-full h-full bg-[#1e293b] flex flex-col items-center justify-center text-rose-500 gap-2">
        <span className="text-3xl">💔</span>
        <p className="font-semibold">Lỗi không thể tải Video!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#0b1220] flex items-center justify-center cursor-crosshair overflow-hidden relative"
    >
      {!renderData ? (
        <div className="text-slate-500 animate-pulse font-medium flex flex-col items-center gap-2">
          <span className="text-2xl">🎬</span>
          Đang đồng bộ tọa độ không gian Video...
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            width: ANNOTATOR_WIDTH * renderData.scale,
            height: ANNOTATOR_HEIGHT * renderData.scale,
            left: renderData.offsetX,
            top: renderData.offsetY,
          }}
          className="rounded-xl overflow-hidden shadow-2xl border border-slate-800"
        >
          <video
            ref={videoRef}
            src={currentItem.filePath}
            controls
            autoPlay
            onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />

          <div className="absolute inset-0 pointer-events-none">
            <Stage
              width={ANNOTATOR_WIDTH * renderData.scale}
              height={ANNOTATOR_HEIGHT * renderData.scale}
              onClick={handleStageClick}
              className="pointer-events-auto"
            >
              <Layer scaleX={renderData.scale} scaleY={renderData.scale}>
                {(currentItem?.annotations || []).map((ann) => {
                  if (activeBoxId && activeBoxId !== ann.idDetail) return null;

                  let bx = 0,
                    by = 0,
                    bw = 0,
                    bh = 0;
                  let startTime = 0,
                    endTime = 999999;

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

                    if (parsedData?.startTime !== undefined)
                      startTime = Number(parsedData.startTime);
                    if (parsedData?.endTime !== undefined)
                      endTime = Number(parsedData.endTime);
                  } catch (e) {
                    return null;
                  }

                  if (bw === 0 || bh === 0) return null;
                  if (currentTime < startTime || currentTime > endTime)
                    return null;

                  const labelName = ann.content || "Chưa có nhãn";
                  const labelDef = availableLabels.find(
                    (l) => l.name?.toLowerCase() === labelName.toLowerCase(),
                  );

                  // 🎨 Lấy chuẩn 1 màu duy nhất từ CSDL cho cả KHUNG và NỀN CHỮ
                  const themeColor = labelDef?.color || "#3B82F6";

                  const invScale = 1 / renderData.scale;

                  return (
                    <React.Fragment key={`box-${ann.idDetail}`}>
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
                          e.target.getStage().container().style.cursor =
                            "pointer";
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
                      <Rect
                        x={bx}
                        y={by - 24 * invScale}
                        width={100 * invScale}
                        height={24 * invScale}
                        fill={themeColor}
                        opacity={0.9}
                        cornerRadius={4}
                      />
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewerVideoCanvas;
