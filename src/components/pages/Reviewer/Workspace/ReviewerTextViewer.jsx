import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

const hashToHsl = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 85% 60%)`;
};

const withAlphaBackground = (color) => {
  const c = String(color || "").trim();
  if (!c) return "transparent";

  if (c.startsWith("#")) {
    if (c.length === 7) return `${c}33`;
    if (c.length === 4) {
      // #rgb -> #rrggbb33
      const r = c[1];
      const g = c[2];
      const b = c[3];
      return `#${r}${r}${g}${g}${b}${b}33`;
    }
  }

  if (c.startsWith("hsl(") && c.endsWith(")")) {
    return `${c.slice(0, -1)} / 0.2)`;
  }

  return c;
};

const ReviewerTextViewer = ({
  currentItem,
  activeAnnotationId: _activeAnnotationId,
  setActiveAnnotationId,
  availableLabels = [],
}) => {
  const activeAnnotationId = _activeAnnotationId;
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | loaded | failed

  const filePath = currentItem?.filePath;
  const inlineText =
    currentItem?.text ?? currentItem?.content ?? currentItem?.rawText ?? "";

  const parsedAnnotations = useMemo(() => {
    const anns = currentItem?.annotations || [];
    const normalized = [];
    const fullText = String(text || "");

    const toNumber = (val) => {
      const num = Number(val);
      return Number.isFinite(num) ? num : null;
    };

    const extractOffsets = (obj) => {
      if (!obj || typeof obj !== "object") return {};
      const startKeys = ["start", "begin", "from", "offsetStart", "startOffset", "startPos", "start_offset"];
      const endKeys = ["end", "finish", "to", "offsetEnd", "endOffset", "endPos", "end_offset"];
      let start, end;
      for (const k of startKeys) if (start == null) start = toNumber(obj[k]);
      for (const k of endKeys) if (end == null) end = toNumber(obj[k]);
      return { start, end };
    };

    let searchCursor = 0; // Dùng cho fallback tìm theo nội dung để giảm trùng lặp

    for (const ann of anns) {
      const isTextAnnotation = ann?.field && ann.field !== "BoundingBox";

      let start = toNumber(ann?.start) ?? toNumber(ann?.begin) ?? toNumber(ann?.from);
      let end = toNumber(ann?.end) ?? toNumber(ann?.finish) ?? toNumber(ann?.to);

      // Thử đọc annotationData
      try {
        let parsed = ann?.annotationData;
        while (typeof parsed === "string") parsed = JSON.parse(parsed);

        const directOffsets = extractOffsets(parsed);
        if (start == null && directOffsets.start != null) start = directOffsets.start;
        if (end == null && directOffsets.end != null) end = directOffsets.end;

        if (parsed?.position) {
          const nested = extractOffsets(parsed.position);
          if (start == null && nested.start != null) start = nested.start;
          if (end == null && nested.end != null) end = nested.end;
        }
      } catch {
        // bỏ qua lỗi parse JSON
      }

      // Fallback: nếu thiếu tọa độ mà có nội dung + text gốc, dò vị trí theo nội dung
      if ((start == null || end == null || end <= start) && isTextAnnotation && fullText && ann?.content) {
        const needle = String(ann.content).trim();
        if (needle) {
          let idx = fullText.indexOf(needle, searchCursor);
          if (idx === -1) idx = fullText.indexOf(needle);
          if (idx !== -1) {
            start = idx;
            end = idx + needle.length;
            searchCursor = end;
          }
        }
      }

      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;

      // Text task: backend lưu label ở field, content là đoạn text đã bôi.
      // Bounding box: field === "BoundingBox", label nằm ở content.
      const labelName =
        ann?.field && ann.field !== "BoundingBox"
          ? ann.field
          : ann?.label || ann?.content || "Nhãn";

      normalized.push({
        idDetail: ann?.idDetail,
        label: labelName,
        isApproved: ann?.isApproved,
        start,
        end,
        raw: ann,
      });
    }

    normalized.sort((a, b) => a.start - b.start);
    return normalized;
  }, [currentItem?.annotations, text]);

  const renderedText = useMemo(() => {
    if (!text) return "—";
    if (!parsedAnnotations.length) return text;

    const elements = [];
    let lastIndex = 0;

    for (let i = 0; i < parsedAnnotations.length; i++) {
      const ann = parsedAnnotations[i];
      const safeStart = Math.max(lastIndex, ann.start);
      const safeEnd = Math.max(safeStart, ann.end);

      if (safeStart > lastIndex) {
        elements.push(
          <span key={`t-${i}`}>{text.slice(lastIndex, safeStart)}</span>,
        );
      }

      // ưu tiên lấy màu từ availableLabels theo tên nhãn, fallback hash để nhãn khác nhau có màu khác
      const labelDef = (availableLabels || []).find((l) => l?.name === ann.label);
      const color =
        labelDef?.color ||
        ann?.raw?.labelColor ||
        ann?.raw?.color ||
        hashToHsl(ann.label || "");

      elements.push(
        <span
          key={`hl-${ann.idDetail || i}`}
          title={`Nhãn: ${ann.label}`}
          onClick={() => ann.idDetail && setActiveAnnotationId?.(ann.idDetail)}
          className="px-1 py-0.5 rounded border mx-0.5 font-medium cursor-pointer hover:brightness-125 transition-all"
          style={{
            backgroundColor: withAlphaBackground(color),
            borderColor: color,
            color,
          }}
        >
          {text.slice(safeStart, safeEnd)}
        </span>,
      );

      lastIndex = Math.max(lastIndex, safeEnd);
    }

    if (lastIndex < text.length) {
      elements.push(<span key="t-end">{text.slice(lastIndex)}</span>);
    }

    return elements;
  }, [parsedAnnotations, setActiveAnnotationId, text]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (inlineText) {
        setText(String(inlineText));
        setStatus("loaded");
        return;
      }

      if (!filePath) {
        setText("");
        setStatus("failed");
        return;
      }

      setStatus("loading");
      try {
        const res = await fetch(filePath);
        const t = await res.text();
        if (cancelled) return;
        setText(t);
        setStatus("loaded");
      } catch {
        if (cancelled) return;
        setStatus("failed");
      }
    };

    setText("");
    setStatus("idle");
    run();

    return () => {
      cancelled = true;
    };
  }, [filePath, inlineText]);

  if (status === "loading") {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin w-5 h-5" />
        Đang tải nội dung...
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
        <p className="font-medium text-rose-400">Không thể hiển thị dữ liệu text.</p>
        {filePath ? (
          <a
            href={filePath}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Mở file trong tab mới
          </a>
        ) : (
          <p className="text-sm text-slate-500">Không có đường dẫn file.</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#1e293b] rounded-xl p-8 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          Tài liệu: {currentItem?.fileName || currentItem?.itemID || "Đang tải..."}
        </h2>
      </div>

      <div className="text-lg leading-loose text-slate-300 bg-[#0f172a] p-8 rounded-xl border border-slate-700 cursor-text flex-1 overflow-y-auto shadow-inner whitespace-pre-wrap relative">
        {renderedText}
      </div>
    </div>
  );
};

export default ReviewerTextViewer;
