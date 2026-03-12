import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTaskDetail } from './useTaskDetail';
import { useItemDetail } from './useItemDetail';
import { useSaveAnnotation } from './useSaveAnnotation';

export const useWorkspace = (taskId) => {
  const { taskItems = [], availableLabels = [], loading: loadingTask } = useTaskDetail(taskId);
  const { getItem, loading: loadingItem } = useItemDetail();
  const { save, isSaving } = useSaveAnnotation();

  const [currentFileId, setCurrentFileId] = useState(null);
  const [selectedTool, setSelectedTool] = useState('Bounding Box');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    if (!currentFileId && taskItems[0]) setCurrentFileId(taskItems[0].itemID);
    if (!selectedLabel && availableLabels[0]) setSelectedLabel(availableLabels[0].name);
  }, [taskItems, availableLabels, currentFileId, selectedLabel]);

  // CẬP NHẬT: Load data động cho cả Bounding Box lẫn Text
  const refreshCurrentItemData = useCallback(async (id) => {
    if (!id) return;
    try {
      const data = await getItem(id);
      setAnnotations((data?.annotations || []).map((ann, idx) => {
        let coords = {};
        try { 
          coords = typeof ann.annotationData === 'string' ? JSON.parse(ann.annotationData) : (ann.annotationData || {}); 
        } catch {}
        
        // Phục hồi dữ liệu linh hoạt dựa vào trường "field" hoặc dữ liệu có sẵn
        const isText = ann.field !== 'BoundingBox' && coords.start !== undefined;

        return {
          id: `ann-${idx}-${Date.now()}`,
          // Nếu là Text
          start: coords.start,
          end: coords.end,
          text: isText ? ann.content : undefined,
          // Nếu là Image
          x: coords.x || 0, 
          y: coords.y || 0, 
          width: coords.width || 0, 
          height: coords.height || 0,
          // Label (Dựa theo cách bạn thiết kế: Image lưu label ở content, Text lưu ở field)
          label: isText ? ann.field : ann.content 
        };
      }));
    } catch (err) { console.error("Lỗi đồng bộ:", err); }
  }, [getItem]);

  useEffect(() => { refreshCurrentItemData(currentFileId); }, [currentFileId, refreshCurrentItemData]);

  // CẬP NHẬT: Lưu data phân biệt Text vs Image
  const handleSave = async () => {
    if (!currentFileId || isSaving) return;
    
    const formattedAnnotations = annotations.map((ann) => {
      // 1. Nếu là TEXT (có start và end)
      if (ann.start !== undefined && ann.end !== undefined) {
        return {
          annotationData: JSON.stringify({ start: ann.start, end: ann.end }), // Tọa độ chữ
          content: ann.text || "", // Nội dung chữ đã bôi đen
          field: ann.label || ""   // Tên nhãn (Tích cực, Tiêu cực...)
        };
      }
      
      // 2. Nếu là IMAGE / BOUNDING BOX (Mặc định cũ của bạn)
      return {
        annotationData: JSON.stringify({ x: ann.x, y: ann.y, width: ann.width, height: ann.height }),
        content: String(ann.label), // Tên nhãn
        field: "BoundingBox"
      };
    });

    await save(currentFileId, { annotations: formattedAnnotations });
    await refreshCurrentItemData(currentFileId);
    alert("Đã lưu thành công!");
  };

  const files = useMemo(() => taskItems.map(ti => ({
    id: ti.itemID, name: ti.fileName, url: ti.filePath,
    status: ti.isFlagged ? 'Rejected' : (ti.annotations?.length ? 'Done' : 'New'),
  })), [taskItems]);

  return {
    files, availableLabels, currentFileId, handleSelectFile: setCurrentFileId,
    selectedTool, setSelectedTool, selectedLabel, setSelectedLabel,
    annotations, setAnnotations, isSaving, handleSave,
    isLoading: loadingTask || loadingItem, 
    toolbarConfig: ['Vẽ Khung Nhãn']      
  };
};