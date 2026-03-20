// src/utils/mediaHelper.js

// Hàm băm file Audio thành mảng số (Float32Array) chuẩn 16kHz cho Whisper
export const extractAudioData = async (audioFile) => {
  try {
    // Ép trình duyệt đọc âm thanh ở tần số 16000 Hz (Tần số chuẩn của AI Whisper)
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000,
    });

    // Đọc file gốc
    const arrayBuffer = await audioFile.arrayBuffer();

    // Giải mã âm thanh
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Lấy dữ liệu của kênh âm thanh đầu tiên (Mono)
    const audioData = audioBuffer.getChannelData(0);

    // Thay vì resolve, sếp chỉ cần return nó ra
    return audioData;
  } catch (error) {
    console.error("Lỗi khi băm Audio:", error);
    // Thay vì reject, sếp throw cái error đó ra để bên ngoài bắt được
    throw error;
  }
};
