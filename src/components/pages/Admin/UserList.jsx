import React, { useState } from 'react';

export default function UserList() {
    // 1. Quản lý danh sách User bằng State (đã loại bỏ phone, giữ lại role)
    const [userList, setUserList] = useState([
        { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', status: 'Active' },
        { id: '2', name: 'Manager One', email: 'manager1@example.com', role: 'MANAGER', status: 'Active' },
        { id: '3', name: 'Annotator Alpha', email: 'annotator1@example.com', role: 'ANNOTATOR', status: 'Inactive' },
        { id: '5', name: 'Reviewer Zeta', email: 'reviewer2@example.com', role: 'REVIEWER', status: 'Active' },
    ]);

    // State cho Modal chi tiết & Chỉnh sửa
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // State mới: Dữ liệu tạm thời khi đang sửa
    const [editForm, setEditForm] = useState(null);

    // --- CÁC HÀM XỬ LÝ LOGIC ---

    // 1. Bật/Tắt trạng thái (đặt ở dòng danh sách)
    const handleToggleStatus = (id) => {
        const updatedUsers = userList.map(u => {
            if (u.id === id) {
                const newStatus = u.status === 'Active' ? 'Inactive' : 'Active';
                if (window.confirm(`Xác nhận ${newStatus === 'Inactive' ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản ${u.name}?`)) {
                    return { ...u, status: newStatus };
                }
            }
            return u;
        });
        setUserList(updatedUsers);
    };

    // 2. Reset mật khẩu (đặt ở dòng danh sách)
    const handleResetPassword = (name, email) => {
        if (window.confirm(`Gửi link đặt lại mật khẩu mới tới email của ${name} (${email})?`)) {
            alert(`Đã gửi email cấp lại mật khẩu tới ${email}`);
        }
    };

    // 3. Mở modal và thiết lập dữ liệu form
    const openDetail = (user) => {
        setSelectedUser(user);
        setEditForm(user); // Copy dữ liệu user vào form
        setIsDetailOpen(true);
    };

    // 4. Lưu thay đổi từ Modal
    const handleSaveEdit = () => {
        const updatedUsers = userList.map(u =>
            u.id === editForm.id ? editForm : u
        );
        setUserList(updatedUsers);
        setSelectedUser(editForm); // Cập nhật lại user đang xem
        setIsDetailOpen(false); // Đóng modal
        alert("Cập nhật thông tin thành công!");
    };

    return (
        <div className="p-6 min-h-screen bg-[#050B1A] text-white font-sans">
            <h1 className="text-2xl font-bold mb-8">Quản lý nhân sự</h1>

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
                        {userList.map((user) => (
                            <tr key={user.id} className="hover:bg-white/[0.03] transition-all">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold">{user.name}</div>
                                    <div className="text-xs text-white/30">{user.email}</div>
                                </td>
                                {/* --- HIỂN THỊ VAI TRÒ --- */}
                                <td className="px-6 py-4 text-center">
                                    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                                        {user.role}
                                    </span>
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
                                            onClick={() => handleResetPassword(user.name, user.email)}
                                            className="text-xs bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 px-3 py-1.5 rounded-lg"
                                            title="Reset Mật Khẩu"
                                        >
                                            🔑
                                        </button>

                                        <button
                                            onClick={() => handleToggleStatus(user.id)}
                                            className={`text-xs px-3 py-1.5 rounded-lg font-bold ${user.status === 'Active'
                                                ? 'bg-rose-600/10 hover:bg-rose-600/20 text-rose-400'
                                                : 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400'
                                                }`}
                                        >
                                            {user.status === 'Active' ? 'Vô hiệu' : 'Kích hoạt'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                                className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-bold transition-all"
                            >
                                Lưu thay đổi
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