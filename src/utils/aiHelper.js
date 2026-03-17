// Đường dẫn: src/utils/aiHelper.js

// 1. Khử dấu tiếng Việt
export const normalizeText = (text) => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

// 2. Từ điển Map Nhãn
export const VI_TO_EN_DICT = {
  "trai tim": "heart",
  "ma qr": "qr code",
  "xe may": "motorcycle",
  "xe buyt": "bus",
  "xe tai": "truck",
  "o to": "car",
  nguoi: "person",
  meo: "cat",
  cho: "dog",
};

// 3. Tính độ đè khung (IoU)
export const calculateIoU = (box1, box2) => {
  const xA = Math.max(box1.x, box2.x);
  const yA = Math.max(box1.y, box2.y);
  const xB = Math.min(box1.x + box1.width, box2.x + box2.width);
  const yB = Math.min(box1.y + box1.height, box2.y + box2.height);

  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const box1Area = box1.width * box1.height;
  const box2Area = box2.width * box2.height;
  return interArea / (box1Area + box2Area - interArea);
};

// 4. Lọc khung trùng lặp (NMS)
export const applyNMS = (boxes, iouThreshold = 0.4) => {
  const sortedBoxes = [...boxes].sort((a, b) => b.score - a.score);
  const selectedBoxes = [];

  while (sortedBoxes.length > 0) {
    const currentBox = sortedBoxes.shift();
    selectedBoxes.push(currentBox);

    for (let i = sortedBoxes.length - 1; i >= 0; i--) {
      if (calculateIoU(currentBox, sortedBoxes[i]) > iouThreshold) {
        sortedBoxes.splice(i, 1);
      }
    }
  }
  return selectedBoxes;
};
