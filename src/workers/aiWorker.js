// Đường dẫn: src/workers/aiWorker.js
import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;

// 1. NÃO NHÌN ẢNH
class VisionPipeline {
  static task = "object-detection";
  static model = "Xenova/yolos-tiny";
  static instance = null;
  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

// 2. NÃO NGHE ÂM THANH
class AudioPipeline {
  static task = "automatic-speech-recognition";
  static model = "Xenova/whisper-tiny";
  static instance = null;
  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

// 3. NÃO ĐỌC HIỂU (TRÙM CUỐI MICROSOFT ĐA NGÔN NGỮ)
class TextClassificationPipeline {
  static task = "zero-shot-classification";
  static model = "Xenova/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7";
  static instance = null;
  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

// LẮNG NGHE LỆNH TỪ TẦNG TRỆT
self.addEventListener("message", async (event) => {
  const { type, payload } = event.data;

  try {
    // --- 1. LỆNH XỬ LÝ ẢNH ---
    if (type === "detect_image") {
      const detector = await VisionPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });

      self.postMessage({
        status: "log",
        message: `AI đang lùng sục vật thể với YOLOS (ngưỡng 5%)...`,
      });
      const output = await detector(payload.imageSrc, { threshold: 0.05 });
      self.postMessage({ status: "complete", task: type, result: output });
    }

    // --- 2. LỆNH XỬ LÝ AUDIO ---
    else if (type === "transcribe_audio") {
      const transcriber = await AudioPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });

      const output = await transcriber(payload.audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
      });
      self.postMessage({ status: "complete", task: type, result: output });
    }

    // --- 3. LỆNH XỬ LÝ TEXT (CHẾ ĐỘ PHÂN LOẠI TOÀN BỘ VĂN BẢN) ---
    else if (type === "analyze_text") {
      const classifier = await TextClassificationPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });

      const { text, candidateLabels } = payload;

      self.postMessage({
        status: "log",
        message: `AI đang đọc lướt để phân tích thể loại của toàn bộ văn bản...`,
      });

      // 👉 CẮT LẤY PHẦN MỞ BÀI ĐỂ ĐỌC (Tránh tràn RAM trình duyệt nếu file quá dài)
      // Thường đọc 2000 ký tự đầu là AI đủ thông minh để biết bài này nói về cái gì rồi
      const textToAnalyze = text.length > 2000 ? text.slice(0, 2000) : text;

      // Thả AI vào đọc đoạn text đó
      const output = await classifier(textToAnalyze, candidateLabels);

      // Lấy cái Thể loại mà AI tự tin cao nhất
      const topLabel = output.labels[0];
      const topScore = output.scores[0];

      let results = [];

      // Nếu AI tự tin > 30% thì chốt đơn bôi đen CẢ BÀI VĂN
      if (topScore > 0.3) {
        results.push({
          start: 0, // Bắt đầu từ ký tự đầu tiên
          end: text.length, // Kéo dài đến hết bài
          text: "Toàn bộ văn bản", // Lưu log text lại
          label: topLabel, // Nhãn thể loại (VD: Thể thao, Hợp đồng...)
          score: topScore, // Độ tự tin
        });
      }

      self.postMessage({ status: "complete", task: type, result: results });
    }
  } catch (error) {
    self.postMessage({ status: "error", error: error.message });
  }
});
