import React, { useState } from 'react';

const Icons = {
    Shield: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" />
        </svg>
    ),
    Logout: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    Plus: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    Trash: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    )
};

export default function AdminDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);

    return (
        <div className="min-h-screen w-full bg-[#050B1A] text-white font-sans relative overflow-hidden">

            {/* 1. Background Glow */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-indigo-600/10 blur-[120px]" />
            </div>

            <div className="relative z-10">
                {/* 2. Header Section */}
                <header className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Shield Icon Container */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 ring-1 ring-blue-500/30 text-blue-500">
                                <Icons.Shield />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold uppercase tracking-widest text-white/90">Admin Portal</h1>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm transition-all hover:bg-rose-500/10 hover:text-rose-400"
                        >
                            <Icons.Logout />
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                {/* 3. Main Content */}
                <main className="max-w-7xl mx-auto px-6 py-10">

                    {/* Tab Selection */}
                    <div className="inline-flex p-1 mb-8 rounded-xl bg-white/[0.04] border border-white/10">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white'}`}
                        >
                            User Management
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'logs' ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white'}`}
                        >
                            Activity Logs
                        </button>
                    </div>

                    {/* User Table Card */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-white">System Users</h2>
                                <p className="text-xs text-white/30">Manage and monitor accounts</p>
                            </div>
                            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                                <Icons.Plus />
                                Add New User
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-white/30">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">User Details</th>
                                        <th className="px-6 py-4 font-semibold">Role</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-white/80">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded ring-1 ring-blue-500/20 uppercase">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 text-white/20 hover:text-rose-400 transition-colors">
                                                        <Icons.Trash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-20 text-center text-white/20 italic text-sm">
                                                No users currently in the system.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}