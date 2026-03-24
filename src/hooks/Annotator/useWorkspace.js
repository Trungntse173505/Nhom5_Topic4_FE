import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTaskDetail } from './useTaskDetail';
import { useItemDetail } from './useItemDetail';
import { useSaveAnnotation } from './useSaveAnnotation';

export const useWorkspace = (taskId) => {
  const { taskItems = [], availableLabels = [], taskInfo, guideline, loading: loadingTask } = useTaskDetail(taskId);
  const { getItem, loading: loadingItem } = useItemDetail();

  const { save } = useSaveAnnotation(); 
  const [isManualSaving, setIsManualSaving] = useState(false);

  const [currentFileId, setCurrentFileId] = useState(null);
  const [selectedTool, setSelectedTool] = useState('Bounding Box');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [annotations, setAnnotations] = useState([]);

  const status = taskInfo?.status;

  useEffect(() => {
    if (!currentFileId && taskItems[0]) setCurrentFileId(taskItems[0].itemID);
    if (!selectedLabel && availableLabels[0]) setSelectedLabel(availableLabels[0].name);
  }, [taskItems, availableLabels, currentFileId, selectedLabel]);

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
          label: isText ? ann.field : ann.content,
          isApproved: ann.isApproved || "New" 
        };
      }));
    } catch (err) { console.error("Lỗi đồng bộ:", err); }
  }, [getItem]);

  useEffect(() => { refreshCurrentItemData(currentFileId); }, [currentFileId, refreshCurrentItemData]);

  const formatAnnotations = (anns) => {
    return anns.map((ann) => {
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
  };

  const handleSave = async () => {
    if (!currentFileId || isManualSaving || (status !== 'InProgress' && status !== 'Rejected')) return;
    
    setIsManualSaving(true); 
    try {
      const formatted = formatAnnotations(annotations);
      await save(currentFileId, { annotations: formatted });
      await refreshCurrentItemData(currentFileId);
      alert("Đã lưu thành công!");
    } catch (error) {
      alert("Lỗi khi lưu dữ liệu!");
    } finally {
      setIsManualSaving(false);
    }
  };

  // 🔥 ĐÃ FIX LỖI AUTO SAVE TẠI ĐÂY: Thêm biến canSaveCurrent 
  const handleSelectFile = (newFileId, canSaveCurrent = false) => {
    if (newFileId === currentFileId) return;

    // Chỉ lưu ngầm nếu biến canSaveCurrent là true (tức là đã bấm nút Mở khóa)
    if (canSaveCurrent && (status === 'InProgress' || status === 'Rejected')) {
      const idToSave = currentFileId;
      const annotationsToSave = [...annotations];

      (async () => {
        try {
          const formatted = formatAnnotations(annotationsToSave);
          await save(idToSave, { annotations: formatted });
        } catch (error) {
          console.error("Lỗi khi lưu ngầm file:", idToSave, error);
        }
      })();
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
    isSaving: isManualSaving, 
    handleSave,
    status,
    isLoading: loadingTask || loadingItem, 
    toolbarConfig: ['Vẽ Khung Nhãn'],
    guideline 
  };
};