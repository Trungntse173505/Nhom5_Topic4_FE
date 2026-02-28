import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { taskApi } from '../api/taskApi';

const TOOLBAR_CONFIG = {
  // Đảm bảo tên công cụ ở đây khớp 100% với file Canvas
  image: ['Select', 'Bounding Box', 'Polygon'], 
  text: ['Highlight', 'Classification'],
  audio: ['Play/Pause', 'Segment']
};

export const useWorkspace = (taskId) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dataType = queryParams.get('type') || 'image';

  const [files, setFiles] = useState([]);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [selectedTool, setSelectedTool] = useState(TOOLBAR_CONFIG[dataType]?.[0] || '');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await taskApi.getFilesByTaskId(taskId);
      setFiles(res.data);
      const first = res.data.find(f => f.status !== 'Done') || res.data[0];
      setCurrentFileId(first?.id);
      setIsLoading(false);
    };
    if (taskId) fetchData();
  }, [taskId]);

  // Tự động chọn tool đầu tiên khi đổi DataType
  useEffect(() => {
    if (TOOLBAR_CONFIG[dataType]) {
      setSelectedTool(TOOLBAR_CONFIG[dataType][0]);
    }
  }, [dataType]);

  const handleSelectFile = (fileId) => {
    if (fileId !== currentFileId) {
      setCurrentFileId(fileId);
      setAnnotations([]); 
    }
  };

  return { 
    dataType, files, currentFileId, handleSelectFile, 
    selectedTool, setSelectedTool, selectedLabel, setSelectedLabel, 
    annotations, setAnnotations, isLoading, 
    toolbarConfig: TOOLBAR_CONFIG[dataType] || [] 
  };
};