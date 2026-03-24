// Đường dẫn: src/pages/Admin/LabelLibrary/LabelLibrary.jsx (hoặc đường dẫn tương ứng của sếp)
import React, { useState } from "react";
import { useLabelLibrary } from "../../../hooks/Manager/useLabelLibrary";
import { AuroraBackground } from "../../common/aurora-background";

// 👉 IMPORT ĐỒ NGHỀ THÔNG DỊCH VÀ MẶT NẠ
import { normalizeText, getLabelDisplay } from "../../../utils/aiHelper";
import { VI_TO_EN_DICT } from "../../../utils/dictionary";

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

  const [collapsedCategories, setCollapsedCategories] = useState({});

  // 👉 BỨC TƯỜNG LỬA 1: Lọc bỏ rác "PROJECT_CUSTOM" khỏi danh sách Category
  const filteredCategories = Object.keys(groupedLabels).filter(
    (cat) => cat.toUpperCase() !== "PROJECT_CUSTOM",
  );

  const handleAdd = async () => {
    if (!newLabel.labelName || !newLabel.category) {
      return alert("Vui lòng nhập Tên nhãn và Chủ đề (Category)!");
    }

    const cleanInput = normalizeText(newLabel.labelName);
    const mappedName = VI_TO_EN_DICT[cleanInput] || newLabel.labelName;

    const payload = { ...newLabel, labelName: mappedName };

    const success = await addLabel(payload);
    if (success) {
      setNewLabel({ ...newLabel, labelName: "", defaultColor: "#3B82F6" });
      if (collapsedCategories[newLabel.category]) {
        setCollapsedCategories((prev) => ({
          ...prev,
          [newLabel.category]: false,
        }));
      }
    }
  };

  // ==========================================
  // 👉 NÚT BẤM MA THUẬT V3: AUTO-IMPORT THÔNG MINH (CHỐNG TRÙNG LẶP)
  // ==========================================
  const handleAutoImportALL = async () => {
    if (
      !window.confirm(
        "Bắt đầu quét và nạp các nhãn CÒN THIẾU từ Từ điển vào kho?",
      )
    )
      return;

    // 1. LẤY DANH SÁCH CÁC NHÃN ĐÃ TỒN TẠI TRONG KHO (Để làm bộ lọc)
    // Gom tất cả labelName hiện có thành một mảng chữ thường để dễ so sánh
    const existingLabelNames = Object.values(groupedLabels)
      .flat()
      .map((label) => label.labelName.toLowerCase());

    // 2. TỪ ĐIỂN CHUẨN CỦA ANH EM MÌNH
    const fullCategories = {
      "Vật thể (Ảnh/Video)": [
        "car",
        "bus",
        "truck",
        "motorcycle",
        "bicycle",
        "airplane",
        "train",
        "boat",
        "person",
        "cat",
        "dog",
        "horse",
        "cow",
        "sheep",
        "bird",
        "traffic light",
        "fire hydrant",
        "stop sign",
        "parking meter",
        "bench",
        "backpack",
        "umbrella",
        "handbag",
        "tie",
        "suitcase",
        "bottle",
        "cup",
        "chair",
        "couch",
        "bed",
        "laptop",
        "cell phone",
        "book",
        "clock",
      ],
      "Thể loại Âm thanh": [
        "pop music",
        "rock music",
        "hip hop",
        "jazz",
        "classical music",
        "electronic music",
        "country music",
        "r&b",
        "folk music",
        "blues",
        "heavy metal",
        "podcast",
        "interview",
        "speech",
      ],
      "Thể loại Video": [
        "action",
        "comedy",
        "drama",
        "horror",
        "science fiction",
        "documentary",
        "animation",
        "thriller",
        "romance",
        "vlog",
        "gaming",
        "news broadcast",
        "sports event",
        "music video",
      ],
      "Chủ đề Văn bản": [
        "politics",
        "economy",
        "technology",
        "health",
        "sports",
        "entertainment",
        "education",
        "science",
        "literature",
        "legal document",
        "travel",
        "food",
        "fashion",
        "history",
        "religion",
      ],
      "Phân tích Cảm xúc": [
        "positive",
        "negative",
        "neutral",
        "spam",
        "feedback",
        "question",
      ],
    };

    let addedCount = 0;
    let skippedCount = 0;

    // 3. VÒNG LẶP QUÉT VÀ THÊM MỚI
    for (const [category, labels] of Object.entries(fullCategories)) {
      for (const labelKey of labels) {
        // 👉 BỨC TƯỜNG CHỐNG TRÙNG LẶP (DUPLICATE)
        if (existingLabelNames.includes(labelKey.toLowerCase())) {
          skippedCount++;
          continue; // Nếu đã có trong kho rồi thì bỏ qua, nhảy sang từ tiếp theo
        }

        // Tạo màu ngẫu nhiên cho đẹp mắt
        const randomColor =
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0");

        await addLabel({
          labelName: labelKey,
          category: category,
          defaultColor: randomColor,
        });

        addedCount++;
      }
    }

    // 4. BÁO CÁO KẾT QUẢ CHO SẾP
    alert(
      `🎉 BÁO CÁO AUTO-IMPORT:\n- Thêm mới thành công: ${addedCount} nhãn.\n- Đã bỏ qua (do trùng): ${skippedCount} nhãn.\n\nSếp F5 lại trang để cập nhật giao diện nhé!`,
    );
  };

  const startEdit = (label) => {
    const targetId = label.labelID || label.id;
    setEditingId(targetId);
    setEditForm({
      labelName: getLabelDisplay(label.labelName),
      defaultColor: label.defaultColor,
    });
  };

  const saveEdit = async () => {
    if (!editForm.labelName) return alert("Tên nhãn không được để trống!");

    const cleanInput = normalizeText(editForm.labelName);
    const mappedName = VI_TO_EN_DICT[cleanInput] || editForm.labelName;

    const payload = { ...editForm, labelName: mappedName };

    const success = await updateLabel(editingId, payload);
    if (success) setEditingId(null);
  };

  const toggleCategory = (category) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <AuroraBackground className="font-sans relative">
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
          <div className="lg:col-span-1 rounded-xl border border-white/5 bg-[#151D2F]/90 backdrop-blur-sm p-6 shadow-sm h-fit">
            <h2 className="text-lg font-semibold text-white mb-6">
              Thêm nhãn mới
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Phân loại
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
                  {/* 👉 Đưa list đã lọc sạch rác vào Gợi ý */}
                  {filteredCategories.map((cat, idx) => (
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
                  placeholder="VD: Ô tô, Xe máy..."
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

              {/* 👉 NÚT AUTO-IMPORT FULL */}
              <button
                onClick={handleAutoImportALL}
                disabled={isProcessing}
                className="w-full mt-2 border border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white py-2 rounded-lg font-medium transition-colors text-sm"
              >
                ⚡ Auto-Import TẤT CẢ Nhãn
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#151D2F]/90 backdrop-blur-sm p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-6">
              Thư viện nhãn dán
            </h2>

            {isLoading ? (
              <div className="text-center py-20 text-gray-500 animate-pulse">
                Đang tải kho nhãn...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">
                Kho nhãn đang trống. Hãy tạo nhãn đầu tiên!
              </div>
            ) : (
              <div className="space-y-4">
                {/* 👉 Render ra màn hình chỉ những Category đã được lọc sạch */}
                {filteredCategories.map((category, idx) => {
                  const isCollapsed = collapsedCategories[category];

                  return (
                    <div
                      key={idx}
                      className="bg-[#0B1120]/80 backdrop-blur border border-white/5 rounded-xl p-4 transition-all duration-300"
                    >
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

                      {!isCollapsed && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
                          {groupedLabels[category].map((label) => {
                            const targetId = label.labelID || label.id;

                            return editingId === targetId ? (
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
                                  <span
                                    className="text-sm text-gray-200 truncate"
                                    title={label.labelName}
                                  >
                                    {getLabelDisplay(label.labelName)}
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
