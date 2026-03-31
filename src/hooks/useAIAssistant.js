import { useState, useEffect, useRef, useCallback } from "react";
import { VI_TO_EN_DICT } from "../../src/utils/dictionary";

// Hàm dịch ngầm Tiếng Việt -> Tiếng Anh
const translateToEnglish = (viLabel) => {
  const cleanVi = viLabel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  return VI_TO_EN_DICT[cleanVi] || viLabel.toLowerCase().trim();
};

// Hàm tính IoU (Intersection over Union) và IoM (Intersection over Minimum) để NMS chống trùng lặp
const isBoxOverlapping = (b1, b2) => {
  // Hỗ trợ cả 2 định dạng: {x, y} và {left, top}
  const boxA = {
    x: b1.x !== undefined ? b1.x : b1.left,
    y: b1.y !== undefined ? b1.y : b1.top,
    width: b1.width,
    height: b1.height,
  };
  const boxB = {
    x: b2.x !== undefined ? b2.x : b2.left,
    y: b2.y !== undefined ? b2.y : b2.top,
    width: b2.width,
    height: b2.height,
  };

  // Nếu không đủ data toạ độ thì không tính
  if (boxA.x === undefined || boxB.x === undefined) return false;

  const xA = Math.max(boxA.x, boxB.x);
  const yA = Math.max(boxA.y, boxB.y);
  const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const boxAArea = boxA.width * boxA.height;
  const boxBArea = boxB.width * boxB.height;
  
  // NMS Thresholds
  const unionArea = boxAArea + boxBArea - interArea;
  if (unionArea === 0) return false;

  const iou = interArea / unionArea; // Mức độ đè lên nhau chung
  const iomin = interArea / Math.min(boxAArea, boxBArea); // Box nhỏ nằm lọt lòng trong box to

  // Nếu độ đè > 45% (chuẩn NMS) HOẶC box nhỏ chui tọt vào > 85% diện tích box to
  return iou > 0.45 || iomin > 0.85;
};

