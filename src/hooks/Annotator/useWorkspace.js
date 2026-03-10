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

  // Tự động chọn file/nhãn đầu tiên nếu chưa có
  useEffect(() => {
    if (!currentFileId && taskItems[0]) setCurrentFileId(taskItems[0].itemID);
    if (!selectedLabel && availableLabels[0]) setSelectedLabel(availableLabels[0].name);
  }, [taskItems, availableLabels, currentFileId, selectedLabel]);

  // Load và parse dữ liệu Annotation
  const refreshCurrentItemData = useCallback(async (id) => {
    if (!id) return;
    try {
      const data = await getItem(id);
      setAnnotations((data?.annotations || []).map((ann, idx) => {
        let coords = {};
        try { coords = typeof ann.annotationData === 'string' ? JSON.parse(ann.annotationData) : (ann.annotationData || {}); } catch {}
        return {
          id: `box-${idx}-${Date.now()}`,
          x: coords.x || 0, y: coords.y || 0, width: coords.width || 0, height: coords.height || 0,
          label: ann.content 
        };
      }));
    } catch (err) { console.error("Lỗi đồng bộ:", err); }
  }, [getItem]);

  useEffect(() => { refreshCurrentItemData(currentFileId); }, [currentFileId, refreshCurrentItemData]);

  // Lưu Annotation
  const handleSave = async () => {
    if (!currentFileId || isSaving) return;
    await save(currentFileId, {
      annotations: annotations.map(({ x, y, width, height, label }) => ({
        annotationData: JSON.stringify({ x, y, width, height }),
        content: String(label),
        field: "BoundingBox"
      }))
    });
    await refreshCurrentItemData(currentFileId);
    alert("Đã lưu thành công!");
  };

  // Định dạng lại danh sách file
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