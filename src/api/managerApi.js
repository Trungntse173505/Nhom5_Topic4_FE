// src/api/managerApi.js

const BASE_URL =
  "https://swp-be-efc9d4and2d9fda3.japaneast-01.azurewebsites.net/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// =============================================================================
// NHÓM 1: QUẢN LÝ DỰ ÁN (PROJECTS)
// =============================================================================

export const getProjectsList = async () => {
  const response = await fetch(`${BASE_URL}/manager/projects`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Không thể lấy danh sách dự án");
  return data;
};

export const createProject = async (projectData) => {
  const response = await fetch(`${BASE_URL}/manager/projects`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Tạo dự án thất bại");
  return data;
};

export const getProjectDetail = async (projectId) => {
  const response = await fetch(`${BASE_URL}/manager/projects/${projectId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Lỗi kéo chi tiết dự án");
  return data;
};

export const updateProjectInfo = async (projectId, updateData) => {
  const response = await fetch(`${BASE_URL}/manager/projects/${projectId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.message || "Lỗi cập nhật thông tin dự án");
  return data;
};

export const updateProjectStatus = async (projectId, newStatus) => {
  const response = await fetch(
    `${BASE_URL}/manager/projects/${projectId}/status`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus }),
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Lỗi đổi trạng thái dự án");
  return data;
};

export const updateProjectGuideline = async (projectId, guidelineUrl) => {
  const response = await fetch(
    `${BASE_URL}/manager/projects/${projectId}/guideline`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ guidelineUrl }),
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Lỗi cập nhật Guideline");
  return data;
};

// =============================================================================
// NHÓM 2: QUẢN LÝ DỮ LIỆU (DATA)
// =============================================================================

export const uploadDataToProject = async (projectId, fileUrls, fileType) => {
  const response = await fetch(
    `${BASE_URL}/manager/projects/${projectId}/data`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ fileUrls, fileType }),
    },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Lỗi nạp dữ liệu vào dự án");
  return data;
};

// =============================================================================
// NHÓM 3: QUẢN LÝ CÔNG VIỆC (TASKS)
// =============================================================================

export const getUnassignedItems = async (projectId) => {
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/data-items/unassigned`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Lỗi lấy dữ liệu chưa phân công");
  return data;
};

export const createBatchTask = async (projectId, payload) => {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Lỗi gom lô dữ liệu");
  return data;
};

export const getProjectTasks = async (projectId) => {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Không thể lấy danh sách Task");
  return data;
};

export const assignTaskPersonnel = async (taskId, annotatorID, reviewerID) => {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}/assign`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ annotatorID, reviewerID }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Lỗi giao nhân sự");
  return data;
};

export const updateTaskDeadline = async (taskId, deadline) => {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}/deadline`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ deadline }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Lỗi điều chỉnh deadline");
  return data;
};

export const revokeTask = async (taskId) => {
  const response = await fetch(`${BASE_URL}/manager/tasks/${taskId}/revoke`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Không thể thu hồi Task");
  return data;
};

export const splitProjectTasks = async (projectId, payload) => {
  const response = await fetch(
    `${BASE_URL}/manager/projects/${projectId}/split-tasks`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload || {}),
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Lỗi khi phân lô dữ liệu");
  return data;
};

// Lấy danh sách Annotator khả dụng
export const getAvailableAnnotators = async () => {
  const response = await fetch(`${BASE_URL}/tasks/available-annotators`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Lỗi lấy danh sách Annotator");
  return data;
};

// Lấy danh sách Reviewer khả dụng
export const getAvailableReviewers = async () => {
  const response = await fetch(`${BASE_URL}/tasks/available-reviewers`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Lỗi lấy danh sách Reviewer");
  return data;
};

// =============================================================================
// NHÓM 4: QUẢN LÝ NGƯỜI DÙNG (USERS)
// =============================================================================

export const getUsersList = async () => {
  const response = await fetch(`${BASE_URL}/manager/users`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Lỗi lấy danh sách người dùng");
  return data;
};

// =============================================================================
// NHÓM 5: QUẢN LÝ NHÃN DÁN (LABELS)
// =============================================================================

// --- MANAGER LABELS (KHO MẪU CHUNG) ---
export const getLibraryLabels = async () => {
  const response = await fetch(`${BASE_URL}/manager/labels`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Lỗi lấy danh sách nhãn mẫu");
  return data;
};

export const addLabelToLibrary = async (labelData) => {
  const response = await fetch(`${BASE_URL}/manager/labels`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(labelData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Lỗi thêm nhãn vào kho");
  return data;
};

export const updateLabelInLibrary = async (id, updateData) => {
  const response = await fetch(`${BASE_URL}/manager/labels/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.message || "Lỗi cập nhật nhãn trong kho");
  return data;
};

export const deleteLabelFromLibrary = async (id) => {
  const response = await fetch(`${BASE_URL}/manager/labels/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Lỗi xóa nhãn khỏi kho");
  }
  return { message: "Xóa thành công" };
};

// --- PROJECT LABELS (NHÃN CỦA DỰ ÁN) ---
export const getProjectLabels = async (projectId) => {
  const response = await fetch(
    `${BASE_URL}/project-labels/api/projects/${projectId}/labels`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Lỗi lấy danh sách nhãn dự án");
  return data;
};

export const importLabelsToProject = async (projectId, labelIds) => {
  const response = await fetch(
    `${BASE_URL}/project-labels/api/projects/${projectId}/labels/import`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ labelIds }),
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Lỗi import nhãn");
  return data;
};

export const createCustomLabel = async (projectId, labelData) => {
  const response = await fetch(
    `${BASE_URL}/project-labels/api/projects/${projectId}/labels/custom`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(labelData),
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Lỗi tạo nhãn tùy chỉnh");
  return data;
};

export const updateProjectLabelName = async (projectLabelId, customName) => {
  const response = await fetch(`${BASE_URL}/project-labels/${projectLabelId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ customName }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Lỗi cập nhật tên nhãn");
  return data;
};

export const deleteProjectLabel = async (projectLabelId) => {
  const response = await fetch(`${BASE_URL}/project-labels/${projectLabelId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Lỗi xóa nhãn");
  }
  return { message: "Xóa thành công" };
};
// =============================================================================
// NHÓM 6: THỐNG KÊ & BÁO CÁO (STATS & EXPORTS)
// =============================================================================

// Lấy thống kê tổng quan (4 cục Card trên cùng)
export const getProjectStatistics = async (projectId) => {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/statistics`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Lỗi lấy thống kê dự án");
  return data;
};

// Lấy hiệu suất của từng Annotator (Vẽ biểu đồ/bảng)
export const getUserPerformance = async (projectId) => {
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/user-performance`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Lỗi lấy hiệu suất User");
  return data;
};
// Thực hiện lệnh Xuất dữ liệu mới
export const exportProjectData = async (projectId) => {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/exports`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Lỗi xuất dữ liệu");
  return data;
};

// Lấy lịch sử xuất dữ liệu của một dự án
export const getExportHistories = async (projectId) => {
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/export-histories`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Lỗi lấy lịch sử xuất dữ liệu");
  return data;
};
// Lấy lịch sử thay đổi điểm tín nhiệm của một user cụ thể
export const getUserReputationLogs = async (userId) => {
  const response = await fetch(
    `${BASE_URL}/projects/users/${userId}/reputation-logs`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Lỗi lấy lịch sử uy tín");
  return data;
};
