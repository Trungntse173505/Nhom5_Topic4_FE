// src/workers/aiWorker.js
import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;

// 1. NÃO NHÌN ẢNH
class VisionPipeline {
  static task = "object-detection";
  static model = "Xenova/detr-resnet-50";
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

// 3. NÃO ĐỌC HIỂU & PHÂN LOẠI VĂN BẢN (Zero-Shot Classification)
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
    // --- LỆNH XỬ LÝ ẢNH ---
    if (type === "detect_image") {
      const detector = await VisionPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });
      const output = await detector(payload.imageSrc);
      self.postMessage({ status: "complete", task: type, result: output });
    }

    // --- LỆNH XỬ LÝ AUDIO ---
    if (type === "transcribe_audio") {
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

    // --- LỆNH XỬ LÝ TEXT THÔNG MINH ---
    if (type === "analyze_text") {
      const classifier = await TextClassificationPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });

      const { text, candidateLabels } = payload;

      // Cắt đoạn văn an toàn (Lọc đoạn nào trên 20 ký tự để AI khỏi nhầm lẫn)
      let paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 20);
      if (paragraphs.length === 0) paragraphs = [text]; // Nếu text không có dấu xuống dòng thì lấy hết

      // Báo cáo số lượng đoạn cần đọc
      self.postMessage({
        status: "log",
        message: `Bắt đầu đọc và chấm điểm ${paragraphs.length} đoạn văn...`,
      });

      let results = [];
      let currentIndex = 0;

      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i];
        const start = text.indexOf(para, currentIndex);
        const end = start + para.length;
        currentIndex = end; // Cập nhật con trỏ

        self.postMessage({
          status: "log",
          message: `Đang suy nghĩ đoạn ${i + 1}/${paragraphs.length}...`,
        });

        const output = await classifier(para, candidateLabels);

        const topLabel = output.labels[0];
        const topScore = output.scores[0];

        self.postMessage({
          status: "log",
          message: `👉 Đoạn ${i + 1} chốt nhãn [${topLabel}] - Tự tin: ${Math.round(topScore * 100)}%`,
        });

        // ĐÃ HẠ NGƯỠNG TỰ TIN XUỐNG 0.2 (20%) ĐỂ TRẢ KẾT QUẢ RỘNG HƠN
        if (topScore > 0.2) {
          results.push({
            start: start,
            end: end,
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
