import React, { useState } from 'react';
import { useAdminUsers } from '../../../hooks/useAdminUsers';
import { useAdminRoles } from '../../../hooks/useAdminRoles';

export default function UserList() {
    const {
        users,
        setUsers,
        usersLoading,
        usersError,
        refresh,
        createUser,
        creating,
        deleteUser,
        deletingId,
        resetPassword,
        resettingId,
        toggleStatus,
        togglingId,
        updateUser,
        updatingId,
        assignRole,
        assigningRoleId,
    } = useAdminUsers();
    const {
        roles,
        rolesLoading,
        rolesError,
        refreshRoles,
        selectedRoles,
        setSelectedRoles,
        appliedRoles,
        filterResult,
        filterLoading,
        filterError,
        filterByRoles,
        clearFilter,
    } = useAdminRoles();
    const loading = creating;
    const userList = users;

    // State cho Modal chi tiết & Chỉnh sửa
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // State cho Modal tạo mới
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        username: '',
        email: '',
        role: 'ANNOTATOR',
        password: '',
    });

    // State mới: Dữ liệu tạm thời khi đang sửa
    const [editForm, setEditForm] = useState(null);

    // --- CÁC HÀM XỬ LÝ LOGIC ---
    const handleActionCreate = async () => {
        const res = await createUser(createForm);
        if (res.success) {
            alert("Tạo user thành công!");
            const refreshRes = await refresh();
            if (!refreshRes?.success) {
                const created = res.data?.data ?? res.data;
                const createdId =
                    created?.id ??
                    created?.userId ??
                    created?.userID ??
                    created?.accountId ??
                    created?.accountID ??
                    Date.now().toString();

                setUsers((prev) => [
                    {
                        id: String(createdId),
                        name: createForm.name,
                        email: createForm.email,
                        role: createForm.role,
                        status: 'Active',
                    },
                    ...prev,
                ]);
            }
            setIsCreateOpen(false);
            // Reset form
            setCreateForm({ name: '', username: '', email: '', role: 'ANNOTATOR', password: '' });
        } else {
            alert("Lỗi: " + res.error);
        }
    };
    // 1. Bật/Tắt trạng thái (đặt ở dòng danh sách)
    const handleToggleStatus = async (user) => {
        if (loading || usersLoading || deletingId || updatingId || resettingId || togglingId) return;
        const intendedNextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        if (!window.confirm(`Xác nhận ${intendedNextStatus === 'Inactive' ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản ${user.name}?`)) return;

        const res = await toggleStatus(user.id, {
            status: intendedNextStatus,
            name: user.name,
            email: user.email,
            role: user.role,
        });
        if (res.success) {
            const raw = res.data?.data ?? res.data;
            const isActive = raw?.isActive;
            const nextStatus =
                typeof isActive === 'boolean'
                    ? isActive
                        ? 'Active'
                        : 'Inactive'
                    : intendedNextStatus;

            const updatedUser = { ...user, status: nextStatus };

            // Optimistic update so user doesn't disappear immediately.
            setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));

            // Some backends may exclude inactive users from `all-users`. After refresh, ensure the toggled
            // user still appears in the list with the correct status.
            await refresh();
            setUsers((prev) => {
                const exists = prev.some((u) => u.id === user.id);
                if (!exists) return [updatedUser, ...prev];
                return prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u));
            });
        } else {
            alert("Lỗi: " + res.error);
        }
    };

    // 2. Reset mật khẩu (đặt ở dòng danh sách)
    const handleResetPassword = async (user) => {
        if (loading || usersLoading || deletingId || updatingId || resettingId) return;

        const password = window.prompt(`Nhập mật khẩu mới cho ${user.name} (${user.email}):`);
        if (password === null) return;
        if (String(password).trim() === '') {
            alert('Password cannot be empty.');
            return;
        }
        if (!window.confirm(`Xác nhận reset mật khẩu cho ${user.name} (${user.email})?`)) return;

        const res = await resetPassword(user.id, password);
        if (res.success) {
            const msg =
                res.data?.message ||
                res.data?.data?.message ||
                `Reset mật khẩu thành công cho ${user.email}`;
            alert(msg);
        } else {
            alert("Lỗi: " + res.error);
        }
    };

    const handleDeleteUser = async (user) => {
        if (loading || deletingId || usersLoading) return;
        if (!window.confirm(`Xóa user "${user.name}" (${user.email})? Hành động này không thể hoàn tác.`)) return;

        const res = await deleteUser(user.id);
        if (res.success) {
            const deletedId = String(user.id);
            setUsers((prev) => prev.filter((u) => String(u.id) !== deletedId));
            await refresh();
            setUsers((prev) => prev.filter((u) => String(u.id) !== deletedId));
            if (selectedUser?.id === user.id) {
                setIsDetailOpen(false);
                setSelectedUser(null);
                setEditForm(null);
            }
            alert("Xóa user thành công!");
        } else {
            alert("Lỗi: " + res.error);
        }
    };

    // 3. Mở modal và thiết lập dữ liệu form
    const openDetail = (user) => {
        setSelectedUser(user);
        setEditForm(user); // Copy dữ liệu user vào form
        setIsDetailOpen(true);
    };

    const handleAssignRole = async (user, nextRole) => {
        if (loading || usersLoading || deletingId || updatingId || resettingId || togglingId || assigningRoleId) return;
        const normalizedNextRole = String(nextRole || '').toUpperCase();
        if (normalizedNextRole === String(user.role || '').toUpperCase()) return;

        if (!window.confirm(`Xác nhận đổi vai trò của ${user.name} thành ${normalizedNextRole}?`)) return;

        const prevRole = user.role;
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: normalizedNextRole } : u)));

        const res = await assignRole(user.id, normalizedNextRole);
        if (res.success) {
            await refresh();
            const ensured = { ...user, role: normalizedNextRole };
            setUsers((prev) => {
                const exists = prev.some((u) => u.id === user.id);
                if (!exists) return [ensured, ...prev];
                return prev.map((u) => (u.id === user.id ? { ...u, role: normalizedNextRole } : u));
            });
        } else {
            console.error('assign-role failed', { userId: user.id, nextRole: normalizedNextRole, details: res.details, status: res.status });
            setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: prevRole } : u)));
            alert("Lỗi: " + res.error);
        }
    };

    // 4. Lưu thay đổi từ Modal
    const handleSaveEdit = () => {
        (async () => {
            if (loading || usersLoading || deletingId || updatingId || assigningRoleId) return;

            const original = selectedUser;
            const roleChanged =
                original && String(original.role || '').toUpperCase() !== String(editForm.role || '').toUpperCase();

            const updateRes = await updateUser(editForm.id, { name: editForm.name, email: editForm.email });
            if (!updateRes.success) {
                alert("Lỗi: " + updateRes.error);
                return;
            }

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === editForm.id ? { ...u, name: editForm.name, email: editForm.email } : u
                )
            );

            if (roleChanged) {
                const roleRes = await assignRole(editForm.id, editForm.role);
                if (!roleRes.success) {
                    setUsers((prev) =>
                        prev.map((u) =>
                            u.id === editForm.id ? { ...u, role: original?.role } : u
                        )
                    );
                    setEditForm((prev) => ({ ...prev, role: original?.role }));
                    alert("Lỗi: " + roleRes.error);
                    return;
                }
                setUsers((prev) => prev.map((u) => (u.id === editForm.id ? { ...u, role: editForm.role } : u)));
            }

            const nextSelected = {
                ...(original || {}),
                ...editForm,
                name: editForm.name,
                email: editForm.email,
                role: roleChanged ? editForm.role : original?.role ?? editForm.role,
            };

            setSelectedUser(nextSelected);
            setIsDetailOpen(false);

            // Best-effort sync with backend
            const refreshRes = await refresh();
            if (refreshRes?.success) {
                // Ensure UI keeps the edited fields even if backend list is stale.
                const ensured = {
                    id: editForm.id,
                    name: editForm.name,
                    email: editForm.email,
                    role: nextSelected.role,
                    status: original?.status || 'Active',
                };
                setUsers((prev) =>
                    prev.some((u) => u.id === editForm.id)
                        ? prev.map((u) =>
                            u.id === editForm.id
                                ? { ...u, name: editForm.name, email: editForm.email, role: nextSelected.role }
                                : u
                        )
                        : [ensured, ...prev]
                );
            } else {
                // Ensure UI still reflects the user's last edits.
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === editForm.id
                            ? { ...u, name: editForm.name, email: editForm.email, role: nextSelected.role }
                            : u
                    )
                );
            }
            alert("Cập nhật thông tin thành công!");
        })();
    };

    return (
        <div className="p-6 min-h-screen bg-[#050B1A] text-white font-sans">
            <div className="flex items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold">Quản lý nhân sự</h1>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={loading || usersLoading}
                >
                    + Tạo user
                </button>
            </div>

            {usersError && (
                <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {usersError}
                </div>
            )}

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                        <div className="text-sm font-bold text-white/80">Roles</div>

                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => refreshRoles()}
                            disabled={rolesLoading}
                            className="bg-sky-600 hover:bg-sky-500 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {rolesLoading ? 'Đang tải roles...' : 'Tải roles'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                (async () => {
                                    const res = await filterByRoles(selectedRoles);
                                    if (res?.success) {
                                        setUsers(res.users || []);
                                    }
                                })();
                            }}
                            disabled={filterLoading || selectedRoles.length === 0}
                            className="bg-violet-600 hover:bg-violet-500 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {filterLoading ? 'Đang lọc...' : 'Lọc theo roles'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                (async () => {
                                    clearFilter();
                                    await refresh();
                                })();
                            }}
                            disabled={!filterResult && !filterError}
                            className="bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {(rolesError || filterError) && (
                    <div className="mb-3 grid grid-cols-1 gap-2">
                        {rolesError && <div className="text-xs text-rose-400">Roles error: {rolesError}</div>}
                        {filterError && <div className="text-xs text-rose-400">Filter error: {filterError}</div>}
                    </div>
                )}

                {roles?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {roles.map((r) => {
                            const checked = selectedRoles.includes(r);
                            return (
                                <label
                                    key={r}
                                    className={`cursor-pointer select-none text-xs font-semibold px-3 py-1 rounded-full border transition-all ${checked
                                        ? 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30'
                                        : 'text-white/70 bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="mr-2 accent-emerald-500"
                                        checked={checked}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                                ? Array.from(new Set([...selectedRoles, r]))
                                                : selectedRoles.filter((x) => x !== r);
                                            setSelectedRoles(next);
                                        }}
                                    />
                                    {r}
                                </label>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-xs text-white/40 mb-4">Chưa có roles. Bấm "Tải roles" để lấy dữ liệu.</div>
                )}

                {Array.isArray(appliedRoles) && appliedRoles.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="text-xs text-white/40">Đang lọc theo:</div>
                        {appliedRoles.map((r) => (
                            <span key={r} className="text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
                                {r}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* BẢNG DANH SÁCH */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/40 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Nhân sự</th>
                            {/* --- BỔ SUNG CỘT VAI TRÒ --- */}
                            <th className="px-6 py-4 text-center">Vai trò</th>
                            <th className="px-6 py-4 text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {usersLoading && (
                            <tr>
                                <td className="px-6 py-6 text-sm text-white/50" colSpan={4}>
                                    Đang tải danh sách user...
                                </td>
                            </tr>
                        )}
                        {userList.map((user) => (
                            <tr key={user.id} className="hover:bg-white/[0.03] transition-all">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold">{user.name}</div>
                                    <div className="text-xs text-white/30">{user.email}</div>
                                </td>
                                {/* --- HIỂN THỊ VAI TRÒ --- */}
                                <td className="px-6 py-4 text-center">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleAssignRole(user, e.target.value)}
                                        disabled={loading || usersLoading || deletingId || updatingId || resettingId || togglingId || assigningRoleId === user.id}
                                        className="text-xs font-semibold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 hover:border-blue-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        title="Đổi vai trò"
                                    >
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="MANAGER">MANAGER</option>
                                        <option value="ANNOTATOR">ANNOTATOR</option>
                                        <option value="REVIEWER">REVIEWER</option>
                                        {!['ADMIN', 'MANAGER', 'ANNOTATOR', 'REVIEWER'].includes(String(user.role || '').toUpperCase()) && (
                                            <option value={user.role}>{user.role}</option>
                                        )}
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {user.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openDetail(user)}
                                            className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg"
                                        >
                                            Sửa
                                        </button>

                                        <button
                                            onClick={() => handleResetPassword(user)}
                                            className="text-xs bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 px-3 py-1.5 rounded-lg"
                                            title="Reset Mật Khẩu"
                                            disabled={loading || usersLoading || deletingId || updatingId || resettingId === user.id}
                                        >
                                            {resettingId === user.id ? '...' : '🔑'}
                                        </button>

                                        <button
                                            onClick={() => handleToggleStatus(user)}
                                            className={`text-xs px-3 py-1.5 rounded-lg font-bold ${user.status === 'Active'
                                                ? 'bg-rose-600/10 hover:bg-rose-600/20 text-rose-400'
                                                : 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400'
                                                }`}
                                            disabled={loading || usersLoading || deletingId || updatingId || resettingId || togglingId === user.id}
                                        >
                                            {togglingId === user.id ? '...' : user.status === 'Active' ? 'Vô hiệu' : 'Kích hoạt'}
                                        </button>

                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            className="text-xs bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 px-3 py-1.5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                            disabled={loading || usersLoading || deletingId === user.id}
                                            title="Xóa user"
                                        >
                                            {deletingId === user.id ? 'Đang xóa...' : 'Xóa'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL TẠO USER --- */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !loading && setIsCreateOpen(false)}></div>

                    <div className="relative bg-[#0A1225] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h2 className="text-xl font-bold text-emerald-400">Tạo người dùng</h2>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="text-white/40 hover:text-white text-2xl disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-8 space-y-4">
                            <div className="bg-white/5 p-4 rounded-xl">
                                <label className="text-white/40 block mb-1 text-sm">Họ và tên</label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-white/10 rounded-lg p-2 text-white border border-white/20"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl">
                                <label className="text-white/40 block mb-1 text-sm">Username</label>
                                <input
                                    type="text"
                                    value={createForm.username}
                                    onChange={(e) => setCreateForm((prev) => ({ ...prev, username: e.target.value }))}
                                    className="w-full bg-white/10 rounded-lg p-2 text-white border border-white/20"
                                    placeholder="vd: admin01"
                                />
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl">
                                <label className="text-white/40 block mb-1 text-sm">Email</label>
                                <input
                                    type="email"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-white/10 rounded-lg p-2 text-white border border-white/20"
                                    placeholder="user@email.com"
                                />
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl">
                                <label className="text-white/40 block mb-1 text-sm">Vai trò</label>
                                <select
                                    value={createForm.role}
                                    onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value }))}
                                    className="w-full bg-white/10 rounded-lg p-2 text-white border border-white/20"
                                >
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="MANAGER">MANAGER</option>
                                    <option value="ANNOTATOR">ANNOTATOR</option>
                                    <option value="REVIEWER">REVIEWER</option>
                                </select>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl">
                                <label className="text-white/40 block mb-1 text-sm">Mật khẩu</label>
                                <input
                                    type="password"
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                                    className="w-full bg-white/10 rounded-lg p-2 text-white border border-white/20"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                            <button
                                onClick={handleActionCreate}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? 'Đang tạo...' : 'Tạo user'}
                            </button>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL CHI TIẾT & CHỈNH SỬA (GIỮ NGUYÊN) --- */}
            {isDetailOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)}></div>

                    <div className="relative bg-[#0A1225] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        {/* Header Modal */}
                        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h2 className="text-xl font-bold text-blue-400">Chỉnh sửa hồ sơ</h2>
                            <button onClick={() => setIsDetailOpen(false)} className="text-white/40 hover:text-white text-2xl">✕</button>
                        </div>

                        {/* Body Modal - Dạng Form */}
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold">
                                    {editForm.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Chỉnh sửa ID: {editForm.id}</h3>
                                    <p className="text-sm text-white/50">Cập nhật thông tin nhân viên</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {/* Sửa Tên */}
                                <div className="bg-white/5 p-4 rounded-xl col-span-2">
                                    <label className="text-white/40 block mb-1">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full bg-white/10 rounded-lg p-2 text-white border border-white/20"
                                    />
                                </div>

                                {/* Sửa Email */}
                                <div className="bg-white/5 p-4 rounded-xl col-span-2">
                                    <label className="text-white/40 block mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full bg-white/10 rounded-lg p-2 text-white border border-white/20"
                                    />
                                </div>

                                {/* Sửa Vai trò */}
                                <div className="bg-white/5 p-4 rounded-xl col-span-2">
                                    <label className="text-white/40 block mb-1">Vai trò</label>
                                    <select
                                        value={editForm.role}
                                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full bg-white/10 rounded-lg p-2 text-white border border-white/20"
                                    >
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="MANAGER">MANAGER</option>
                                        <option value="ANNOTATOR">ANNOTATOR</option>
                                        <option value="REVIEWER">REVIEWER</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal - Nút Lưu */}
                        <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={loading || usersLoading || deletingId || updatingId === editForm.id || assigningRoleId === editForm.id}
                            >
                                {updatingId === editForm.id || assigningRoleId === editForm.id ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-sm font-bold transition-all"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
