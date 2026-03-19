import React, { memo } from "react";
import { Group, Rect, Label, Tag, Text } from "react-konva";
import { getLabelDisplay } from "../../../../../utils/aiHelper";

// Dùng React.memo để TỐI ƯU HIỆU NĂNG: Chỉ render lại khi prop của chính nó thay đổi
const AnnotationBox = memo(({ annotation, isSelected, color, onSelect }) => {
  const topX = Math.min(annotation.x, annotation.x + annotation.width);
  const topY = Math.min(annotation.y, annotation.y + annotation.height);

  return (
    <Group>
      <Rect
        x={annotation.x}
        y={annotation.y}
        width={annotation.width}
        height={annotation.height}
        stroke={isSelected ? "#ffffff" : color}
        strokeWidth={isSelected ? 4 : 3}
        // Khung đang chọn thì gạch đứt to, khung AI vẽ thì gạch đứt nhỏ, khung người vẽ thì nét liền
        dash={isSelected ? [8, 4] : (annotation.isAiGenerated ? [5, 5] : null)}
        fill={`${color}33`}
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
          text={getLabelDisplay(annotation.label)}
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