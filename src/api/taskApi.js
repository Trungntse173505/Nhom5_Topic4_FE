import { mockTasks, mockTaskFiles } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const taskApi = {
  // 1. API cho Dashboard
  getAllTasks: async () => {
    await delay(500);
    return { data: mockTasks, status: 200 };
  },

  // 2. API lấy file cho Workspace
  getFilesByTaskId: async (taskId) => {
    await delay(400);
    return { data: mockTaskFiles[taskId] || [], status: 200 };
  },

  // 3. API Save & Next
  saveAnnotationAndGetNext: async (taskId, currentFileId, annotations, label) => {
    await delay(600); 
    const files = mockTaskFiles[taskId];
    if (!files) throw new Error("Task không tồn tại");

    const currentIndex = files.findIndex(f => f.id === currentFileId);
    if (currentIndex !== -1) {
      files[currentIndex].status = 'Done';
      files[currentIndex].savedData = { annotations, label }; 
    }

    const nextFile = files.find(f => f.status === 'Pending' || f.status === 'Rejected');
    return { 
      data: { success: true, updatedFiles: [...files], nextFileId: nextFile ? nextFile.id : null }, 
      status: 200 
    };
  }
};