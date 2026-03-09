import React, { useState } from "react";
import { useLabelLibrary } from "../../../hooks/useLabelLibrary";
// 1. IMPORT NỀN CỰC QUANG VÀO ĐÂY
import { AuroraBackground } from "../../common/aurora-background";

export default function LabelLibrary() {
  const {
    groupedLabels,
    isLoading,
    isProcessing,
    addLabel,
    updateLabel,
    removeLabel,
  } = useLabelLibrary();

  const [newLabel, setNewLabel] = useState({
    labelName: "",
    defaultColor: "#3B82F6",
    category: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ labelName: "", defaultColor: "" });

  // STATE: Quản lý việc gập/mở (Collapse) các danh mục (Accordion giống Swagger)
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // Lấy ra danh sách các Category có sẵn để đưa vào gợi ý
  const existingCategories = Object.keys(groupedLabels);

  const handleAdd = async () => {
    if (!newLabel.labelName || !newLabel.category) {
      return alert("Vui lòng nhập Tên nhãn và Chủ đề (Category)!");
    }
    const success = await addLabel(newLabel);
    if (success) {
      // Chỉ reset tên, giữ lại màu và category để tạo tiếp cho lẹ
      setNewLabel({ ...newLabel, labelName: "", defaultColor: "#3B82F6" });

      // Nếu thêm vào một danh mục đang bị gập, thì tự động mở danh mục đó ra
      if (collapsedCategories[newLabel.category]) {
        setCollapsedCategories((prev) => ({
          ...prev,
          [newLabel.category]: false,
        }));
      }
    }
  };

  const startEdit = (label) => {
    const targetId = label.labelID || label.id;
    setEditingId(targetId);
    setEditForm({
      labelName: label.labelName,
      defaultColor: label.defaultColor,
    });
  };

  const saveEdit = async () => {
    if (!editForm.labelName) return alert("Tên nhãn không được để trống!");
    const success = await updateLabel(editingId, editForm);
    if (success) setEditingId(null);
  };

  // HÀM TOGGLE: Bật/tắt gập mở category
  const toggleCategory = (category) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category], // Nếu đang true thì thành false và ngược lại
    }));
  };

  return (
    // 2. BỌC AURORABACKGROUND RA NGOÀI CÙNG
    <AuroraBackground className="font-sans relative">
      {/* Thêm relative và z-20 để nội dung nổi lên trên mặt lớp sáng cực quang */}
      <div className="p-6 max-w-7xl mx-auto space-y-6 relative z-20 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Thư viện Nhãn dán Chung
          </h1>
          <p className="text-gray-400 mt-2">
            Quản lý kho nhãn dán mẫu chung. Các nhãn tạo ở đây có thể được sử
            dụng trong mọi Project.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: FORM TẠO NHÃN MỚI */}
          <div className="lg:col-span-1 rounded-xl border border-white/5 bg-[#151D2F]/90 backdrop-blur-sm p-6 shadow-sm h-fit">
            <h2 className="text-lg font-semibold text-white mb-6">
              Thêm nhãn mới
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Chủ đề (Category)
                </label>
                <input
                  type="text"
                  list="categories"
                  placeholder="VD: Giao thông, Y tế..."
                  value={newLabel.category}
                  onChange={(e) =>
                    setNewLabel({ ...newLabel, category: e.target.value })
                  }
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
                <datalist id="categories">
                  {existingCategories.map((cat, idx) => (
                    <option key={idx} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Tên nhãn
                </label>
                <input
                  type="text"
                  placeholder="VD: Xe ô tô"
                  value={newLabel.labelName}
                  onChange={(e) =>
                    setNewLabel({ ...newLabel, labelName: e.target.value })
                  }
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Màu mặc định
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={newLabel.defaultColor}
                    onChange={(e) =>
                      setNewLabel({ ...newLabel, defaultColor: e.target.value })
                    }
                    className="h-[40px] w-[60px] rounded-lg border border-white/10 bg-[#0B1120] p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newLabel.defaultColor}
                    onChange={(e) =>
                      setNewLabel({ ...newLabel, defaultColor: e.target.value })
                    }
                    className="flex-1 bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500 uppercase"
                  />
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={isProcessing}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:text-gray-400 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
              >
                {isProcessing ? "Đang xử lý..." : "+ Thêm vào kho"}
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: HIỂN THỊ KHO NHÃN THEO CATEGORY */}
          <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#151D2F]/90 backdrop-blur-sm p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-6">
              Thư viện nhãn dán
            </h2>

            {isLoading ? (
              <div className="text-center py-20 text-gray-500 animate-pulse">
                Đang tải kho nhãn...
              </div>
            ) : Object.keys(groupedLabels).length === 0 ? (
              <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">
                Kho nhãn đang trống. Hãy tạo nhãn đầu tiên!
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(groupedLabels).map((category, idx) => {
                  const isCollapsed = collapsedCategories[category];

                  return (
                    <div
                      key={idx}
                      className="bg-[#0B1120]/80 backdrop-blur border border-white/5 rounded-xl p-4 transition-all duration-300"
                    >
                      {/* TIÊU ĐỀ CATEGORY (NÚT BẤM GẬP/MỞ) */}
                      <div
                        onClick={() => toggleCategory(category)}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <h3 className="text-blue-400 font-bold uppercase tracking-wider text-sm group-hover:text-blue-300 transition-colors">
                          {category}{" "}
                          <span className="text-gray-500 font-normal lowercase ml-2">
                            ({groupedLabels[category].length} nhãn)
                          </span>
                        </h3>

                        {/* ICON MŨI TÊN */}
                        <div className="text-gray-500 group-hover:text-gray-300 transition-colors bg-white/5 rounded-full p-1">
                          {isCollapsed ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* DANH SÁCH NHÃN (SẼ BỊ ẨN NẾU isCollapsed LÀ TRUE) */}
                      {!isCollapsed && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
                          {groupedLabels[category].map((label) => {
                            const targetId = label.labelID || label.id;

                            return editingId === targetId ? (
                              /* CHẾ ĐỘ EDIT */
                              <div
                                key={targetId}
                                className="flex flex-col gap-2 p-3 bg-[#151D2F] rounded-lg border border-blue-500/50"
                              >
                                <input
                                  type="text"
                                  value={editForm.labelName}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      labelName: e.target.value,
                                    })
                                  }
                                  className="bg-[#0B1120] border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
                                />
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={editForm.defaultColor}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        defaultColor: e.target.value,
                                      })
                                    }
                                    className="h-[24px] w-[30px] p-0 border-0 bg-transparent cursor-pointer"
                                  />
                                  <button
                                    onClick={saveEdit}
                                    className="flex-1 text-[10px] bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/40"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="flex-1 text-[10px] bg-gray-600/20 text-gray-400 rounded hover:bg-gray-600/40"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* CHẾ ĐỘ HIỂN THỊ MẶC ĐỊNH */
                              <div
                                key={targetId}
                                className="flex items-center justify-between p-3 bg-[#151D2F] rounded-lg border border-white/5 hover:border-white/20 transition-colors group"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        label.defaultColor || "#64748b",
                                    }}
                                  ></div>
                                  <span className="text-sm text-gray-200 truncate">
                                    {label.labelName}
                                  </span>
                                </div>

                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                                  <button
                                    onClick={() => startEdit(label)}
                                    className="p-1 text-gray-400 hover:text-blue-400"
                                  >
                                    ✎
                                  </button>
                                  <button
                                    onClick={() => removeLabel(targetId)}
                                    className="p-1 text-gray-400 hover:text-rose-400"
                                  >
                                    ✖
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