export const useAIAssistant = ({
  fileData,
  actualType,
  uniqueLabels,
  annotations,
  setAnnotations,
  setSelectedLabel,
}) => {
  const workerRef = useRef(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);

  // Dùng Ref để lưu state mới nhất, tránh bị re-render Worker liên tục
  const annotationsRef = useRef(annotations);
  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  const fileDataRef = useRef(fileData);
  useEffect(() => {
    fileDataRef.current = fileData;
  }, [fileData]);

  // Khởi tạo Worker và lắng nghe kết quả AI trả về
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../src/workers/aiWorker.js", import.meta.url),
      { type: "module" }
    );

    workerRef.current.onmessage = (event) => {
      const { status, data, result, task, message, error } = event.data;

      if (status === "progress") {
        if (data && data.total)
          setAiProgress(`${Math.round((data.loaded / data.total) * 100)}%`);
        else if (data && data.loaded)
          setAiProgress(`${(data.loaded / 1024 / 1024).toFixed(1)} MB`);
      } else if (status === "log") {
        console.log("🤖 AI Báo Cáo:", message);
      } else if (status === "error") {
        console.error("Lỗi AI:", error);
        setIsAILoading(false);
      } else if (status === "complete") {
        console.log(`AI [${task}] XONG:`, result);
        const currentAnnos = annotationsRef.current || [];

        // XỬ LÝ VIDEO & AUDIO
        if (task === "analyze_video" || task === "analyze_audio") {
          if (result && result.length > 0) {
            const aiEngLabel = result[0].label;

            const matched = uniqueLabels.find(
              (l) =>
                translateToEnglish(l.name) === aiEngLabel ||
                l.name.toLowerCase() === aiEngLabel.toLowerCase()
            );

            if (matched) {
              setSelectedLabel(matched.name);
              setAnnotations([
                {
                  id: `ai_${task}_${Date.now()}`,
                  label: matched.name,
                  labelId: matched.id,
                  isAiGenerated: true,
                  text: task === "analyze_video" ? "Phân loại Video" : "Phân loại Âm thanh",
                },
              ]);
            } else {
              alert(`🤖 AI phân tích được là '${aiEngLabel}' nhưng không có trong Bộ Nhãn của sếp!`);
            }
          } else {
            alert("🤖 AI: Không chắc chắn nội dung này thuộc thể loại nào!");
          }
          setIsAILoading(false);
          return;
        }

        // XỬ LÝ ẢNH
        if (task === "detect_image") {
          if (!result || result.length === 0) {
            alert("🤖 AI: Không tìm thấy vật thể nào!");
            setIsAILoading(false);
            return;
          }
          const currentFile = fileDataRef.current;
          const img = new window.Image();
          img.src = currentFile.url;
          img.onload = () => {
            const scaleX = 800 / (img.naturalWidth || 800);
            const scaleY = 600 / (img.naturalHeight || 600);
            let newAnnos = [];
            
            result.forEach((item, index) => {
              const matched = uniqueLabels.find(
                (l) =>
                  translateToEnglish(l.name) === item.label.toLowerCase() ||
                  l.name.toLowerCase() === item.label.toLowerCase()
              );
              
              if (matched) {
                const newBox = {
                  id: `ai_${Date.now()}_${index}`,
                  labelId: matched.id,
                  label: matched.name,
                  x: item.box.xmin * scaleX,
                  y: item.box.ymin * scaleY,
                  width: (item.box.xmax - item.box.xmin) * scaleX,
                  height: (item.box.ymax - item.box.ymin) * scaleY,
                  isAiGenerated: true,
                };

                // KIỂM TRA TRÙNG LẶP (Chống vẽ đè theo giải thuật NMS)
                const isDuplicate = [...currentAnnos, ...newAnnos].some(existingBox => {
                  if (existingBox.labelId !== newBox.labelId) return false;
                  return isBoxOverlapping(existingBox, newBox);
                });

                if (!isDuplicate) {
                  newAnnos.push(newBox);
                } else {
                  console.log(`Bỏ qua box trùng: ${newBox.label}`);
                }
              }
            });
            setAnnotations([...currentAnnos, ...newAnnos]);
            setIsAILoading(false);
          };
          return;
        }

        // XỬ LÝ TEXT
        else if (task === "analyze_text") {
          const newTextAnnos = result.map((item) => {
            const matched =
              uniqueLabels.find(
                (l) =>
                  translateToEnglish(l.name) === item.label.toLowerCase() ||
                  l.name.toLowerCase() === item.label.toLowerCase()
              ) || uniqueLabels[0];
            return {
              ...item,
              label: matched?.name,
              labelId: matched?.id,
              isAiGenerated: true,
            };
          });
          setAnnotations([...currentAnnos, ...newTextAnnos].sort((a, b) => a.start - b.start));
        }
        setIsAILoading(false);
      }
    };
    return () => workerRef.current?.terminate();
  }, [uniqueLabels, setAnnotations, setSelectedLabel]);

  // Hàm bắn file cho AI xử lý
  const handleRunAI = useCallback(async () => {
    if (!fileData?.url) return alert("Không tìm thấy đường dẫn file!");
    if (!uniqueLabels || uniqueLabels.length === 0) return alert("Sếp phải tạo Bộ Nhãn trước!");

    setIsAILoading(true);
    setAiProgress(0);

    const translatedLabels = uniqueLabels.map((l) => translateToEnglish(l.name));

    try {
      if (actualType === "image") {
        workerRef.current.postMessage({
          type: "detect_image",
          payload: { imageSrc: fileData.url },
        });
      } else if (actualType === "video") {
        const tempVideo = document.createElement("video");
        tempVideo.crossOrigin = "anonymous";
        tempVideo.src = fileData.url;
        tempVideo.onloadeddata = () => { tempVideo.currentTime = 1; };
        tempVideo.onseeked = () => {
          const canvas = document.createElement("canvas");
          canvas.width = tempVideo.videoWidth;
          canvas.height = tempVideo.videoHeight;
          canvas.getContext("2d").drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          workerRef.current.postMessage({
            type: "analyze_video",
            payload: {
              videoFrame: canvas.toDataURL("image/jpeg"),
              candidateLabels: translatedLabels,
            },
          });
        };
        tempVideo.onerror = () => {
          setIsAILoading(false);
          alert("Lỗi đọc Video!");
        };
      } else if (actualType === "audio") {
        try {
          const response = await fetch(fileData.url);
          const arrayBuffer = await response.arrayBuffer();
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const audioCtx = new AudioContext({ sampleRate: 48000 });
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const audioData = audioBuffer.getChannelData(0);

          workerRef.current.postMessage({
            type: "analyze_audio",
            payload: {
              audioData: audioData,
              candidateLabels: translatedLabels,
            },
          });
        } catch (err) {
          console.error(err);
          alert("Lỗi đọc dữ liệu âm thanh!");
          setIsAILoading(false);
        }
      } else if (actualType === "text") {
        const textContent = await fetch(fileData.url).then((r) => r.text());
        workerRef.current.postMessage({
          type: "analyze_text",
          payload: {
            text: textContent,
            candidateLabels: uniqueLabels.map((l) => l.name),
          },
        });
      }
    } catch (error) {
      console.error(error);
      setIsAILoading(false);
    }
  }, [actualType, fileData, uniqueLabels]);

  return {
    isAILoading,
    aiProgress,
    handleRunAI,
  };
};