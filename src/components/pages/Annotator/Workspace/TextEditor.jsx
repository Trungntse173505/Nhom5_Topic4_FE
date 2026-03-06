import React, { useRef } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';

const TextEditor = ({ selectedLabel, annotations, setAnnotations, fileData }) => {
  const textContainerRef = useRef(null);
  const originalText = fileData?.content || "";

  const textColorMap = {
    'Tích cực': 'bg-green-500/30 border-green-500 text-green-200',
    'Tiêu cực': 'bg-red-500/30 border-red-500 text-red-200',
    'Trung tính': 'bg-slate-500/30 border-slate-500 text-slate-200',
    'Spam': 'bg-yellow-500/30 border-yellow-500 text-yellow-200',
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(textContainerRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    
    const start = preSelectionRange.toString().length;
    const end = start + range.toString().length;
    selection.removeAllRanges();

    setAnnotations((prev) => {
      let newArray = [...prev, { start, end, label: selectedLabel }];
      newArray.sort((a, b) => a.start - b.start);

      // THUẬT TOÁN GỘP (MERGE) - NGĂN LẶP CHỮ TRIỆT ĐỂ
      const merged = [];
      if (newArray.length > 0) {
        let current = { ...newArray[0] };
        for (let i = 1; i < newArray.length; i++) {
          let next = newArray[i];
          if (next.start <= current.end) {
            current.end = Math.max(current.end, next.end);
            current.label = next.label; 
          } else {
            merged.push(current);
            current = { ...next };
          }
        }
        merged.push(current);
      }
      return merged;
    });
  };

  const renderText = () => {
    if (annotations.length === 0) return originalText;
    const elements = [];
    let lastIndex = 0;

    annotations.forEach((hl, index) => {
      if (hl.start > lastIndex) {
        elements.push(<span key={`t-${index}`}>{originalText.slice(lastIndex, hl.start)}</span>);
      }
      const colorClass = textColorMap[hl.label] || 'bg-blue-500/30 border-blue-500';
      elements.push(
        <span 
          key={`hl-${index}`} 
          title="Click để xóa"
          onClick={() => window.confirm("Xóa highlight này?") && setAnnotations(annotations.filter((_, i) => i !== index))}
          className={`${colorClass} px-1 py-0.5 rounded border mx-0.5 font-medium cursor-pointer hover:brightness-110 transition-all`}
        >
          {originalText.slice(hl.start, hl.end)}
        </span>
      );
      lastIndex = hl.end;
    });

    if (lastIndex < originalText.length) {
      elements.push(<span key="t-end">{originalText.slice(lastIndex)}</span>);
    }
    return elements;
  };

  return (
    <div className="w-full h-full bg-[#1e293b] rounded-xl p-8 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Tài liệu: {fileData?.id}</h2>
        
        {/* THANH THAO TÁC TRONG WORKSPACE */}
        <div className="flex gap-2">
          <button 
            onClick={() => setAnnotations(annotations.slice(0, -1))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-[#0f172a] rounded-lg border border-slate-700 transition-all"
          >
            <RotateCcw size={14} /> Hoàn tác
          </button>
          <button 
            onClick={() => window.confirm("Xóa toàn bộ highlight?") && setAnnotations([])}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/10 bg-[#0f172a] rounded-lg border border-red-500/20 transition-all"
          >
            <Trash2 size={14} /> Xóa sạch
          </button>
        </div>
      </div>

      <div 
        ref={textContainerRef} onMouseUp={handleMouseUp}
        className="text-lg leading-loose text-slate-300 bg-[#0f172a] p-8 rounded-xl border border-slate-700 cursor-text flex-1 overflow-y-auto shadow-inner"
      >
        {renderText()}
      </div>
    </div>
  );
};

export default TextEditor;