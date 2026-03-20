import React, { useRef, useState, useEffect, useCallback } from "react";
import { Trash2, RotateCcw, Loader2, FileText } from "lucide-react";
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

  const [originalText, setOriginalText] = useState("");
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [error, setError] = useState(null);
  const [menuData, setMenuData] = useState(null);

  // Lấy dữ liệu file Text
  useEffect(() => {
    const fetchTextContent = async () => {
      if (fileData?.url) {
        setIsLoadingText(true);
        setError(null);
        try {
          const response = await fetch(fileData.url);
          if (!response.ok) throw new Error("Lỗi khi tải file văn bản.");
          const text = await response.text();
          setOriginalText(text);
        } catch (err) {
          console.error("Fetch text error:", err);
          setError("Không thể tải nội dung văn bản từ máy chủ.");
          setOriginalText(fileData?.content || "");
        } finally {
          setIsLoadingText(false);
        }
      } else {
        setOriginalText(fileData?.content || "");
      }
    };
    fetchTextContent();
  }, [fileData?.url, fileData?.content]);

  // Chức năng Hoàn tác / Xóa toàn bộ
  const handleUndo = () => {
    if (annotations.length > 0) {
      setAnnotations((prev) => (prev || []).slice(0, -1));
      setMenuData(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc muốn xóa TOÀN BỘ highlight trên văn bản này?")) {
      setAnnotations([]);
      setMenuData(null);
    }
  };

  // Logic bôi đen văn bản
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed || !selectedLabel) return;

    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(textContainerRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);

    const start = preSelectionRange.toString().length;
    const end = start + range.toString().length;
    selection.removeAllRanges();

    const highlightedText = originalText.slice(start, end);

    setAnnotations((prev) => {
      const newId = `txt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newAnnotation = { id: newId, start, end, label: selectedLabel, text: highlightedText };
      
      const sorted = [...(prev || []), newAnnotation].sort((a, b) => a.start - b.start);

      return sorted.reduce((acc, curr) => {
        const last = acc[acc.length - 1];
        if (last && curr.start <= last.end) {
          const newEnd = Math.max(last.end, curr.end);
          acc[acc.length - 1] = {
            ...last,
            end: newEnd,
            label: curr.label,
            text: originalText.slice(last.start, newEnd),
          };
        } else {
          acc.push({ ...curr, id: curr.id || `txt-${Date.now()}-${Math.random()}` });
        }
        return acc;
      }, []);
    });
  };

  // TỐI ƯU: Dùng useCallback để Component con không bị re-render vô ích
  const handleHighlightClick = useCallback((e, hl) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    setMenuData({
      ...hl,
      x: rect.left - wrapperRect.left,
      y: rect.top - wrapperRect.top,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  const handleChangeLabel = (annId, newLabelName) => {
    const matchedLabel = availableLabels.find(
      (l) => l.name?.trim().toLowerCase() === newLabelName?.trim().toLowerCase()
    );
    setAnnotations(
      annotations.map((ann) =>
        ann.id === annId ? { ...ann, label: newLabelName, labelId: matchedLabel?.id } : ann
      )
    );
    setMenuData((prev) => ({ ...prev, label: newLabelName }));
  };

  const handleDeleteBox = (annId) => {
    setAnnotations(annotations.filter((a) => a.id !== annId));
    setMenuData(null);
  };

  return (
    <div ref={wrapperRef} className="w-full h-full bg-[#1e293b] flex flex-col relative group p-6 overflow-hidden">
      {/* TOOLBAR */}
      <div className="absolute top-8 right-10 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleUndo} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 bg-[#0f172a]/80 backdrop-blur-md rounded-lg border border-slate-700 hover:text-white hover:bg-slate-800 transition-all shadow-xl">
          <RotateCcw size={14} /> Hoàn tác
        </button>
        <button onClick={handleClearAll} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-400 bg-[#0f172a]/80 backdrop-blur-md rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all shadow-xl">
          <Trash2 size={14} /> Xóa sạch
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
          <FileText size={20} />
        </div>
        <h2 className="text-lg font-bold text-white flex items-center gap-3">
          Tài liệu: {fileData?.id || "Đang tải..."}
          {isLoadingText && <Loader2 className="animate-spin text-blue-400 w-5 h-5" />}
        </h2>
      </div>

      <div
        ref={textContainerRef}
        onMouseUp={handleMouseUp}
        onClick={() => setMenuData(null)}
        className="text-lg leading-loose text-slate-300 bg-[#0b1220] p-10 rounded-2xl border border-slate-700/50 cursor-text flex-1 overflow-y-auto shadow-2xl whitespace-pre-wrap relative mb-8"
      >
        {isLoadingText ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            Đang tải nội dung văn bản...
          </div>
        ) : error ? (
          <div className="text-red-400 p-4 bg-red-900/20 rounded border border-red-900">
            {error}
          </div>
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
        onChangeLabel={handleChangeLabel}
        onDelete={handleDeleteBox}
      />
      
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-slate-400 font-medium bg-[#0f172a]/80 px-4 py-1.5 rounded-full backdrop-blur-sm border border-slate-700 z-20 pointer-events-none">
        Mẹo: Bôi đen một đoạn văn bản để gán nhãn. Click vào đoạn đã bôi để Sửa/Xóa.
      </p>
    </div>
  );
};

export default TextEditor;