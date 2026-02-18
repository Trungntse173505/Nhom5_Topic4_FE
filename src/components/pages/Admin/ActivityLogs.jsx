import React from 'react';

export default function ActivityLogs() {
    const logs = [
        { id: 'L1', user: 'manager_01', action: 'Tạo dự án mới', target: 'Project Audio A', time: '2024-02-16 14:20' },
        { id: 'L2', user: 'annotator_05', action: 'Gán nhãn Task', target: 'Task-102', time: '2024-02-16 15:10' },
    ];

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">Nhật ký hoạt động</h2>
            <p className="text-sm text-white/40 mb-6">Ghi vết toàn bộ thao tác hệ thống</p>
            <div className="space-y-3">
                {logs.map((log) => (
                    <div key={log.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                        <div>
                            <p className="text-sm text-white/90 font-medium">
                                <span className="text-blue-400">{log.user}</span> {log.action}
                            </p>
                            <p className="text-xs text-white/30 italic">Đối tượng: {log.target}</p>
                        </div>
                        <span className="text-[10px] text-white/20 font-mono">{log.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}