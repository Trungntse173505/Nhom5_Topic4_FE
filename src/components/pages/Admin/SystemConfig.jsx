import React from 'react';

export default function SystemConfig() {
    return (
        <div className="p-6 max-w-xl">
            <h2 className="text-xl font-bold text-white mb-1">Cấu hình hệ thống</h2>
            <p className="text-sm text-white/40 mb-8">Thiết lập giới hạn lưu trữ và định dạng (FR-04)</p>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-white/50 uppercase mb-2">Giới hạn lưu trữ (GB)</label>
                    <input type="number" defaultValue="50" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-white/50 uppercase mb-2">Định dạng file cho phép</label>
                    <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                        {['.jpg, .png', '.mp3, .wav', '.txt, .csv', 'YOLO, VOC, JSON'].map((fmt) => (
                            <div key={fmt} className="flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
                                <input type="checkbox" defaultChecked className="rounded border-white/20 bg-transparent text-blue-600" />
                                <span>{fmt}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors">
                    Lưu cấu hình
                </button>
            </div>
        </div>
    );
}