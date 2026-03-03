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

// Lấy danh sách các mục dữ liệu chưa được phân công (Dùng cho giao diện chia Task)
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

// Gom lô dữ liệu và tạo Task mới (ĐÃ SỬA THEO SWAGGER MỚI)
export const createBatchTask = async (projectId, payload) => {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload), // Truyền thẳng payload { taskName, dataIDs, deadline }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Lỗi gom lô dữ liệu");
  return data;
};

// Lấy danh sách Task của một dự án (Cho Tab Tracking)
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

// Cập nhật/Giao nhân sự cho một Task cụ thể (ĐÃ SỬA CHỮ IN HOA THEO SWAGGER)
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

// Điều chỉnh hạn chót cho Task (Extend Deadline)
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

// Thu hồi Task (Hủy bỏ task đang làm để trả dữ liệu về kho)
export const revokeTask = async (taskId) => {
  const response = await fetch(`${BASE_URL}/manager/tasks/${taskId}/revoke`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Không thể thu hồi Task");
  return data;
};

// (Legacy) Hàm chia lô tự động cũ, giữ lại phòng trường hợp ông cần
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

// =============================================================================
// NHÓM 4: QUẢN LÝ NGƯỜI DÙNG (USERS)
// =============================================================================

// Lấy danh sách tài khoản (Để chọn người gán nhãn hoặc người kiểm duyệt)
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

// Lấy danh sách nhãn mẫu từ kho chung (Library)
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

// Thêm nhãn mới vào kho mẫu chung (Library)
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

// Lấy danh sách toàn bộ nhãn của một dự án cụ thể
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

// Import danh sách nhãn từ kho mẫu vào dự án
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

// Tạo nhãn tùy chỉnh (Custom Label) chỉ dành cho dự án này
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

// Cập nhật tên hiển thị của nhãn trong dự án
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

// Xóa nhãn khỏi dự án
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
