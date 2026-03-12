import axiosClient from './axiosClient';

const adminApi = {
    // Tạo tài khoản người dùng mới (POST)
    createUser: (data) => axiosClient.post('/api/admin/users/create-user', data),
    
    // Lấy danh sách tất cả người dùng trong hệ thống (GET)
    getAllUsers: () => axiosClient.get('/api/admin/users/all-users'),
    
    // Cập nhật thông tin người dùng dựa trên ID (PUT)
    updateUser: (id, data) => {
        const url = `/api/admin/users/update-user-info?id=${encodeURIComponent(id)}`;
        return axiosClient.put(url, data);
    },
    
    // Xóa tài khoản người dùng (DELETE)
    deleteUser: (id) => axiosClient.delete(`/api/admin/users/delete-user/${id}`),
    
    // Đặt lại mật khẩu cho người dùng (POST)
    resetPassword: (id, data) => axiosClient.post(`/api/admin/users/reset-password/${encodeURIComponent(id)}`, data),
    
    // Bật/tắt trạng thái hoạt động (khóa/mở khóa) tài khoản (PATCH)
    toggleStatus: (id) => axiosClient.patch(`/api/admin/users/toggle-status/${encodeURIComponent(id)}`, {}),
    
    // Gán vai trò (phân quyền) cho người dùng (PATCH)
    assignRole: (id, data) => axiosClient.patch(`/api/admin/users/assign-role/${encodeURIComponent(id)}`, data),
    
    // Lọc và lấy danh sách nhật ký hệ thống (System Logs) (GET)
    filterSystemLogs: (payload = {}, config) => {
        return axiosClient.get('/api/admin/system-logs/filter', { params: payload, ...(config || {}) });
    },
};

export default adminApi;