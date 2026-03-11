import React, { useState } from 'react';

// --- DỮ LIỆU MẪU (Mock Data) ---
// Sau này sẽ được thay thế bằng data lấy từ API (Hook)
const MOCK_RULES = [
    { ruleID: 1, ruleName: "Reward_Perfect", value: 20, category: "Reward", description: "Hoàn thành ngay lần đầu (0 reject)", isActive: true },
    { ruleID: 2, ruleName: "Bonus_HighRate", value: 2, category: "Bonus", description: "Thưởng thêm nếu RateComplete > 95%", isActive: true },
    { ruleID: 3, ruleName: "Penalty_Reject_2", value: -5, category: "Penalty", description: "Trừ điểm khi Approve ở lần sửa 2", isActive: true },
    { ruleID: 5, ruleName: "Penalty_Task_Fail", value: -20, category: "Penalty", description: "Task bị Fail (Reject lần 4)", isActive: true },
    { ruleID: 6, ruleName: "High_Threshold", value: 50, category: "Threshold", description: "Ngưỡng >= 50đ", isActive: true },
    { ruleID: 8, ruleName: "Max_Task_High", value: 3, category: "Limit", description: "Max 3 task", isActive: true },
];

// Component phụ giúp render Form Input (Tái sử dụng style của dự án)
const FormField = ({ label, isSelect, wrapperClass = "", children, ...props }) => (
    <div className={`bg-white/5 p-4 rounded-xl ${wrapperClass}`}>
        <label className="text-white/40 block mb-1 text-sm font-bold">{label}</label>
        {isSelect ? (
            <select {...props} className="w-full bg-white/10 rounded-lg p-2 text-white border border-white/20 outline-none focus:border-blue-500 transition-all">{children}</select>
        ) : (
            <input {...props} className="w-full bg-white/10 rounded-lg p-2 text-white border border-white/20 outline-none focus:border-blue-500 transition-all" />
        )}
    </div>
);

export default function AdminRules() {
    // State UI (Sẽ thay bằng hook sau)
    const [rules, setRules] = useState(MOCK_RULES);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState(null);

    // Hàm xác định màu sắc cho từng loại Badge (Category)
    const getCategoryBadge = (category) => {
        const cat = category.toLowerCase();
        if (cat.includes('reward') || cat.includes('bonus')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (cat.includes('penalty')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        if (cat.includes('limit')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'; // Threshold & others
    };

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN TẠM THỜI (Dành cho UI) ---
    const openEditModal = (rule) => {
        setEditForm({ ...rule });
        setIsEditOpen(true);
    };

    const handleSaveEdit = () => {
        // Tạm thời update local state để test UI
        setRules(prev => prev.map(r => r.ruleID === editForm.ruleID ? editForm : r));
        setIsEditOpen(false);
        // Tương lai gắn hook: await updateRule(editForm.ruleID, editForm);
    };

    const handleToggleStatus = (rule) => {
        if (!window.confirm(`Bạn muốn ${rule.isActive ? 'tắt' : 'bật'} luật này?`)) return;
        setRules(prev => prev.map(r => r.ruleID === rule.ruleID ? { ...r, isActive: !r.isActive } : r));
        // Tương lai gắn hook gọi API PUT ở đây
    };

    return (
        <div className="p-6 min-h-screen bg-[#050B1A] text-white font-sans">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Cấu hình Quy tắc (Rules)</h1>
                    <p className="text-sm text-white/40 mt-1">Quản lý điểm thưởng, phạt và các giới hạn hệ thống</p>
                </div>
                {/* Nút Reload giả định */}
                <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold border border-white/10 transition-all">
                    ↻ Tải lại
                </button>
            </div>

            {/* --- BẢNG DANH SÁCH RULES --- */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/40 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Tên quy tắc</th>
                            <th className="px-6 py-4 text-center">Phân loại</th>
                            <th className="px-6 py-4 text-center">Giá trị</th>
                            <th className="px-6 py-4 text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {rules.length === 0 && (
                            <tr><td className="px-6 py-6 text-sm text-white/50 text-center" colSpan={5}>Không có dữ liệu.</td></tr>
                        )}
                        {rules.map((rule) => (
                            <tr key={rule.ruleID} className="hover:bg-white/[0.03] transition-all">
                                {/* Tên & Mô tả */}
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-white/90">{rule.ruleName}</div>
                                    <div className="text-xs text-white/40 mt-1 line-clamp-1" title={rule.description}>
                                        {rule.description}
                                    </div>
                                </td>
                                
                                {/* Phân loại (Category) */}
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${getCategoryBadge(rule.category)}`}>
                                        {rule.category.toUpperCase()}
                                    </span>
                                </td>

                                {/* Giá trị (Value) */}
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-sm font-bold ${rule.value > 0 ? 'text-emerald-400' : rule.value < 0 ? 'text-rose-400' : 'text-white/80'}`}>
                                        {rule.value > 0 ? `+${rule.value}` : rule.value}
                                    </span>
                                </td>

                                {/* Trạng thái */}
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${rule.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                                        {rule.isActive ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                                    </span>
                                </td>

                                {/* Thao tác */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => openEditModal(rule)} 
                                            className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/5 transition-colors"
                                        >
                                            Sửa
                                        </button>
                                        <button 
                                            onClick={() => handleToggleStatus(rule)} 
                                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${rule.isActive ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'}`}
                                        >
                                            {rule.isActive ? 'Tắt' : 'Bật'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL CHỈNH SỬA RULE --- */}
            {isEditOpen && editForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditOpen(false)}></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-[#0A1225] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h2 className="text-xl font-bold text-blue-400">Chỉnh sửa Quy tắc</h2>
                            <button onClick={() => setIsEditOpen(false)} className="text-white/40 hover:text-white text-2xl transition-colors">✕</button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-8 space-y-4">
                            {/* Thông tin readonly */}
                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-4">
                                <p className="text-xs text-blue-400/60 uppercase font-bold mb-1">Mã Rule: {editForm.ruleName}</p>
                                <p className="text-sm text-blue-100 font-semibold">Thuộc nhóm: {editForm.category}</p>
                            </div>

                            {/* Các field chỉnh sửa được */}
                            <div className="grid grid-cols-1 gap-4">
                                <FormField 
                                    type="number" 
                                    label="Giá trị (Value)" 
                                    value={editForm.value} 
                                    onChange={e => setEditForm(p => ({ ...p, value: Number(e.target.value) }))} 
                                />
                                
                                <FormField 
                                    label="Mô tả chi tiết" 
                                    value={editForm.description} 
                                    onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} 
                                />

                                <FormField 
                                    isSelect 
                                    label="Trạng thái hoạt động" 
                                    value={editForm.isActive ? 'true' : 'false'} 
                                    onChange={e => setEditForm(p => ({ ...p, isActive: e.target.value === 'true' }))}
                                >
                                    <option value="true">Đang Bật (Active)</option>
                                    <option value="false">Đã Tắt (Inactive)</option>
                                </FormField>
                            </div>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                            <button 
                                onClick={handleSaveEdit} 
                                className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-bold transition-all"
                            >
                                Lưu thay đổi
                            </button>
                            <button 
                                onClick={() => setIsEditOpen(false)} 
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