import axiosClient from './axiosClient';

const adminApi = {
    createUser: (data) => axiosClient.post('/api/admin/users/create-user', data),
    getAllUsers: () => axiosClient.get('/api/admin/users/all-users'),
    updateUser: (id, data) => {
        const url = `/api/admin/users/update-user-info?id=${encodeURIComponent(id)}`;
        return axiosClient.put(url, data);
    },
    deleteUser: (id) => axiosClient.delete(`/api/admin/users/delete-user/${id}`),
    resetPassword: (id, data) => axiosClient.post(`/api/admin/users/reset-password/${encodeURIComponent(id)}`, data),
    toggleStatus: (id) => axiosClient.patch(`/api/admin/users/toggle-status/${encodeURIComponent(id)}`, {}),
    assignRole: (id, data) => axiosClient.patch(`/api/admin/users/assign-role/${encodeURIComponent(id)}`, data),
    
    filterSystemLogs: (payload = {}, config) => {
        return axiosClient.get('/api/admin/system-logs/filter', { params: payload, ...(config || {}) });
    },
};

export default adminApi;