import React from "react";
import { Group, Rect, Label, Tag, Text } from "react-konva";
import { getLabelDisplay } from "../../../../../utils/aiHelper";

const DrawingBox = ({ newAnnotation, color }) => {
  if (!newAnnotation) return null;

  const topX = Math.min(newAnnotation.x, newAnnotation.x + newAnnotation.width);
  const topY = Math.min(newAnnotation.y, newAnnotation.y + newAnnotation.height);

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
          text={getLabelDisplay(newAnnotation.label)}
          fill="white"
          fontSize={12}
          fontStyle="bold"
          padding={4}
        />
      </Label>
    </Group>
  );
};

export default DrawingBox;