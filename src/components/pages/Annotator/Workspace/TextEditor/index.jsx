import React, { useRef, useState, useEffect, useCallback } from "react";
import { Trash2, RotateCcw, Loader2, FileText, AlertCircle } from "lucide-react";
import BoxContextMenu from "../../../../common/BoxContextMenu";
import HighlightedText from "./HighlightedText";

const TextEditor = ({
  selectedLabel,
  annotations,
  setAnnotations,
  fileData,
  availableLabels = [],
}) => {
  const textContainerRef = useRef(null);
  const wrapperRef = useRef(null);
  const isInternalAction = useRef(false); // Chốt chặn: Chỉ bôi khi nhấn chuột trong text

  const [originalText, setOriginalText] = useState("");
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [error, setError] = useState(null);
  const [menuData, setMenuData] = useState(null);

  // 🔥 FIX LỖI RENDER HOOKS: Đưa hàm này lên đầu level component
  const handleHighlightClick = useCallback((e, hl) => {
    e.stopPropagation();
    isInternalAction.current = false; 
    const rect = e.currentTarget.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    setMenuData({ 
        ...hl, 
        x: rect.left - wrapperRect.left, 
        y: rect.top - wrapperRect.top, 
        width: rect.width, 
        height: rect.height 
    });
  }, [wrapperRef]);

  useEffect(() => {
    const fetchTextContent = async () => {
      if (fileData?.url) {
        setIsLoadingText(true);
        setError(null);
        try {
          const response = await fetch(fileData.url);
          if (!response.ok) throw new Error("Lỗi tải file.");
          setOriginalText(await response.text());
        } catch (err) {
          setError("Lỗi tải nội dung văn bản.");
          setOriginalText(fileData?.content || "");
        } finally { setIsLoadingText(false); }
      } else { setOriginalText(fileData?.content || ""); }
    };
    fetchTextContent();
  }, [fileData?.url, fileData?.content]);

  // Xóa bôi đen khi đổi nhãn
  useEffect(() => {
    window.getSelection()?.removeAllRanges();
  }, [selectedLabel]);

  const getCharacterOffsetWithin = (node, targetNode, targetOffset) => {
    let offset = 0;
    const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
    let n;
    while ((n = walk.nextNode())) {
      if (n === targetNode) return offset + targetOffset;
      offset += n.textContent.replace(/[✓✗]/g, "").length;
    }
    return offset;
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.hl-span') || e.target.closest('.context-menu')) {
      isInternalAction.current = false;
      return;
    }
    isInternalAction.current = true;
  };

  const handleMouseUp = (e) => {
    const selection = window.getSelection();

    if (!isInternalAction.current) {
      isInternalAction.current = false;
      return;
    }
    isInternalAction.current = false;

    if (!selectedLabel) {
      if (!selection.isCollapsed) {
        alert("⚠️ Vui lòng chọn Nhãn (Label) trước!");
        selection.removeAllRanges();
      }
      return;
    }

    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const container = textContainerRef.current;
    if (!container.contains(range.commonAncestorContainer)) {
      selection.removeAllRanges();
      return;
    }

    const start = getCharacterOffsetWithin(container, range.startContainer, range.startOffset);
    const end = getCharacterOffsetWithin(container, range.endContainer, range.endOffset);
    selection.removeAllRanges();

    if (start === end || isNaN(start) || isNaN(end)) return;

    const text = originalText.slice(start, end);
    if (!text.trim()) return;

    setAnnotations((prev) => {
      const newAnnotation = { id: `txt-${Date.now()}`, start, end, label: selectedLabel, text, isApproved: "New" };
      const updated = [...(prev || []), newAnnotation].sort((a, b) => a.start - b.start);
      return updated.reduce((acc, curr) => {
        const last = acc[acc.length - 1];
        const isSameLabel = last && String(last.label).toLowerCase() === String(curr.label).toLowerCase();
        if (last && curr.start <= last.end && isSameLabel) {
          const newEnd = Math.max(last.end, curr.end);
          acc[acc.length - 1] = { ...last, end: newEnd, text: originalText.slice(last.start, newEnd) };
        } else { acc.push(curr); }
        return acc;
      }, []);
    });
  };

  return (
    <div ref={wrapperRef} className="w-full h-full bg-[#1e293b] flex flex-col relative group p-6 overflow-hidden">
      <div className="flex items-center gap-3 mb-4 px-2">
        <FileText className="text-blue-400" />
        <h2 className="text-lg font-bold text-white">Tài liệu: {fileData?.id || "..."}</h2>
        {!selectedLabel && (
          <div className="flex items-center gap-2 text-amber-400 text-sm font-medium animate-pulse ml-4 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            <AlertCircle size={14} /> Hãy chọn Nhãn trước!
          </div>
        )}
      </div>

      <div
        ref={textContainerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={() => setMenuData(null)}
        className="text-lg leading-loose text-slate-300 bg-[#0b1220] p-10 rounded-2xl border border-slate-700/50 cursor-text flex-1 overflow-y-auto whitespace-pre-wrap relative mb-8 select-text"
      >
        {isLoadingText ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">Đang tải...</div>
        ) : (
          <HighlightedText 
            originalText={originalText}
            annotations={annotations}
            availableLabels={availableLabels}
            selectedMenuId={menuData?.id}
            onHighlightClick={handleHighlightClick}
          />
        )}
      </div>

      <BoxContextMenu
        selectedAnn={menuData}
        availableLabels={availableLabels}
        CANVAS_WIDTH={wrapperRef.current?.clientWidth || 800}
        CANVAS_HEIGHT={wrapperRef.current?.clientHeight || 600}
        onCancel={() => setMenuData(null)}
        onChangeLabel={(id, label) => {
            setAnnotations(prev => prev.map(a => a.id === id ? {...a, label, isApproved: "New"} : a));
            setMenuData(null);
        }}
        onDelete={(id) => { setAnnotations(prev => prev.filter(a => a.id !== id)); setMenuData(null); }}
      />
    </div>
  );
};

export default TextEditor;