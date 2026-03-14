import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTaskDetail } from './useTaskDetail';
import { useItemDetail } from './useItemDetail';
import { useSaveAnnotation } from './useSaveAnnotation';

export const useWorkspace = (taskId) => {
  const { taskItems = [], availableLabels = [], taskInfo, loading: loadingTask } = useTaskDetail(taskId);
  const { getItem, loading: loadingItem } = useItemDetail();
  const { save, isSaving } = useSaveAnnotation();

  const [currentFileId, setCurrentFileId] = useState(null);
  const [selectedTool, setSelectedTool] = useState('Bounding Box');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [annotations, setAnnotations] = useState([]);

  const status = taskInfo?.status;

  useEffect(() => {
    if (!currentFileId && taskItems[0]) setCurrentFileId(taskItems[0].itemID);
    if (!selectedLabel && availableLabels[0]) setSelectedLabel(availableLabels[0].name);
  }, [taskItems, availableLabels, currentFileId, selectedLabel]);

  // Lấy dữ liệu file (bao gồm annotation cũ)
  const refreshCurrentItemData = useCallback(async (id) => {
    if (!id) return;
    try {
      const data = await getItem(id);
      setAnnotations((data?.annotations || []).map((ann, idx) => {
        let coords = {};
        try { 
          coords = typeof ann.annotationData === 'string' ? JSON.parse(ann.annotationData) : (ann.annotationData || {}); 
        } catch {}
        
        const isText = ann.field !== 'BoundingBox' && coords.start !== undefined;

        return {
          id: `ann-${idx}-${Date.now()}`,
          start: coords.start,
          end: coords.end,
          text: isText ? ann.content : undefined,
          x: coords.x || 0, 
          y: coords.y || 0, 
          width: coords.width || 0, 
          height: coords.height || 0,
          label: isText ? ann.field : ann.content 
        };
      }));
    } catch (err) { console.error("Lỗi đồng bộ:", err); }
  }, [getItem]);

  useEffect(() => { refreshCurrentItemData(currentFileId); }, [currentFileId, refreshCurrentItemData]);

  const handleSave = async (isSilent = false) => {
    if (!currentFileId || isSaving || (status !== 'InProgress' && status !== 'Rejected')) return;
    
    const formattedAnnotations = annotations.map((ann) => {
      if (ann.start !== undefined && ann.end !== undefined) {
        return {
          annotationData: JSON.stringify({ start: ann.start, end: ann.end }),
          content: ann.text || "",
          field: ann.label || "" 
        };
      }
      
      return {
        annotationData: JSON.stringify({ x: ann.x, y: ann.y, width: ann.width, height: ann.height }),
        content: String(ann.label),
        field: "BoundingBox"
      };
    });

    await save(currentFileId, { annotations: formattedAnnotations });
    await refreshCurrentItemData(currentFileId);
    
    // Nếu KHÔNG PHẢI lưu ngầm thì mới hiện thông báo
    if (!isSilent) {
      alert("Đã lưu thành công!");
    }
  };

  const handleSelectFile = async (newFileId) => {
    if (newFileId === currentFileId) return;

    if (status === 'InProgress' || status === 'Rejected') {
      try {
        await handleSave(true); 
      } catch (error) {
        console.error("Lỗi khi tự động lưu ngầm:", error);
      }
    }

    setCurrentFileId(newFileId);
  };

  const files = useMemo(() => taskItems.map(ti => ({
    id: ti.itemID, name: ti.fileName, url: ti.filePath,
    status: ti.isFlagged ? 'Rejected' : (ti.annotations?.length ? 'Done' : 'New'),
  })), [taskItems]);

  return {
    files, 
    availableLabels, 
    currentFileId, 
    handleSelectFile, 
    selectedTool, 
    setSelectedTool, 
    selectedLabel, 
    setSelectedLabel,
    annotations, 
    setAnnotations, 
    isSaving, 
    handleSave,
    status,
    isLoading: loadingTask || loadingItem, 
    toolbarConfig: ['Vẽ Khung Nhãn']      
  };
};