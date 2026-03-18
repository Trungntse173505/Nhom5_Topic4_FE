// src/workers/aiWorker.js
import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;

// 1. NÃO NHÌN ẢNH (TRÙM CUỐI YOLOS - CHUYÊN TRỊ XE CỘ, ĐÁM ĐÔNG)
class VisionPipeline {
  static task = "object-detection";
  static model = "Xenova/yolos-tiny"; // MÔ HÌNH MỚI NHẤT, NHẠY NHẤT
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

// 3. NÃO ĐỌC HIỂU & PHÂN LOẠI VĂN BẢN
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

      // CÀI NGƯỠNG 5% (0.05) VÀ BẬT MAX RESOLUTION NẾU CÓ THỂ
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

    // --- 3. LỆNH XỬ LÝ TEXT THÔNG MINH ---
    else if (type === "analyze_text") {
      const classifier = await TextClassificationPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });

      const { text, candidateLabels } = payload;
      let paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 20);
      if (paragraphs.length === 0) paragraphs = [text];

      self.postMessage({
        status: "log",
        message: `Bắt đầu đọc ${paragraphs.length} đoạn văn...`,
      });

      let results = [];
      let currentIndex = 0;

      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i];
        const start = text.indexOf(para, currentIndex);
        const end = start + para.length;
        currentIndex = end;

        const output = await classifier(para, candidateLabels);
        const topLabel = output.labels[0];
        const topScore = output.scores[0];

        if (topScore > 0.2) {
          results.push({
            start,
            end,
            text: para,
            label: topLabel,
            score: topScore,
          });
        }
      }

      self.postMessage({ status: "complete", task: type, result: results });
    }
  } catch (error) {
    self.postMessage({ status: "error", error: error.message });
  }
});
