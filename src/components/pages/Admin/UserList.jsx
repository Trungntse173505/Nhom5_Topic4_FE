import React, { useState } from 'react';
import { useAdminUsers } from '../../../hooks/Admin/useAdminUsers';
import { useAdminRoles } from '../../../hooks/Admin/useAdminRoles';
import { useEmailValidator } from '../../../hooks/useEmailValidator';

// Component phụ giúp tái sử dụng cấu trúc HTML của các ô nhập liệu
const FormField = ({ label, isSelect, wrapperClass = "", labelClassName = "", fieldClassName = "", children, ...props }) => (
    <div className={`bg-white/5 p-4 rounded-xl ${wrapperClass}`}>
        <label className={`text-white/40 block mb-1 text-sm ${labelClassName}`}>{label}</label>
        {isSelect ? (
            <select {...props} className={`w-full bg-white/10 rounded-lg p-2 text-white border border-white/20 select-dark ${fieldClassName}`}>{children}</select>
        ) : (
            <input {...props} className={`w-full bg-white/10 rounded-lg p-2 text-white border border-white/20 ${fieldClassName}`} />
        )}
    </div>
);

export default function UserList() {
    const {
        users, setUsers, usersLoading, usersError, refresh,
        createUser, creating: loading, deleteUser, deletingId,
        resetPassword, resettingId, toggleStatus, togglingId,
        updateUser, updatingId, assignRole, assigningRoleId,
    } = useAdminUsers();
    const { validateEmail, verifying } = useEmailValidator();

    const {
        roles, rolesLoading, rolesError, refreshRoles,
        selectedRoles, setSelectedRoles, appliedRoles,
        filterResult, filterLoading, filterError, filterByRoles, clearFilter,
    } = useAdminRoles();

    // Biến cờ khóa toàn cục: Tránh user bấm lung tung nhiều nút khi đang gọi API
    const isBusy = loading || usersLoading || deletingId || updatingId || resettingId || togglingId || assigningRoleId;

    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [createForm, setCreateForm] = useState({ name: '', username: '', email: '', role: 'ANNOTATOR', password: '', expertise: 'basic' });
    const [createError, setCreateError] = useState('');

    // --- CÁC HÀM XỬ LÝ LOGIC ---
    const handleActionCreate = async () => {
        const emailCheck = await validateEmail(createForm.email);
        if (!emailCheck?.isValid) {
            setCreateError(emailCheck?.message || 'Email không tồn tại.');
            return;
        }
        setCreateError('');

        const res = await createUser(createForm);
        if (!res.success) {
            setCreateError(res.error || 'Không thể tạo user.');
            return alert("Lỗi: " + res.error);
        }

        alert("Tạo user thành công!");
        const refreshRes = await refresh();
        if (!refreshRes?.success) {
            const c = res.data?.data ?? res.data;
            const createdId = String(c?.id ?? c?.userId ?? c?.userID ?? c?.accountId ?? c?.accountID ?? Date.now());
            setUsers(prev => [{ id: createdId, ...createForm, status: 'Active' }, ...prev]);
        }
        setIsCreateOpen(false);
        setCreateForm({ name: '', username: '', email: '', role: 'ANNOTATOR', password: '', expertise: 'basic' });
    };

    const handleToggleStatus = async (user) => {
        if (isBusy) return;
        const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        if (!window.confirm(`Xác nhận ${nextStatus === 'Inactive' ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản ${user.name}?`)) return;

        const res = await toggleStatus(user.id, { ...user, status: nextStatus });
        if (!res.success) return alert("Lỗi: " + res.error);

        const raw = res.data?.data ?? res.data;
        const finalStatus = typeof raw?.isActive === 'boolean' ? (raw.isActive ? 'Active' : 'Inactive') : nextStatus;

        setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, status: finalStatus } : u)));
        await refresh();
        setUsers(prev => prev.some(u => u.id === user.id)
            ? prev.map(u => (u.id === user.id ? { ...u, status: finalStatus } : u))
            : [{ ...user, status: finalStatus }, ...prev]
        );
    };

    const handleResetPassword = async (user) => {
        if (isBusy) return;
        const password = window.prompt(`Nhập mật khẩu mới cho ${user.name} (${user.email}):`);
        if (password === null) return;
        if (!password.trim()) return alert('Mật khẩu không được để trống.');
        if (!window.confirm(`Xác nhận reset mật khẩu cho ${user.name} (${user.email})?`)) return;

        const res = await resetPassword(user.id, password);
        alert(res.success ? (res.data?.message || res.data?.data?.message || `Reset mật khẩu thành công cho ${user.email}`) : "Lỗi: " + res.error);
    };

    const handleDeleteUser = async (user) => {
        if (isBusy) return;
        if (!window.confirm(`Xóa user "${user.name}" (${user.email})? Hành động này không thể hoàn tác.`)) return;

        const res = await deleteUser(user.id);
        if (!res.success) return alert("Lỗi: " + res.error);

        setUsers(prev => prev.filter(u => String(u.id) !== String(user.id)));
        await refresh();
        setUsers(prev => prev.filter(u => String(u.id) !== String(user.id)));

        if (selectedUser?.id === user.id) {
            setIsDetailOpen(false);
            setSelectedUser(null);
            setEditForm(null);
        }
        alert("Xóa user thành công!");
    };

    const openDetail = (user) => {
        setSelectedUser(user);
        setEditForm(user);
        setIsDetailOpen(true);
    };

    const handleAssignRole = async (user, nextRole) => {
        if (isBusy) return;
        const normalizedRole = String(nextRole || '').toUpperCase();
        if (normalizedRole === String(user.role || '').toUpperCase()) return;
        if (!window.confirm(`Xác nhận đổi vai trò của ${user.name} thành ${normalizedRole}?`)) return;

        setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, role: normalizedRole } : u)));
        const res = await assignRole(user.id, normalizedRole);
        if (res.success) {
            await refresh();
            setUsers(prev => prev.some(u => u.id === user.id)
                ? prev.map(u => (u.id === user.id ? { ...u, role: normalizedRole } : u))
                : [{ ...user, role: normalizedRole }, ...prev]
            );
        } else {
            console.error('Đổi vai trò thất bại', { userId: user.id, nextRole: normalizedRole, details: res.details, status: res.status });
            setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, role: user.role } : u)));
            alert("Lỗi: " + res.error);
        }
    };

    const handleSaveEdit = async () => {
        if (isBusy) return;
        const roleChanged = selectedUser && String(selectedUser.role || '').toUpperCase() !== String(editForm.role || '').toUpperCase();

        const updateRes = await updateUser(editForm.id, { name: editForm.name, email: editForm.email });
        if (!updateRes.success) return alert("Lỗi: " + updateRes.error);

        setUsers(prev => prev.map(u => u.id === editForm.id ? { ...u, name: editForm.name, email: editForm.email } : u));

        if (roleChanged) {
            const roleRes = await assignRole(editForm.id, editForm.role);
            if (!roleRes.success) {
                setUsers(prev => prev.map(u => u.id === editForm.id ? { ...u, role: selectedUser?.role } : u));
                setEditForm(prev => ({ ...prev, role: selectedUser?.role }));
                return alert("Lỗi: " + roleRes.error);
            }
            setUsers(prev => prev.map(u => u.id === editForm.id ? { ...u, role: editForm.role } : u));
        }

        const nextSelected = { ...(selectedUser || {}), ...editForm, role: roleChanged ? editForm.role : (selectedUser?.role ?? editForm.role) };
        setSelectedUser(nextSelected);
        setIsDetailOpen(false);

        const refreshRes = await refresh();
        setUsers(prev => prev.some(u => u.id === editForm.id)
            ? prev.map(u => u.id === editForm.id ? { ...u, name: editForm.name, email: editForm.email, role: nextSelected.role } : u)
            : [{ id: editForm.id, name: editForm.name, email: editForm.email, role: nextSelected.role, status: selectedUser?.status || 'Active' }, ...prev]
        );
        alert("Cập nhật thông tin thành công!");
    };

    return (
        <div className="p-6 min-h-screen bg-[#050B1A] text-white font-sans">
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold">Quản lý nhân sự</h1>
                <button
                    onClick={() => setIsCreateOpen(true)} disabled={loading || usersLoading}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    + Tạo người dùng
                </button>
            </div>

            {usersError && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{usersError}</div>}

            {/* BỘ LỌC ROLES */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="text-sm font-bold text-white/80">Vai trò</div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => refreshRoles()} disabled={rolesLoading} className="bg-sky-600 hover:bg-sky-500 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                            {rolesLoading ? 'Đang tải vai trò...' : 'Tải vai trò'}
                        </button>
                        <button
                            onClick={async () => {
                                const res = await filterByRoles(selectedRoles);
                                if (res?.success) setUsers(res.users || []);
                            }}
                            disabled={filterLoading || selectedRoles.length === 0}
                            className="bg-violet-600 hover:bg-violet-500 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {filterLoading ? 'Đang lọc...' : 'Lọc theo vai trò'}
                        </button>
                        <button
                            onClick={async () => { clearFilter(); await refresh(); }}
                            disabled={!filterResult && !filterError}
                            className="bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Xóa
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
                                <label key={r} className={`cursor-pointer select-none text-xs font-semibold px-3 py-1 rounded-full border transition-all ${checked ? 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30' : 'text-white/70 bg-white/5 border-white/10 hover:border-white/20'}`}>
                                    <input
                                        type="checkbox" className="mr-2 accent-emerald-500" checked={checked}
                                        onChange={(e) => setSelectedRoles(e.target.checked ? Array.from(new Set([...selectedRoles, r])) : selectedRoles.filter(x => x !== r))}
                                    />
                                    {r}
                                </label>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-xs text-white/40 mb-4">Chưa có vai trò. Bấm "Tải vai trò" để lấy dữ liệu.</div>
                )}

                {Array.isArray(appliedRoles) && appliedRoles.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="text-xs text-white/40">Đang lọc theo:</div>
                        {appliedRoles.map(r => <span key={r} className="text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-200">{r}</span>)}
                    </div>
                )}
            </div>

            {/* BẢNG DANH SÁCH */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/40 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Nhân sự</th>
                            <th className="px-6 py-4 text-center">Vai trò</th>
                            <th className="px-6 py-4 text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {usersLoading && (
                            <tr><td className="px-6 py-6 text-sm text-white/50" colSpan={4}>Đang tải danh sách người dùng...</td></tr>
                        )}
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/[0.03] transition-all">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold">{user.name}</div>
                                    <div className="text-xs text-white/30">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <select
                                        value={user.role} onChange={(e) => handleAssignRole(user, e.target.value)} disabled={isBusy || assigningRoleId === user.id} title="Đổi vai trò"
                                        className="text-xs font-semibold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 hover:border-blue-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed select-dark"
                                    >
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="MANAGER">MANAGER</option>
                                        <option value="ANNOTATOR">ANNOTATOR</option>
                                        <option value="REVIEWER">REVIEWER</option>
                                        {!['ADMIN', 'MANAGER', 'ANNOTATOR', 'REVIEWER'].includes(String(user.role || '').toUpperCase()) && <option value={user.role}>{user.role}</option>}
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {user.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openDetail(user)} className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg">Sửa</button>
                                        {/* <button onClick={() => handleResetPassword(user)} disabled={isBusy || resettingId === user.id} title="Đặt lại Mật Khẩu" className="text-xs bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 px-3 py-1.5 rounded-lg">
                                            {resettingId === user.id ? '...' : '🔑'}
                                        </button> */}
                                        <button onClick={() => handleToggleStatus(user)} disabled={isBusy || togglingId === user.id} className={`text-xs px-3 py-1.5 rounded-lg font-bold ${user.status === 'Active' ? 'bg-rose-600/10 hover:bg-rose-600/20 text-rose-400' : 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400'}`}>
                                            {togglingId === user.id ? '...' : user.status === 'Active' ? 'Vô hiệu' : 'Kích hoạt'}
                                        </button>
                                        <button onClick={() => handleDeleteUser(user)} disabled={isBusy || deletingId === user.id} title="Xóa người dùng" className="text-xs bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 px-3 py-1.5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !loading && setIsCreateOpen(false)}></div>
                    <div className="relative origin-center scale-[0.95] sm:scale-100 bg-[#0A1225] border border-white/10 w-full max-w-2xl lg:max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-4 py-3 md:px-8 md:py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h2 className="text-base md:text-xl font-bold text-emerald-400">Tạo người dùng</h2>
                            <button onClick={() => setIsCreateOpen(false)} disabled={loading} className="text-white/40 hover:text-white text-2xl disabled:opacity-60 disabled:cursor-not-allowed">✕</button>
                        </div>
                        <div className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-[1.25fr_0.75fr] gap-2 md:gap-4">
                            {createError && (
                                <div className="sm:col-span-2 text-xs md:text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2 md:px-4 md:py-3">
                                    {createError}
                                </div>
                            )}
                            <FormField wrapperClass="!p-3 md:!p-4" labelClassName="!mb-0.5 !text-[11px] md:!text-sm" fieldClassName="!p-2 md:!p-2.5 !text-sm md:!text-base" label="Họ và tên" value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} placeholder="Nguyễn Văn A" />
                            <FormField wrapperClass="!p-3 md:!p-4" labelClassName="!mb-0.5 !text-[11px] md:!text-sm" fieldClassName="!p-2 md:!p-2.5 !text-sm md:!text-base" label="Username" value={createForm.username} onChange={e => setCreateForm(p => ({ ...p, username: e.target.value }))} placeholder="vd: admin01" />
                            <FormField wrapperClass="!p-3 md:!p-4" labelClassName="!mb-0.5 !text-[11px] md:!text-sm" fieldClassName="!p-2 md:!p-2.5 !text-sm md:!text-base" type="email" label="Email" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} placeholder="user@email.com" />
                            <FormField wrapperClass="!p-3 md:!p-4" labelClassName="!mb-0.5 !text-[11px] md:!text-sm" fieldClassName="!p-2 md:!p-2.5 !text-sm md:!text-base" isSelect label="Vai trò" value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))}>
                                <option value="ADMIN">ADMIN</option>
                                <option value="MANAGER">MANAGER</option>
                                <option value="ANNOTATOR">ANNOTATOR</option>
                                <option value="REVIEWER">REVIEWER</option>
                            </FormField>
                            <FormField wrapperClass="!p-3 md:!p-4" labelClassName="!mb-0.5 !text-[11px] md:!text-sm" fieldClassName="!p-2 md:!p-2.5 !text-sm md:!text-base" type="password" label="Mật khẩu" value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
                            <FormField wrapperClass="!p-3 md:!p-4" labelClassName="!mb-0.5 !text-[11px] md:!text-sm" fieldClassName="!p-2 md:!p-2.5 !text-sm md:!text-base" isSelect label="Expertise" value={createForm.expertise} onChange={e => setCreateForm(p => ({ ...p, expertise: e.target.value }))}>
                                <option value="basic">Basic</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="audio">Audio</option>
                                <option value="text">Text</option>
                                <option value="mixed">Mixed</option>
                            </FormField>
                        </div>
                        <div className="px-4 py-3 md:px-8 md:py-6 bg-white/[0.02] border-t border-white/5 grid grid-cols-2 gap-2 md:gap-3">
                            <button onClick={handleActionCreate} disabled={loading || verifying} className="w-full bg-emerald-600 hover:bg-emerald-500 py-2.5 md:py-3 text-xs md:text-sm rounded-xl font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {loading ? 'Đang tạo...' : 'Tạo user'}
                            </button>
                            <button onClick={() => setIsCreateOpen(false)} disabled={loading} className="w-full bg-white/5 hover:bg-white/10 py-2.5 md:py-3 text-xs md:text-sm rounded-xl font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed">Hủy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL CHI TIẾT & CHỈNH SỬA --- */}
            {isDetailOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)}></div>
                    <div className="relative bg-[#0A1225] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h2 className="text-xl font-bold text-blue-400">Chỉnh sửa hồ sơ</h2>
                            <button onClick={() => setIsDetailOpen(false)} className="text-white/40 hover:text-white text-2xl">✕</button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold">{editForm.name.charAt(0)}</div>
                                <div>
                                    <h3 className="text-xl font-bold">Chỉnh sửa ID: {editForm.id}</h3>
                                    <p className="text-sm text-white/50">Cập nhật thông tin nhân viên</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <FormField wrapperClass="col-span-2" label="Họ và tên" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                                <FormField wrapperClass="col-span-2" type="email" label="Email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
                                <FormField wrapperClass="col-span-2" isSelect label="Vai trò" value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="MANAGER">MANAGER</option>
                                    <option value="ANNOTATOR">ANNOTATOR</option>
                                    <option value="REVIEWER">REVIEWER</option>
                                </FormField>
                            </div>
                        </div>
                        <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                            <button onClick={handleSaveEdit} disabled={isBusy} className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {updatingId === editForm.id || assigningRoleId === editForm.id ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                            <button onClick={() => setIsDetailOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-sm font-bold transition-all">Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
