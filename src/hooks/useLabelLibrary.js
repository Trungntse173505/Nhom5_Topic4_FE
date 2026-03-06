import { useState, useEffect, useMemo } from "react";
import {
  getLibraryLabels,
  addLabelToLibrary,
  updateLabelInLibrary,
  deleteLabelFromLibrary,
} from "../api/managerApi";

export const useLabelLibrary = () => {
  const [labels, setLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchLabels = async () => {
    setIsLoading(true);
    try {
      const data = await getLibraryLabels();
      setLabels(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Lỗi lấy kho nhãn:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  // Nhóm nhãn theo Category để UI dễ render
  const groupedLabels = useMemo(() => {
    return labels.reduce((acc, label) => {
      const cat = label.category || "Chưa phân loại";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(label);
      return acc;
    }, {});
  }, [labels]);

  const addLabel = async (labelData) => {
    try {
      setIsProcessing(true);
      await addLabelToLibrary(labelData);
      await fetchLabels();
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateLabel = async (id, updateData) => {
    try {
      setIsProcessing(true);
      await updateLabelInLibrary(id, updateData);
      await fetchLabels();
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const removeLabel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhãn này khỏi kho chung?"))
      return;
    try {
      setIsProcessing(true);
      await deleteLabelFromLibrary(id);
      await fetchLabels();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    labels,
    groupedLabels, // Trả về cục data đã được nhóm
    isLoading,
    isProcessing,
    addLabel,
    updateLabel,
    removeLabel,
    refresh: fetchLabels,
  };
};
