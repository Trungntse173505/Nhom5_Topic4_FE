import React from 'react';

export default function UserList() {
    const users = [
        {
            id: '1',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'ADMIN'
        },
        {
            id: '2',
            name: 'Manager One',
            email: 'manager1@example.com',
            role: 'MANAGER'
        },
        {
            id: '3',
            name: 'Manager Two',
            email: 'manager2@example.com',
            role: 'MANAGER'
        },
        {
            id: '4',
            name: 'Annotator Alpha',
            email: 'annotator1@example.com',
            role: 'ANNOTATOR'
        },
        {
            id: '5',
            name: 'Annotator Beta',
            email: 'annotator2@example.com',
            role: 'ANNOTATOR'
        },
    ];

    return (

        <div className="p-6 min-h-screen bg-[#050B1A] text-white">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-sm text-white/50">Quản lý danh sách tài khoản</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20">
                    + Create User
                </button>
            </div>

            {/* Table Area */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/10 text-white/40">
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">User Info</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center">Role</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar */}
                                        <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">
                                            {user.name.charAt(0)}
                                        </div>

                                        <div>
                                            <div className="text-sm font-bold text-white mb-0.5">{user.name}</div>
                                            <div className="text-xs text-white/40">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                        user.role === 'MANAGER' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}