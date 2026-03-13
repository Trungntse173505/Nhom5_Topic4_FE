import React, { useRef, useState, useEffect } from 'react';
import { Trash2, RotateCcw, Loader2 } from 'lucide-react';

const TextEditor = ({ selectedLabel, annotations, setAnnotations, fileData, availableLabels = [] }) => {
  const textContainerRef = useRef(null);
  
  const [originalText, setOriginalText] = useState("");
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dữ liệu text từ URL
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

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed || !selectedLabel) return;

    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(textContainerRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    
    // 1. Tính toán tọa độ
    const start = preSelectionRange.toString().length;
    const end = start + range.toString().length;
    selection.removeAllRanges();

    // 2. Lấy luôn đoạn text đã bôi đen để gửi kèm API (trường content)
    const highlightedText = originalText.slice(start, end);

    setAnnotations((prev) => {
      // 3. Khởi tạo object mới với trường `text`
      const newAnnotation = { start, end, label: selectedLabel, text: highlightedText };
      const sorted = [...(prev || []), newAnnotation].sort((a, b) => a.start - b.start);
      
      return sorted.reduce((acc, curr) => {
        const last = acc[acc.length - 1];
        
        // 4. KIỂM TRA OVERLAP VÀ FIX LỖI GHI ĐÈ
        if (last && curr.start <= last.end) {
          const newEnd = Math.max(last.end, curr.end);
          // KHÔNG sửa trực tiếp last (mutate). Tạo object mới để thay thế
          acc[acc.length - 1] = {
            ...last,
            end: newEnd,
            label: curr.label, // Ghi đè label mới nếu muốn ưu tiên nhãn bôi sau
            text: originalText.slice(last.start, newEnd) // Cập nhật lại chuỗi bao trùm
          };
        } else {
          // Clone curr vào acc để tránh mutate tham chiếu
          acc.push({ ...curr });
        }
        return acc;
      }, []);
    });
  };

  const renderText = () => {
    if (!annotations?.length) return originalText;
    
    const elements = [];
    let lastIndex = 0;

    annotations.forEach((hl, i) => {
      // FIX LỖI LẶP CHUỖI HIỂN THỊ: Ép safeStart không bao giờ thụt lùi
      const safeStart = Math.max(lastIndex, hl.start);

      // In phần text bình thường (không bôi đen)
      if (safeStart > lastIndex) {
        elements.push(<span key={`t-${i}`}>{originalText.slice(lastIndex, safeStart)}</span>);
      }
      
      // Tìm màu của nhãn từ availableLabels (mặc định màu xanh lam nếu không thấy)
      const labelDef = availableLabels.find(l => l.name === hl.label);
      const labelColor = labelDef?.color || '#3b82f6'; 

      // In phần text được bôi đen
      elements.push(
        <span 
          key={`hl-${i}`} 
          title={`Nhãn: ${hl.label} - Click để xóa`}
          onClick={() => window.confirm("Xóa highlight này?") && setAnnotations(annotations.filter((_, idx) => idx !== i))}
          className="px-1 py-0.5 rounded border mx-0.5 font-medium cursor-pointer hover:brightness-125 transition-all"
          style={{
            backgroundColor: `${labelColor}33`, // Thêm '33' để tạo opacity ~20% cho mã Hex
            borderColor: labelColor,
            color: labelColor
          }}
        >
          {originalText.slice(safeStart, hl.end)}
        </span>
      );
      
      // Cập nhật lại lastIndex
      lastIndex = Math.max(lastIndex, hl.end);
    });
    
    // In phần text còn thừa phía sau cùng
    if (lastIndex < originalText.length) {
      elements.push(<span key="t-end">{originalText.slice(lastIndex)}</span>);
    }
    
    return elements;
  };

  return (
    <div className="w-full h-full bg-[#1e293b] rounded-xl p-8 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          Tài liệu: {fileData?.id || 'Đang tải...'}
          {isLoadingText && <Loader2 className="animate-spin text-blue-400 w-5 h-5" />}
        </h2>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setAnnotations(prev => (prev || []).slice(0, -1))}
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
        ref={textContainerRef} 
        onMouseUp={handleMouseUp}
        className="text-lg leading-loose text-slate-300 bg-[#0f172a] p-8 rounded-xl border border-slate-700 cursor-text flex-1 overflow-y-auto shadow-inner whitespace-pre-wrap relative"
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
          renderText()
        )}
      </div>
    </div>
  );
};

export default TextEditor;