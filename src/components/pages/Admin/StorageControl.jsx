import React from 'react';

const mockProjects = [
    { id: '1', name: 'Dự án Mobile App', storageUsed: 15.5, storageLimit: 50, firebaseUsage: 120, cloudUsage: 300 },
    { id: '2', name: 'Website Bán Hàng', storageUsed: 42.1, storageLimit: 50, firebaseUsage: 450, cloudUsage: 150 },
    { id: '3', name: 'Hệ thống AI', storageUsed: 8.7, storageLimit: 100, firebaseUsage: 50, cloudUsage: 800 },
    { id: '4', name: 'Ứng dụng Nội bộ', storageUsed: 49.9, storageLimit: 50, firebaseUsage: 200, cloudUsage: 100 },
];

// Đưa hàm ra ngoài để không bị tạo lại mỗi lần render, chuyển sang nhận trực tiếp %
const getUsageColor = (pct) => pct >= 90 ? 'text-rose-500' : pct >= 70 ? 'text-amber-500' : 'text-emerald-400';

// Component con giúp tái sử dụng các dòng thống kê, tránh lặp code HTML
const StatRow = ({ label, value, valClass = "font-medium text-white/80" }) => (
    <div className="flex justify-between">
        <span className="text-white/40">{label}</span>
        <span className={valClass}>{value}</span>
    </div>
);

export default function StorageMonitor() {
    return (
        <div className="p-6 min-h-screen bg-[#050B1A] text-white font-sans">
            <h1 className="text-2xl font-bold mb-2">Giám sát Tài nguyên (Storage Control)</h1>
            <p className="text-white/40 mb-8 text-sm">Theo dõi chi tiết dung lượng thực tế đang dùng trên Firebase/Cloud cho từng dự án.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProjects.map(({ id, name, storageUsed, storageLimit, firebaseUsage, cloudUsage }) => {
                    const pct = (storageUsed / storageLimit) * 100;
                    const colorClass = getUsageColor(pct);

                    return (
                        <div key={id} className="bg-[#0A1225] border border-white/10 rounded-2xl p-6 shadow-xl hover:border-blue-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-lg font-bold truncate">{name}</h2>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/5 ${colorClass}`}>
                                    {pct.toFixed(1)}%
                                </span>
                            </div>

                            {/* Thanh tiến trình (Progress Bar) */}
                            <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                                <div 
                                    className={`h-2 rounded-full ${colorClass.replace('text', 'bg')}`} 
                                    style={{ width: `${pct}%` }} 
                                />
                            </div>

                            {/* Thông số chi tiết */}
                            <div className="space-y-2 text-sm">
                                <StatRow label="Đã dùng:" value={`${storageUsed} GB / ${storageLimit} GB`} valClass="font-bold" />
                                <StatRow label="Firebase Usage:" value={`${firebaseUsage} requests`} />
                                <StatRow label="Cloud Storage:" value={`${cloudUsage} files`} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}