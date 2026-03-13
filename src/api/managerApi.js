// src/api/managerApi.js
import axiosClient from './axiosClient';

// =============================================================================
// NHÓM 1: QUẢN LÝ DỰ ÁN (PROJECTS)
// =============================================================================

export const getProjectsList = async () => {
  try {
    return await axiosClient.get('/api/manager/projects');
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy danh sách dự án");
  }
};

export const createProject = async (projectData) => {
  try {
    return await axiosClient.post('/api/manager/projects', projectData);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Tạo dự án thất bại");
  }
};

export const getProjectDetail = async (projectId) => {
  try {
    return await axiosClient.get(`/api/manager/projects/${projectId}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi kéo chi tiết dự án");
  }
};

export const updateProjectInfo = async (projectId, updateData) => {
  try {
    return await axiosClient.put(`/api/manager/projects/${projectId}`, updateData);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi cập nhật thông tin dự án");
  }
};

export const updateProjectStatus = async (projectId, newStatus) => {
  try {
    return await axiosClient.patch(`/api/manager/projects/${projectId}/status`, { status: newStatus });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi đổi trạng thái dự án");
  }
};

export const updateProjectGuideline = async (projectId, guidelineUrl) => {
  try {
    return await axiosClient.post(`/api/manager/projects/${projectId}/guideline`, { guidelineUrl });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi cập nhật Guideline");
  }
};

// =============================================================================
// NHÓM 2: QUẢN LÝ DỮ LIỆU (DATA)
// =============================================================================

export const uploadDataToProject = async (projectId, fileUrls, fileType) => {
  try {
    return await axiosClient.post(`/api/manager/projects/${projectId}/data`, { fileUrls, fileType });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi nạp dữ liệu vào dự án");
  }
};

// =============================================================================
// NHÓM 3: QUẢN LÝ CÔNG VIỆC (TASKS)
// =============================================================================

export const getUnassignedItems = async (projectId) => {
  try {
    return await axiosClient.get(`/api/projects/${projectId}/data-items/unassigned`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi lấy dữ liệu chưa phân công");
  }
};

export const createBatchTask = async (projectId, payload) => {
  try {
    return await axiosClient.post(`/api/projects/${projectId}/tasks`, payload);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi gom lô dữ liệu");
  }
};

export const getProjectTasks = async (projectId) => {
  try {
    return await axiosClient.get(`/api/projects/${projectId}/tasks`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy danh sách Task");
  }
};

export const assignTaskPersonnel = async (taskId, annotatorID, reviewerID) => {
  try {
    return await axiosClient.patch(`/api/tasks/${taskId}/assign`, { annotatorID, reviewerID });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi giao nhân sự");
  }
};

export const updateTaskDeadline = async (taskId, deadline) => {
  try {
    return await axiosClient.patch(`/api/tasks/${taskId}/deadline`, { deadline });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi điều chỉnh deadline");
  }
};

export const revokeTask = async (taskId) => {
  try {
    return await axiosClient.post(`/api/manager/tasks/${taskId}/revoke`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể thu hồi Task");
  }
};

export const splitProjectTasks = async (projectId, payload) => {
  try {
    return await axiosClient.post(`/api/manager/projects/${projectId}/split-tasks`, payload || {});
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi phân lô dữ liệu");
  }
};

export const getAvailableAnnotators = async () => {
  try {
    return await axiosClient.get('/api/tasks/available-annotators');
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi lấy danh sách Annotator");
  }
};

export const getAvailableReviewers = async () => {
  try {
    return await axiosClient.get('/api/tasks/available-reviewers');
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi lấy danh sách Reviewer");
  }
};

// =============================================================================
// NHÓM 4: QUẢN LÝ NGƯỜI DÙNG (USERS)
// =============================================================================

export const getUsersList = async () => {
  try {
    return await axiosClient.get('/api/manager/users');
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi lấy danh sách người dùng");
  }
};

// =============================================================================
// NHÓM 5: QUẢN LÝ NHÃN DÁN (LABELS)
// =============================================================================

export const getLibraryLabels = async () => {
  try {
    return await axiosClient.get('/api/manager/labels');
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi lấy danh sách nhãn mẫu");
  }
};

export const addLabelToLibrary = async (labelData) => {
  try {
    return await axiosClient.post('/api/manager/labels', labelData);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi thêm nhãn vào kho");
  }
};

export const updateLabelInLibrary = async (id, updateData) => {
  try {
    return await axiosClient.put(`/api/manager/labels/${id}`, updateData);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi cập nhật nhãn trong kho");
  }
};

export const deleteLabelFromLibrary = async (id) => {
  try {
    await axiosClient.delete(`/api/manager/labels/${id}`);
    return { message: "Xóa thành công" };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi xóa nhãn khỏi kho");
  }
};

export const getProjectLabels = async (projectId) => {
  try {
    return await axiosClient.get(`/api/project-labels/api/projects/${projectId}/labels`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi lấy danh sách nhãn dự án");
  }
};

export const importLabelsToProject = async (projectId, labelIds) => {
  try {
    return await axiosClient.post(`/api/project-labels/api/projects/${projectId}/labels/import`, { labelIds });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi import nhãn");
  }
};

export const createCustomLabel = async (projectId, labelData) => {
  try {
    return await axiosClient.post(`/api/project-labels/api/projects/${projectId}/labels/custom`, labelData);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi tạo nhãn tùy chỉnh");
  }
};

export const updateProjectLabelName = async (projectLabelId, customName) => {
  try {
    return await axiosClient.put(`/api/project-labels/${projectLabelId}`, { customName });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi cập nhật tên nhãn");
  }
};

export const deleteProjectLabel = async (projectLabelId) => {
  try {
    await axiosClient.delete(`/api/project-labels/${projectLabelId}`);
    return { message: "Xóa thành công" };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi xóa nhãn");
  }
};

// =============================================================================
// NHÓM 6: THỐNG KÊ & BÁO CÁO (STATS & EXPORTS)
// =============================================================================

export const getProjectStatistics = async (projectId) => {
  try {
    return await axiosClient.get(`/api/projects/${projectId}/statistics`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi lấy thống kê dự án");
  }
};

export const getUserPerformance = async (projectId) => {
  try {
    return await axiosClient.get(`/api/projects/${projectId}/user-performance`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi lấy hiệu suất User");
  }
};

export const exportProjectData = async (projectId) => {
  try {
    return await axiosClient.post(`/api/projects/${projectId}/exports`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi xuất dữ liệu");
  }
};

export const getExportHistories = async (projectId) => {
  try {
    return await axiosClient.get(`/api/projects/${projectId}/export-histories`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi lấy lịch sử xuất dữ liệu");
  }
};

export const getUserReputationLogs = async (userId) => {
  try {
    return await axiosClient.get(`/api/projects/users/${userId}/reputation-logs`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi lấy lịch sử uy tín");
  }
};