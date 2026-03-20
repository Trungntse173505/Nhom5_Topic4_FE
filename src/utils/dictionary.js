// Đường dẫn: src/utils/dictionary.js

// TỪ ĐIỂN TỔNG HỢP CHO HỆ THỐNG GÁN NHÃN (AI DICTIONARY)
// Bao gồm: Object Detection (COCO), Audio Genres, Video Genres, Text Topics & Sentiments

export const AI_DICTIONARY = {
  // ==========================================
  // 1. NHẬN DIỆN VẬT THỂ (ẢNH / VIDEO - COCO 80 CLASSES)
  // ==========================================
  // Giao thông
  car: "Ô tô",
  bus: "Xe buýt",
  truck: "Xe tải",
  motorcycle: "Xe máy",
  bicycle: "Xe đạp",
  airplane: "Máy bay",
  train: "Tàu hỏa",
  boat: "Thuyền",

  // Con người & Động vật
  person: "Người",
  cat: "Mèo",
  dog: "Chó",
  horse: "Ngựa",
  cow: "Bò",
  sheep: "Cừu",
  bird: "Chim",

  // Đồ vật ngoài đường / Công cộng
  "traffic light": "Đèn giao thông",
  "fire hydrant": "Trụ cứu hỏa",
  "stop sign": "Biển báo dừng",
  "parking meter": "Đồng hồ đỗ xe",
  bench: "Ghế đá",

  // Đồ dùng cá nhân & Trong nhà
  backpack: "Balo",
  umbrella: "Cái ô",
  handbag: "Túi xách",
  tie: "Cà vạt",
  suitcase: "Vali",
  bottle: "Cái chai",
  cup: "Cái cốc",
  chair: "Cái ghế",
  couch: "Sofa",
  bed: "Giường",
  laptop: "Laptop",
  "cell phone": "Điện thoại di động",
  book: "Quyển sách",
  clock: "Đồng hồ",

  // ==========================================
  // 2. PHÂN LOẠI ÂM THANH / ÂM NHẠC (AUDIO GENRES)
  // ==========================================
  "pop music": "Nhạc Pop",
  "rock music": "Nhạc Rock",
  "hip hop": "Hip Hop",
  jazz: "Nhạc Jazz",
  "classical music": "Nhạc Cổ điển",
  "electronic music": "Nhạc Điện tử (EDM)",
  "country music": "Nhạc Đồng quê",
  "r&b": "Nhạc R&B",
  "folk music": "Nhạc Dân ca",
  blues: "Nhạc Blues",
  "heavy metal": "Nhạc Heavy Metal",
  podcast: "Podcast / Trò chuyện",
  interview: "Phỏng vấn",
  speech: "Bài phát biểu / Diễn văn",

  // ==========================================
  // 3. PHÂN LOẠI VIDEO / PHIM ẢNH (VIDEO GENRES)
  // ==========================================
  action: "Hành động",
  comedy: "Hài hước",
  drama: "Chính kịch",
  horror: "Kinh dị",
  "science fiction": "Khoa học viễn tưởng",
  documentary: "Tài liệu",
  animation: "Hoạt hình",
  thriller: "Giật gân",
  romance: "Lãng mạn",
  vlog: "Vlog cá nhân",
  gaming: "Trò chơi điện tử (Gaming)",
  "news broadcast": "Bản tin Thời sự",
  "sports event": "Sự kiện Thể thao",
  "music video": "Video Âm nhạc (MV)",

  // ==========================================
  // 4. PHÂN LOẠI VĂN BẢN (TEXT TOPICS / INTENTS)
  // ==========================================
  // Chủ đề chính
  politics: "Chính trị",
  economy: "Kinh tế & Tài chính",
  technology: "Công nghệ",
  health: "Y tế & Sức khỏe",
  sports: "Thể thao",
  entertainment: "Giải trí",
  education: "Giáo dục",
  science: "Khoa học",
  literature: "Văn học",
  "legal document": "Pháp lý & Hợp đồng",
  travel: "Du lịch",
  food: "Ẩm thực",
  fashion: "Thời trang",
  history: "Lịch sử",
  religion: "Tôn giáo",

  // Phân loại Cảm xúc / Mục đích (Dùng để gán nhãn bình luận, review)
  positive: "Tích cực",
  negative: "Tiêu cực",
  neutral: "Trung lập",
  spam: "Thư rác (Spam)",
  feedback: "Phản hồi / Đánh giá",
  question: "Câu hỏi / Thắc mắc",
};

// Làm thêm một bộ dịch ngược (Việt -> Anh) để xài cho các logic nội bộ nếu cần
export const VI_TO_EN_DICT = Object.entries(AI_DICTIONARY).reduce(
  (acc, [en, vi]) => {
    // Biến "Kinh tế & Tài chính" thành "kinh te & tai chinh" để map dễ hơn
    const cleanVi = vi
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    acc[cleanVi] = en;
    return acc;
  },
  {},
);
