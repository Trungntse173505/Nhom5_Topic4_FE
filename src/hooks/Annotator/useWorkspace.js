import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTaskDetail } from './useTaskDetail';
import { useItemDetail } from './useItemDetail';
import { useSaveAnnotation } from './useSaveAnnotation';

export const useWorkspace = (taskId) => {
  // Đảm bảo taskItems và availableLabels luôn là mảng rỗng nếu chưa load xong
  const { taskItems = [], availableLabels = [], loading: loadingTask } = useTaskDetail(taskId);
  const { getItem, loading: loadingItem } = useItemDetail();
  const { save, isSaving } = useSaveAnnotation();

  const [currentFileId, setCurrentFileId] = useState(null);
  const [selectedTool, setSelectedTool] = useState('Bounding Box');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [annotations, setAnnotations] = useState([]);

  const isLoading = loadingTask || loadingItem;
  const toolbarConfig = ['Bounding Box', 'Polygon', 'Point'];

  useEffect(() => {
    if (taskItems.length > 0 && !currentFileId) setCurrentFileId(taskItems[0].itemID);
    if (availableLabels.length > 0 && !selectedLabel) {
      setSelectedLabel(availableLabels[0].name);
    }
  }, [taskItems, availableLabels, currentFileId, selectedLabel]);

  const refreshCurrentItemData = useCallback(async (id) => {
    if (!id) return;
    try {
      const data = await getItem(id);
      if (data?.annotations) {
        const parsedAnns = data.annotations.map((ann, idx) => {
          let coords = {};
          try { 
            coords = typeof ann.annotationData === 'string' ? JSON.parse(ann.annotationData) : ann.annotationData; 
          } catch (e) { coords = {}; }
          return {
            id: `box-${idx}-${Date.now()}`,
            x: coords.x || 0,
            y: coords.y || 0,
            width: coords.width || 0,
            height: coords.height || 0,
            label: ann.content 
          };
        });
        setAnnotations(parsedAnns);
      } else {
        setAnnotations([]);
      }
    } catch (err) { console.error("Lỗi đồng bộ:", err); }
  }, [getItem]);

  useEffect(() => { refreshCurrentItemData(currentFileId); }, [currentFileId, refreshCurrentItemData]);

  const handleSave = async () => {
    if (!currentFileId || isSaving) return;
    const payload = {
      annotations: annotations.map(ann => ({
        annotationData: JSON.stringify({ x: ann.x, y: ann.y, width: ann.width, height: ann.height }),
        content: String(ann.label),
        field: "BoundingBox"
      }))
    };
    await save(currentFileId, payload);
    await refreshCurrentItemData(currentFileId);
    alert("Đã lưu thành công!");
  };

  const files = useMemo(() => taskItems.map(ti => ({
    id: ti.itemID,
    name: ti.fileName,
    url: ti.filePath,
    status: ti.isFlagged ? 'Rejected' : (ti.annotations?.length > 0 ? 'Done' : 'New'),
  })), [taskItems]);

  // PHẢI RETURN ĐỦ CÁC BIẾN NÀY
  return {
    files, 
    availableLabels, 
    currentFileId, 
    handleSelectFile: setCurrentFileId,
    selectedTool, 
    setSelectedTool, 
    selectedLabel, 
    setSelectedLabel,
    annotations, 
    setAnnotations, 
    isLoading, 
    isSaving, 
    handleSave,
    toolbarConfig // <--- QUAN TRỌNG: Phải có dòng này
  };
};