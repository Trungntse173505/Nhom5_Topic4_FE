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

// 3. NÃO ĐỌC HIỂU (Trùm cuối Đa Ngôn Ngữ)
class TextClassificationPipeline {
  static task = "zero-shot-classification";
  // 👉 Nâng cấp lên con siêu xe đọc Tiếng Việt cực đỉnh
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
    if (type === "detect_image") {
      const detector = await VisionPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });

      self.postMessage({
        status: "log",
        message: `AI đang lùng sục vật thể với YOLOS...`,
      });
      const output = await detector(payload.imageSrc, { threshold: 0.05 });
      self.postMessage({ status: "complete", task: type, result: output });
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
    }

    // --- 3. LỆNH XỬ LÝ TEXT (CHẾ ĐỘ TỰ KHOANH TỪNG ĐOẠN) ---
    else if (type === "analyze_text") {
      const classifier = await TextClassificationPipeline.getInstance((x) => {
        self.postMessage({ status: "progress", task: type, data: x });
      });

      const { text, candidateLabels } = payload;
      self.postMessage({
        status: "log",
        message: `AI đang mổ xẻ và khoanh vùng từng đoạn...`,
      });

      // 👉 BƯỚC 1: Cắt bài văn thành từng đoạn (paragraph) để khoanh
      // Bỏ qua các đoạn quá ngắn (dưới 20 ký tự), lấy tối đa 10 đoạn đầu để không treo RAM
      const chunks = text
        .split(/\n+/)
        .filter((p) => p.trim().length > 20)
        .slice(0, 10);

      if (chunks.length === 0) {
        self.postMessage({ status: "complete", task: type, result: [] });
        return;
      }

      // 👉 BƯỚC 2: Cho AI đọc một lúc tất cả các đoạn (Xử lý song song cực lẹ)
      const outputs = await classifier(chunks, candidateLabels);

      // Tránh lỗi API trả về Object thay vì Array khi bài văn chỉ có 1 đoạn duy nhất
      const outputArray = Array.isArray(outputs) ? outputs : [outputs];

      let results = [];
      let searchStartIndex = 0;

      // 👉 BƯỚC 3: Dò tìm lại vị trí để khoanh khung và bôi màu
      outputArray.forEach((out, index) => {
        const chunk = chunks[index];
        const topLabel = out.labels[0]; // Lấy nhãn có điểm cao nhất
        const topScore = out.scores[0];

        // Tui bỏ luôn điều kiện kiểm tra Score. Sai cũng khoanh, cho sếp tự do chỉnh sửa!
        const startIdx = text.indexOf(chunk, searchStartIndex);
        if (startIdx !== -1) {
          results.push({
            start: startIdx, // Tọa độ bắt đầu
            end: startIdx + chunk.length, // Tọa độ kết thúc
            text: chunk,
            label: topLabel,
            score: topScore,
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
