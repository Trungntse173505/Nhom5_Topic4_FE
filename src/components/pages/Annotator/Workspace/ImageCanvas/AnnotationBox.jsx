import React, { memo } from "react";
import { Group, Rect, Label, Tag, Text } from "react-konva";
import { getLabelDisplay } from "../../../../../utils/aiHelper";

// Dùng React.memo để TỐI ƯU HIỆU NĂNG
const AnnotationBox = memo(({ annotation, isSelected, color, onSelect }) => {
  const topX = Math.min(annotation.x, annotation.x + annotation.width);
  const topY = Math.min(annotation.y, annotation.y + annotation.height);

  // 🔥 CHỈ THÊM DẤU CHECK/X, GIỮ NGUYÊN MÀU CỦA NHÃN
  let statusIcon = "";
  if (annotation.isApproved === "True") {
    statusIcon = " ✓";
  } else if (annotation.isApproved === "False") {
    statusIcon = " ✗";
  }

  return (
    <Group>
      <Rect
        x={annotation.x}
        y={annotation.y}
        width={annotation.width}
        height={annotation.height}
        stroke={isSelected ? "#ffffff" : color} // Vẫn dùng biến color gốc của Label
        strokeWidth={isSelected ? 4 : 3}
        dash={isSelected ? [8, 4] : (annotation.isAiGenerated ? [5, 5] : null)}
        fill={`${color}33`} // Vẫn dùng màu gốc làm nền mờ
        onClick={(e) => onSelect(e, annotation.id)}
        onMouseEnter={(e) => {
          e.target.getStage().container().style.cursor = "pointer";
        }}
        onMouseLeave={(e) => {
          e.target.getStage().container().style.cursor = "crosshair";
        }}
      />
      <Label x={topX} y={topY - 24}>
        <Tag fill={color} cornerRadius={4} />
        <Text
          text={`${getLabelDisplay(annotation.label)}${statusIcon}`} // Thêm icon vào đây
          fill="white"
          fontSize={12}
          fontStyle="bold"
          padding={4}
        />
      </Label>
    </Group>
  );
});

export default AnnotationBox;