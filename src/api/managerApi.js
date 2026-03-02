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

// Lấy danh sách toàn bộ dự án
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

// Tạo vỏ dự án mới
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

// Lấy chi tiết 1 dự án (bao gồm cả danh sách dataItems)
export const getProjectDetail = async (projectId) => {
  const response = await fetch(`${BASE_URL}/manager/projects/${projectId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Lỗi kéo chi tiết dự án");
  return data;
};

// Cập nhật thông tin cơ bản của dự án (Tên, mô tả, nhãn...)
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

// Thay đổi trạng thái dự án (Open/Active/Closed)
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

// Cập nhật đường dẫn tài liệu hướng dẫn (Guideline)
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

// Đẩy danh sách link từ Cloudinary vào dự án
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

// Chia nhỏ dữ liệu thành các Task (Phân lô)
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

// Lấy danh sách Task của một dự án cụ thể (Cho Tab Tracking)
export const getProjectTasks = async (projectId) => {
  const response = await fetch(
    `${BASE_URL}/manager/projects/${projectId}/tasks`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Không thể lấy danh sách Task");
  return data;
};

// Cập nhật Task (Gia hạn deadline hoặc giao lại cho người khác)
export const updateTask = async (taskId, updateData) => {
  const response = await fetch(`${BASE_URL}/manager/tasks/${taskId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Cập nhật Task thất bại");
  return data;
};

// Thu hồi Task (Hủy bỏ task đang làm để trả dữ liệu về kho)
export const revokeTask = async (taskId) => {
  const response = await fetch(`${BASE_URL}/manager/tasks/${taskId}/revoke`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Không thể thu hồi Task");
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
