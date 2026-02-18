export default function AdminLayout({ children, activeTab, setActiveTab }) {
    const tabs = [
        { id: 'overview', name: 'Tổng quan' },
        { id: 'users', name: 'Người dùng' },
        { id: 'logs', name: 'Nhật ký' },
        { id: 'config', name: 'Cấu hình' },
    ];

    return (
        <div className="min-h-screen bg-[#0B1120]">
            {/* Header Tab Navigation */}
            <nav className="border-b border-white/10 bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 flex gap-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 text-sm font-bold transition-all border-b-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500'
                                }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </nav>
            {children}
        </div>
    );
}