// Đường dẫn: src/pages/Annotator/Workspace/SidebarRight.jsx
import React from "react";
import { Tag } from "lucide-react";

// 👉 IMPORT HÀM MẶT NẠ TIẾNG VIỆT
import { getLabelDisplay } from "../../../../utils/aiHelper";

const SidebarRight = ({
  availableLabels = [],
  selectedLabel,
  setSelectedLabel,
  actualType,
  annotations = [],
  setAnnotations,
}) => {
  // Sếp muốn Text nó cũng là Phân loại (Chọn 1 nhãn bự) thì thêm 'text' vào đây
  const isClassification =
    actualType === "video" || actualType === "audio" || actualType === "text";

  let sidebarTitle = "Bộ Nhãn";
  if (isClassification) {
    sidebarTitle = `Phân loại ${actualType === "video" ? "Video" : actualType === "text" ? "Văn bản" : "Audio"}`;
  }

  return (
    <aside className="w-64 border-l border-slate-800 bg-[#0f172a] p-4 flex flex-col shrink-0 text-left h-full shadow-2xl relative z-10">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <Tag
          size={16}
          className={isClassification ? "text-blue-400" : "text-green-400"}
        />
        {sidebarTitle}
      </h3>

      <div
        className={`flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col ${isClassification ? "gap-3" : "gap-2"}`}
      >
        {/* 👉 NẠP INDEX VÀO ĐÂY ĐỂ TRÁNH LỖI KEY CỦA REACT */}
        {availableLabels.map(({ name, color }, index) => {
          // Kiểm tra nhãn đang chọn (Logic xử lý vẫn dùng tiếng Anh gốc - name)
          const isSelected = isClassification
            ? annotations[0]?.label === name
            : selectedLabel === name;

          // DÀNH CHO NÚT BẤM TO (CHẾ ĐỘ PHÂN LOẠI VIDEO/AUDIO/TEXT)
          if (isClassification) {
            return (
              <button
                // 👉 DÙNG CẢ TÊN VÀ INDEX ĐỂ CHẮC CHẮN KHÔNG TRÙNG LẶP KEY
                key={`${name}-${index}`}
                onClick={() => {
                  setAnnotations([
                    {
                      id: `${actualType}-label-${Date.now()}`,
                      x: 0,
                      y: 0,
                      width: 0,
                      height: 0,
                      label: name,
                    },
                  ]);
                  setSelectedLabel(name);
                }}
                className={`py-3.5 px-4 rounded-xl font-bold text-sm transition-all border-2 text-left flex justify-between items-center group ${
                  isSelected
                    ? "text-white shadow-lg"
                    : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 bg-[#1e293b]"
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: color,
                        borderColor: color,
                        boxShadow: `0 4px 15px ${color}40`,
                      }
                    : {}
                }
              >
                {/* 👉 ĐEO MẶT NẠ TIẾNG VIỆT TẠI ĐÂY */}
                <span className="truncate" title={name}>
                  {getLabelDisplay(name)}
                </span>

                {isSelected && (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0">
                    Đã chọn
                  </span>
                )}
              </button>
            );
          }

          // DÀNH CHO NÚT BẤM NHỎ (CHẾ ĐỘ VẼ KHUNG ẢNH)
          return (
            <button
              // 👉 DÙNG CẢ TÊN VÀ INDEX ĐỂ CHẮC CHẮN KHÔNG TRÙNG LẶP KEY
              key={`${name}-${index}`}
              onClick={() => setSelectedLabel(name)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all text-left group ${
                isSelected
                  ? "bg-[#1e293b] text-white shadow-lg"
                  : "border-transparent text-slate-400 hover:bg-slate-800/50"
              }`}
              style={{ borderColor: isSelected ? color : "transparent" }}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: color,
                  boxShadow: isSelected ? `0 0 12px ${color}99` : "none",
                }}
              ></span>

              {/* 👉 ĐEO MẶT NẠ TIẾNG VIỆT TẠI ĐÂY NỮA */}
              <span
                className="truncate group-hover:text-slate-200 transition-colors"
                title={name}
              >
                {getLabelDisplay(name)}
              </span>
            </button>
          );
        })}

        {/* Thông báo khi không có nhãn */}
        {availableLabels.length === 0 && (
          <p className="text-xs text-slate-500 italic font-normal text-center py-4">
            {isClassification ? "Chưa có nhãn." : "Chưa cấu hình nhãn."}
          </p>
        )}
      </div>
    </aside>
  );
};

export default SidebarRight;
