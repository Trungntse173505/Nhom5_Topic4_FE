import { useState, useEffect, useMemo } from "react";
import {
  getLibraryLabels,
  addLabelToLibrary,
  updateLabelInLibrary,
  deleteLabelFromLibrary,
} from "../../api/managerApi";

// 📚 Danh sách nhãn chuẩn để auto-import
const STANDARD_LABELS = {
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

export const useLabelLibrary = () => {
  const [labels, setLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchLabels = async () => {
    setIsLoading(true);
    try {
      const data = await getLibraryLabels();
      setLabels(Array.isArray(data) ? data : data.data || []);
      // 🔄 Sau khi fetch xong, tự động check xem có thiếu label nào không
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error("Lỗi lấy kho nhãn:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 Auto-import labels nếu database còn thiếu
  const autoImportLabels = async (currentLabels) => {
    try {
      // Lấy tất cả labelName hiện có (chuyển về lowercase để so sánh)
      const existingLabelNames = currentLabels.map((label) =>
        label.labelName.toLowerCase(),
      );

      let addedCount = 0;

      // Duyệt qua danh sách chuẩn
      for (const [category, labelList] of Object.entries(STANDARD_LABELS)) {
        for (const labelName of labelList) {
          // Bỏ qua nếu đã tồn tại
          if (existingLabelNames.includes(labelName.toLowerCase())) {
            continue;
          }

          // Tạo màu ngẫu nhiên
          const randomColor =
            "#" +
            Math.floor(Math.random() * 16777215)
              .toString(16)
              .padStart(6, "0");

          try {
            await addLabelToLibrary({
              labelName: labelName,
              category: category,
              defaultColor: randomColor,
            });
            addedCount++;
          } catch (error) {
            console.error(`Lỗi thêm label ${labelName}:`, error);
          }
        }
      }

      // Cập nhật lại danh sách sau khi import
      if (addedCount > 0) {
        console.log(
          `✅ Auto-import hoàn tất: ${addedCount} nhãn được thêm vào`,
        );
        await fetchLabels();
      }
    } catch (error) {
      console.error("Lỗi auto-import labels:", error);
    }
  };

  useEffect(() => {
    const initLabels = async () => {
      const currentLabels = await fetchLabels();
      // Sau khi tải xong, kiểm tra và auto-import những cái còn thiếu
      await autoImportLabels(currentLabels);
    };

    initLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nhóm nhãn theo Category để UI dễ render
  const groupedLabels = useMemo(() => {
    return labels.reduce((acc, label) => {
      const cat = label.category || "Chưa phân loại";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(label);
      return acc;
    }, {});
  }, [labels]);

  const addLabel = async (labelData) => {
    try {
      setIsProcessing(true);
      await addLabelToLibrary(labelData);
      await fetchLabels();
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateLabel = async (id, updateData) => {
    try {
      setIsProcessing(true);
      await updateLabelInLibrary(id, updateData);
      await fetchLabels();
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const removeLabel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhãn này khỏi kho chung?"))
      return;
    try {
      setIsProcessing(true);
      await deleteLabelFromLibrary(id);
      await fetchLabels();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    labels,
    groupedLabels, // Trả về cục data đã được nhóm
    isLoading,
    isProcessing,
    addLabel,
    updateLabel,
    removeLabel,
    refresh: fetchLabels,
  };
};
