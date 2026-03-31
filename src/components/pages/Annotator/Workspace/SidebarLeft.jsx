import React from 'react';
import { Image as ImageIcon, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// Hàm nhận diện loại file từ filePath
const getFileTypeDisplay = (url) => {
  if (!url) return "Image";
  const urlL = url.toLowerCase();
  if (urlL.includes(".mp4") || urlL.includes(".webm") || urlL.includes(".mov")) return "Video";
  if (urlL.includes(".mp3") || urlL.includes(".wav")) return "Audio";
  if (urlL.includes(".txt")) return "Text";
  return "Image";
};

const SidebarLeft = ({ files = [], currentItemId, onSelectItem }) => {
  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0f172a] flex flex-col h-full overflow-hidden shrink-0">
      
      {/* --- PHẦN HEADER --- */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white">Danh sách File</h2>
        <p className="text-xs text-slate-400 mt-1">Tổng: {files.length} file</p>
      </div>

      {/* --- PHẦN DANH SÁCH FILE --- */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar">
        {files.map((file, index) => {
          // 🔥 ĐÃ SỬA Ở ĐÂY: Lấy đúng key theo data API của bạn trả về
          const id = file.itemID || file.id; 
          const name = file.fileName || file.name;
          const url = file.filePath || file.url;
          const fileAnnotations = file.annotations || [];
          const isFlagged = file.isFlagged;
          
          const isActive = currentItemId === id;
          
          const containerClass = isActive 
            ? 'border-blue-500 bg-[#1e293b]' 
            : 'border-slate-800 hover:border-slate-600';
            
          const iconClass = isActive ? 'text-blue-400' : 'text-slate-500';
          const textClass = isActive ? 'text-white' : 'text-slate-300';

          const fileType = getFileTypeDisplay(url);
          const displayName = `${fileType} ${index + 1}`;
          
          // Đếm số lượng nhãn
          const labelCount = fileAnnotations.length;

          // 🔥 BỔ SUNG: Đếm số nhãn bị sai (isApproved = "False")
          const errorCount = fileAnnotations.filter(
            a => String(a.isApproved).toLowerCase() === "false"
          ).length;

          // Kiểm tra xem đã pass hết chưa
          const isAllChecked = fileAnnotations.length > 0 && fileAnnotations.every(
            a => String(a.isApproved).toLowerCase() === "true"
          );

          return (
            <div 
              key={id}
              onClick={() => onSelectItem?.(id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${containerClass}`}
            >
              <div className="flex items-start justify-between gap-2">
                
                {/* Cột trái: Tên + Số nhãn */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={14} className={`shrink-0 ${iconClass}`} />          
                    <span className={`text-sm font-medium truncate ${textClass}`} title={name}>
                      {displayName}
                    </span>
                  </div>
                  
                  {/* Số lượng nhãn */}
                  <div className="flex items-center gap-2 mt-1.5 pl-5">
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {labelCount} nhãn
                    </span>
                  </div>
                </div>
                
                {/* Cột phải: Icon Trạng thái hiển thị y như Reviewer */}
                <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
                  {/* Nếu file bị cắm cờ báo lỗi */}
                  {isFlagged && (
                    <AlertTriangle size={15} className="text-amber-500 shrink-0" title="File đã báo lỗi (Flagged)" />
                  )}

                  {/* Nếu có lỗi từ Reviewer trả về */}
                  {errorCount > 0 && !isFlagged && (
                    <div className="flex items-center gap-1 text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]" title={`${errorCount} nhãn bị sai`}>
                      <span className="text-[10px] font-bold">{errorCount}</span>
                      <XCircle size={15} />
                    </div>
                  )}

                  {/* Nếu hoàn thành hợp lệ 100% */}
                  {isAllChecked && errorCount === 0 && !isFlagged && (
                    <CheckCircle size={15} className="text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" title="Hợp lệ" />
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>    
    </aside>
  );
};

export default SidebarLeft;