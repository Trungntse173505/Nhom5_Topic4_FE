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
    if (type === "detect_image") {
      const detector = await VisionPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });
      const output = await detector(payload.imageSrc, { threshold: 0.05 });
      self.postMessage({ status: "complete", task: type, result: output });
    } else if (type === "analyze_video") {
      const classifier = await VideoClassificationPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });

      self.postMessage({
        status: "log",
        message: `AI đang phân tích thể loại video...`,
      });
      const output = await classifier(
        payload.videoFrame,
        payload.candidateLabels,
      );

      let results = [];
      if (output && output.length > 0 && output[0].score > 0.05) {
        results.push({
          label: output[0].label,
          score: output[0].score,
          // 👉 ĐÃ BỎ BOX: Video chỉ cần biết là nhãn gì thôi
        });
      }
      self.postMessage({ status: "complete", task: type, result: results });
    } else if (type === "transcribe_audio") {
      const transcriber = await AudioPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });
      const output = await transcriber(payload.audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
      });
      self.postMessage({ status: "complete", task: type, result: output });
    } else if (type === "analyze_text") {
      const classifier = await TextClassificationPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });
      const { text, candidateLabels } = payload;
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
