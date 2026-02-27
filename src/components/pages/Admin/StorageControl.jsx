import React, { useState } from 'react';

// Dữ liệu giả lập (Mock Data) để hiển thị
const mockProjects = [
    { id: '1', name: 'Dự án Mobile App', storageUsed: 15.5, storageLimit: 50, firebaseUsage: 120, cloudUsage: 300 },
    { id: '2', name: 'Website Bán Hàng', storageUsed: 42.1, storageLimit: 50, firebaseUsage: 450, cloudUsage: 150 },
    { id: '3', name: 'Hệ thống AI', storageUsed: 8.7, storageLimit: 100, firebaseUsage: 50, cloudUsage: 800 },
    { id: '4', name: 'Ứng dụng Nội bộ', storageUsed: 49.9, storageLimit: 50, firebaseUsage: 200, cloudUsage: 100 },
];

export default function StorageMonitor() {
    // Hàm tính toán màu sắc dựa trên % dung lượng đã dùng
    const getUsageColor = (used, limit) => {
        const percentage = (used / limit) * 100;
        if (percentage >= 90) return 'text-rose-500'; // Sắp đầy
        if (percentage >= 70) return 'text-amber-500'; // Cảnh báo
        return 'text-emerald-400'; // An toàn
    };

    return (
        <div className="p-6 min-h-screen bg-[#050B1A] text-white font-sans">
            <h1 className="text-2xl font-bold mb-2">Giám sát Tài nguyên (Storage Control)</h1>
            <p className="text-white/40 mb-8 text-sm">Theo dõi chi tiết dung lượng thực tế đang dùng trên Firebase/Cloud cho từng dự án.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProjects.map((project) => {
                    const usagePercentage = ((project.storageUsed / project.storageLimit) * 100).toFixed(1);
                    const colorClass = getUsageColor(project.storageUsed, project.storageLimit);

                    return (
                        <div key={project.id} className="bg-[#0A1225] border border-white/10 rounded-2xl p-6 shadow-xl hover:border-blue-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-lg font-bold truncate">{project.name}</h2>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/5 ${colorClass}`}>
                                    {usagePercentage}%
                                </span>
                            </div>

                            {/* Thanh tiến trình (Progress Bar) */}
                            <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                                <div
                                    className={`h-2 rounded-full ${colorClass.replace('text', 'bg')}`}
                                    style={{ width: `${usagePercentage}%` }}
                                ></div>
                            </div>

                            {/* Thông số chi tiết */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-white/40">Đã dùng:</span>
                                    <span className="font-bold">{project.storageUsed} GB / {project.storageLimit} GB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Firebase Usage:</span>
                                    <span className="font-medium text-white/80">{project.firebaseUsage} requests</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Cloud Storage:</span>
                                    <span className="font-medium text-white/80">{project.cloudUsage} files</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}