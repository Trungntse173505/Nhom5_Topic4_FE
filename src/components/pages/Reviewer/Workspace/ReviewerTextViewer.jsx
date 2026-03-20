// Đường dẫn: src/pages/Reviewer/Workspace/ReviewerTextViewer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { getLabelDisplay } from "../../../../utils/aiHelper";
import { VI_TO_EN_DICT } from "../../../../utils/dictionary";

const getNormalizedEng = (str) => {
  if (!str) return "";
  const cleanStr = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  return VI_TO_EN_DICT[cleanStr] || cleanStr;
};

const hashToHsl = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 85% 60%)`;
};

const withAlphaBackground = (color) => {
  const c = String(color || "").trim();
  if (!c) return "transparent";
  if (c.startsWith("#")) {
    if (c.length === 7) return `${c}33`;
    if (c.length === 4) {
      const r = c[1],
        g = c[2],
        b = c[3];
      return `#${r}${r}${g}${g}${b}${b}33`;
    }
  }
  if (c.startsWith("hsl(") && c.endsWith(")"))
    return `${c.slice(0, -1)} / 0.2)`;
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
  const [status, setStatus] = useState("idle");

  const filePath = currentItem?.filePath;
  const inlineText =
    currentItem?.text ?? currentItem?.content ?? currentItem?.rawText ?? "";

  const parsedAnnotations = useMemo(() => {
    const anns = currentItem?.annotations || [];
    const normalized = [];
    const fullText = String(text || "");

    const toNumber = (val) =>
      Number.isFinite(Number(val)) ? Number(val) : null;

    const extractOffsets = (obj) => {
      if (!obj || typeof obj !== "object") return {};
      let start, end;
      for (const k of ["start", "begin", "from", "offsetStart"])
        if (start == null) start = toNumber(obj[k]);
      for (const k of ["end", "finish", "to", "offsetEnd"])
        if (end == null) end = toNumber(obj[k]);
      return { start, end };
    };

    let searchCursor = 0;

    for (const ann of anns) {
      let start =
        toNumber(ann?.start) ?? toNumber(ann?.begin) ?? toNumber(ann?.from);
      let end =
        toNumber(ann?.end) ?? toNumber(ann?.finish) ?? toNumber(ann?.to);
      let parsed = ann?.annotationData;

      try {
        while (typeof parsed === "string") parsed = JSON.parse(parsed);
        const directOffsets = extractOffsets(parsed);
        if (start == null) start = directOffsets.start;
        if (end == null) end = directOffsets.end;
      } catch {}

      if (
        (start == null || end == null || end <= start) &&
        fullText &&
        ann?.content
      ) {
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

      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
        continue;

      // 🔥 FIX CHUẨN: CHỈ LẤY NHÃN TỪ TRƯỜNG "field" (Nơi backend lưu tên Nhãn)
      // Nếu field bị rỗng hoặc là BoundingBox thì mới lấy nhãn dự phòng.
      const labelName =
        ann?.field && ann.field !== "BoundingBox" && ann.field !== "TEXT"
          ? ann.field
          : ann?.label || parsed?.label || "Nhãn Khuyết Danh";

      normalized.push({
        idDetail: ann?.idDetail,
        label: labelName,
        isApproved: ann?.isApproved,
        start,
        end,
        raw: ann,
      });
    }

    return normalized.sort((a, b) => a.start - b.start);
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

      const labelDef = (availableLabels || []).find((l) => {
        const dbLabel = ann.label || "";
        const listLabel = l.name || "";
        return (
          listLabel.trim().toLowerCase() === dbLabel.trim().toLowerCase() ||
          getNormalizedEng(listLabel) === getNormalizedEng(dbLabel)
        );
      });

      const color =
        labelDef?.color ||
        ann?.raw?.color ||
        ann?.raw?.labelColor ||
        hashToHsl(ann.label || "");

      // 🚨 MÁY NGHE LÉN LOG LỖI MÀU SẮC DÀNH CHO F12
      console.log(
        `🔍 [ĐIỀU TRA MÀU SẮC] Khung chữ: "${text.slice(safeStart, safeStart + 15)}..."`,
      );
      console.log(`   🔸 Nhãn lấy từ DB (ann.label):`, ann.label);
      console.log(`   🔸 Danh sách Label (availableLabels):`, availableLabels);
      if (!labelDef) {
        console.warn(
          `   ❌ THẤT BẠI: Không tìm thấy nhãn "${ann.label}" trong danh sách!`,
        );
        console.warn(
          `   ⚠️ Hành động: Dùng màu dự phòng hoặc màu random: ${color}`,
        );
      } else {
        console.log(
          `   ✅ THÀNH CÔNG: Đã khớp với nhãn "${labelDef.name}". MÀU CHUẨN: ${color}`,
        );
      }
      console.log("-------------------------------------------------");

      elements.push(
        <span
          key={`hl-${ann.idDetail || i}`}
          title={`Nhãn: ${getLabelDisplay(ann.label || "")}`}
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

    if (lastIndex < text.length)
      elements.push(<span key="t-end">{text.slice(lastIndex)}</span>);
    return elements;
  }, [parsedAnnotations, setActiveAnnotationId, text, availableLabels]);

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
    run();
    return () => {
      cancelled = true;
    };
  }, [filePath, inlineText]);

  if (status === "loading")
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin w-5 h-5" /> Đang tải...
      </div>
    );
  if (status === "failed")
    return (
      <div className="w-full h-full flex items-center justify-center text-rose-400">
        Không tải được dữ liệu.
      </div>
    );

  return (
    <div className="w-full h-full bg-[#1e293b] rounded-xl p-8 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">
          Tài liệu: {currentItem?.fileName || currentItem?.itemID}
        </h2>
      </div>
      <div className="text-lg leading-loose text-slate-300 bg-[#0f172a] p-8 rounded-xl border border-slate-700 cursor-text flex-1 overflow-y-auto shadow-inner whitespace-pre-wrap relative">
        {renderedText}
      </div>
    </div>
  );
};
export default ReviewerTextViewer;
