// Đường dẫn: src/workers/aiWorker.js
import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;

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

class VideoClassificationPipeline {
  static task = "zero-shot-image-classification";
  static model = "Xenova/clip-vit-base-patch32";
  static instance = null;
  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

class AudioClassificationPipeline {
  static task = "zero-shot-audio-classification";
  static model = "Xenova/clap-htsat-unfused"; // Model chuyên âm thanh
  static instance = null;
  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

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

self.addEventListener("message", async (event) => {
  const { type, payload } = event.data;

  try {
    // 1. NHÁNH ẢNH
    if (type === "detect_image") {
      const detector = await VisionPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });
      self.postMessage({
        status: "log",
        message: `AI đang lùng sục vật thể...`,
      });
      const output = await detector(payload.imageSrc, { threshold: 0.05 });
      self.postMessage({ status: "complete", task: type, result: output });
    }

    // 2. NHÁNH VIDEO
    else if (type === "analyze_video") {
      const classifier = await VideoClassificationPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });

      self.postMessage({
        status: "log",
        message: `AI CLIP đang đoán thể loại Video...`,
      });
      const output = await classifier(
        payload.videoFrame,
        payload.candidateLabels,
      );

      let results = [];
      // 👉 ĐÃ FIX: Xóa điều kiện > 0.05, lấy thẳng Top 1
      if (output && output.length > 0) {
        results.push({ label: output[0].label, score: output[0].score });
      }
      self.postMessage({ status: "complete", task: type, result: results });
    }

    // 3. NHÁNH AUDIO (👉 ĐÂY LÀ CHỖ TUI BÁO HẠI SẾP)
    else if (type === "analyze_audio") {
      const classifier = await AudioClassificationPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });

      self.postMessage({
        status: "log",
        message: `AI CLAP đang lắng nghe âm thanh...`,
      });

      // 👉 ĐÃ FIX CHUẨN: Dùng đúng payload.audioData (mảng Float32Array từ trên ném xuống)
      const output = await classifier(
        payload.audioData,
        payload.candidateLabels,
      );

      let results = [];
      // 👉 ĐÃ FIX: Xóa sạch rào cản điểm số
      if (output && output.length > 0) {
        self.postMessage({
          status: "log",
          message: `Đã chốt đáp án nhãn: ${output[0].label}`,
        });
        results.push({ label: output[0].label, score: output[0].score });
      }
      self.postMessage({ status: "complete", task: type, result: results });
    }

    // 4. NHÁNH TEXT
    else if (type === "analyze_text") {
      const classifier = await TextClassificationPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });
      const { text, candidateLabels } = payload;
      self.postMessage({ status: "log", message: `AI đang mổ xẻ văn bản...` });

      const chunks = text
        .split(/\n+/)
        .filter((p) => p.trim().length > 20)
        .slice(0, 10);
      if (chunks.length === 0)
        return self.postMessage({ status: "complete", task: type, result: [] });

      const outputs = await classifier(chunks, candidateLabels);
      const outputArray = Array.isArray(outputs) ? outputs : [outputs];

      let results = [];
      let searchStartIndex = 0;
      outputArray.forEach((out, index) => {
        const chunk = chunks[index];
        const startIdx = text.indexOf(chunk, searchStartIndex);
        if (startIdx !== -1) {
          results.push({
            start: startIdx,
            end: startIdx + chunk.length,
            text: chunk,
            label: out.labels[0],
            score: out.scores[0],
          });
          searchStartIndex = startIdx + chunk.length;
        }
      });
      self.postMessage({ status: "complete", task: type, result: results });
    }
  } catch (error) {
    self.postMessage({ status: "error", error: error.message });
  }
});
