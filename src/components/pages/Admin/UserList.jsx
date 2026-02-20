import React, { useState } from 'react';

export default function UserList() {
    // --- UI STATES ---
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Dữ liệu mẫu để hiển thị layout (Sau này sẽ fetch từ API)
    const users = [
        {
            id: '1', name: 'Admin User',
            email: 'admin@example.com',
            role: 'ADMIN',
            status: 'Active', phone: '0901234567'
        },
        {
            id: '2',
            name: 'Manager One',
            email: 'manager1@example.com',
            role: 'MANAGER', status: 'Active',
            phone: '0907654321'
        },
        {
            id: '3', name: 'Annotator Alpha',
            email: 'annotator1@example.com',
            role: 'ANNOTATOR',
            status: 'Inactive',
            phone: '0988888888'
        },
        {
            id: '5',
            name: 'Reviewer Zeta',
            email: 'reviewer2@example.com',
            role: 'REVIEWER',
            status: 'Active',
            phone: '0933445566'
        },
    ];

    return (
        <div className="p-6 min-h-screen bg-[#050B1A] text-white font-sans">

            {/* 1. HEADER & FILTERS (Yêu cầu C, FR-01) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý nhân sự</h1>
                    <p className="text-sm text-white/50">Xem danh sách, tìm kiếm và phân quyền hệ thống</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Tìm tên, email..."
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all w-64"
                        />
                    </div>
                    <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer hover:bg-black/10 transition-all">
                        <option value="ALL">Tất cả Role</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ANNOTATOR">ANNOTATOR</option>
                        <option value="REVIEWER">REVIEWER</option>
                    </select>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    >
                        + Tạo tài khoản
                    </button>
                </div>
            </div>

            {/* 2. TABLE AREA (Yêu cầu C, E) */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.03] border-b border-white/10 text-white/40">
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest">Thông tin nhân sự</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-center">Vai trò</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/[0.03] transition-all group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{user.name}</div>
                                            <div className="text-xs text-white/30">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                        user.role === 'MANAGER' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${user.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsDetailOpen(true)}
                                            className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors text-sm font-semibold"
                                        >
                                            Chi tiết
                                        </button>
                                        <button className={`p-2 rounded-lg text-sm font-semibold transition-colors ${user.status === 'Active' ? 'hover:bg-rose-500/10 text-rose-400' : 'hover:bg-emerald-500/10 text-emerald-400'}`}>
                                            {user.status === 'Active' ? 'Deactivate' : 'Kích hoạt'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 3. MODAL: CHI TIẾT & CHỈNH SỬA */}
            {isDetailOpen && (
                <div className="fixed inset-0 bg-[#050B1A]/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0A1225] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl ring-1 ring-white/10">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <h2 className="text-xl font-bold">{isEditing ? "Chỉnh sửa thông tin" : "Thông tin chi tiết"}</h2>
                            <button onClick={() => { setIsDetailOpen(false); setIsEditing(false); }} className="text-white/40 hover:text-white transition-colors">✕</button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-5">
                            <div className="flex flex-col items-center mb-4">
                                <div className="h-20 w-20 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 text-3xl font-bold mb-3 border border-blue-500/30">
                                    A
                                </div>
                                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">Active Account</span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-white/30 ml-1">Họ và tên</label>
                                    <input disabled={!isEditing} defaultValue="Admin User" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all disabled:opacity-50" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-white/30 ml-1">Email liên hệ</label>
                                    <input disabled defaultValue="admin@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 opacity-50 cursor-not-allowed" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-white/30 ml-1">Số điện thoại</label>
                                    <input disabled={!isEditing} defaultValue="0901234567" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all disabled:opacity-50" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-white/30 ml-1">Phân quyền (Role)</label>
                                    <select disabled={!isEditing} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all disabled:opacity-50 appearance-none">
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="MANAGER">MANAGER</option>
                                        <option value="ANNOTATOR">ANNOTATOR</option>
                                        <option value="REVIEWER">REVIEWER</option>
                                    </select>
                                </div>
                            </div>

                            {/* Lý do khóa (Chỉ hiện khi Inactive - Yêu cầu F) */}
                            <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 hidden">
                                <p className="text-xs text-rose-400/80"><span className="font-bold">Lý do khóa:</span> Vi phạm chính sách bảo mật hệ thống.</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-white/[0.01] border-t border-white/5 flex flex-col gap-3">
                            {!isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(true)} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all">Sửa thông tin</button>
                                    <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-sm font-medium transition-all">Reset mật khẩu</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold transition-all">Lưu thay đổi</button>
                                    <button onClick={() => setIsEditing(false)} className="w-full bg-white/5 py-3 rounded-xl text-sm font-medium transition-all">Hủy bỏ</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}