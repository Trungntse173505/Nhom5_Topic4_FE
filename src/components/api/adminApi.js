import axiosClient from './axiosClient';
const adminApi = {
    createUser: (data) => {
        const url = '/api/admin/users/create-user';
        return axiosClient.post(url, data);
    },
    getAllUsers: () => {
        const url = '/api/admin/users/all-users';
        return axiosClient.get(url);
    },
    updateUser: (id, data) => {
        const url = `/api/admin/users/update-user-info?id=${encodeURIComponent(id)}`;
        return axiosClient.put(url, data);
    },
    deleteUser: (id) => {
        const url = `/api/admin/users/delete-user/${id}`;
        return axiosClient.delete(url);
    },
    resetPassword: (id, data) => {
        const url = `/api/admin/users/reset-password/${encodeURIComponent(id)}`;
        return axiosClient.post(url, data);
    },
    toggleStatus: (id) => {
        const url = `/api/admin/users/toggle-status/${encodeURIComponent(id)}`;
        return axiosClient.patch(url, {});
    },
    assignRole: (id, data) => {
        const url = `/api/admin/users/assign-role/${encodeURIComponent(id)}`;
        return axiosClient.patch(url, data);
    },

    assignRoleRequest: (method, id, data, config) => {
        const url = `/api/admin/users/assign-role/${encodeURIComponent(id)}`;
        return axiosClient.request({ url, method, data, ...(config || {}) });
    },
    filterSystemLogs: (payload = {}, config) => {
        const url = '/api/admin/system-logs/filter';
        return axiosClient.get(url, { params: payload, ...(config || {}) });
    },
};
export default adminApi;