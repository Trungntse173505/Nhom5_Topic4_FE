import React, { memo } from "react";
import { getLabelDisplay } from "../../../../../utils/aiHelper";

const HighlightedText = memo(({ 
  originalText, 
  annotations, 
  availableLabels, 
  selectedMenuId, 
  onHighlightClick 
}) => {
  if (!annotations?.length) return <>{originalText}</>;

  const elements = [];
  let lastIndex = 0;

  annotations.forEach((hl, i) => {
    const safeStart = Math.max(lastIndex, hl.start);

    if (safeStart > lastIndex) {
      elements.push(
        <span key={`t-${i}`}>
          {originalText.slice(lastIndex, safeStart)}
        </span>
      );
    }

    const labelDef = availableLabels.find(
      (l) => l.name?.trim().toLowerCase() === String(hl.label || "").trim().toLowerCase()
    );

    const labelColor = labelDef?.color || "#94a3b8"; // Vẫn giữ màu của Label
    const isSelected = selectedMenuId === hl.id;

    // 🔥 CHỈ THÊM DẤU CHECK/X
    let statusIcon = "";
    if (hl.isApproved === "True") {
      statusIcon = " ✓";
    } else if (hl.isApproved === "False") {
      statusIcon = " ✗";
    }

    elements.push(
      <span
        key={hl.id || `hl-${i}`}
        onClick={(e) => onHighlightClick(e, hl)}
        title={`Nhãn: ${getLabelDisplay(hl.label || "")} - Click để sửa/xóa`}
        className="px-1 py-0.5 rounded mx-0.5 font-medium cursor-pointer hover:brightness-125 transition-all"
        style={{
          backgroundColor: `${labelColor}40`,
          border: isSelected ? `2px dashed #ffffff` : `1px solid ${labelColor}`,
          color: isSelected ? "#ffffff" : labelColor,
          boxShadow: isSelected ? `0 0 10px ${labelColor}` : "none",
        }}
      >
        {originalText.slice(safeStart, hl.end)}{statusIcon}
      </span>
    );
    lastIndex = Math.max(lastIndex, hl.end);
  });

  if (lastIndex < originalText.length) {
    elements.push(<span key="t-end">{originalText.slice(lastIndex)}</span>);
  }

  return <>{elements}</>;
});

export default HighlightedText;