import React, { useState } from 'react';
import { useAdminRules } from '../../../hooks/Admin/useAdminRules';

// --- DỊCH ---
const CATEGORY_MAP = { Reward: "Thưởng", Bonus: "Thưởng thêm", Penalty: "Phạt", Threshold: "Ngưỡng điểm", Limit: "Giới hạn" };
const RULENAME_MAP = {
    Reward_Perfect: "Thưởng hoàn thành xuất sắc", Bonus_HighRate: "Thưởng tỷ lệ hoàn thành cao",
    Penalty_Reject_2: "Phạt sửa lần 2", Penalty_Reject_3: "Phạt sửa lần 3", Penalty_Task_Fail: "Phạt thất bại (Fail)",
    High_Threshold: "Mốc điểm tín nhiệm cao", Low_Threshold: "Mốc điểm tín nhiệm trung bình",
    Max_Task_High: "Giới hạn Task (Uy tín cao)", Max_Task_Normal: "Giới hạn Task (Uy tín vừa)",
    Max_Task_Warning: "Giới hạn Task (Cảnh báo)", Max_Consecutive_Fails: "Giới hạn Fail liên tiếp"
};

const FormField = ({ label, isSelect, wrapperClass = "", children, ...props }) => (
    <div className={`bg-white/5 p-4 rounded-xl ${wrapperClass}`}>
        <label className="text-white/40 block mb-1 text-sm font-bold">{label}</label>
        {isSelect 
            ? <select {...props} className="w-full bg-white/10 rounded-lg p-2 text-white border border-white/20 outline-none focus:border-blue-500 transition-all">{children}</select>
            : <input {...props} className="w-full bg-white/10 rounded-lg p-2 text-white border border-white/20 outline-none focus:border-blue-500 transition-all" />
        }
    </div>
);

export default function AdminRules() {
    const { rules, loading, error, isUpdating, fetchRules, updateRule } = useAdminRules();
    const [editForm, setEditForm] = useState(null);

    // --- HÀM HELPER & LOGIC ---
    const getBadgeClass = (cat = '') => {
        const c = cat.toLowerCase();
        if (c.includes('reward') || c.includes('bonus')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (c.includes('penalty')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        if (c.includes('limit')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    };

    const formatValue = (v, cat, name) => {
        if (cat === "Limit") return `${v} ${name === "Max_Consecutive_Fails" ? 'lần' : 'task'}`;
        return `${v > 0 && cat !== "Threshold" ? '+' : ''}${v} điểm`;
    };

    const handleChange = (field, val) => setEditForm(p => ({ ...p, [field]: val }));
    const closeEdit = () => !isUpdating && setEditForm(null);

    const handleSaveEdit = async () => {
        if (isUpdating) return; 
        const { ruleID, value, description, isActive } = editForm;
        const res = await updateRule(ruleID, { value: Number(value), description, isActive });
        
        res.success ? setEditForm(null) : alert(`Lỗi: ${res.error}`);
    };

    return (
        <div className="p-6 min-h-screen bg-[#050B1A] text-white font-sans">
            {/* HEADER */}
            <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Quản lí Quy tắc</h1>
                    <p className="text-sm text-white/40 mt-1">Quản lý điểm thưởng, phạt và các giới hạn hệ thống</p>
                </div>
                <button onClick={fetchRules} disabled={loading} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold border border-white/10 transition-all disabled:opacity-50">
                    {loading ? 'Đang tải...' : '↻ Tải lại'}
                </button>
            </div>

            {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

            {/* BẢNG DỮ LIỆU */}
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
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-white/50">Đang tải dữ liệu cấu hình...</td></tr>
                        ) : rules.length === 0 && !error ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-white/50">Không có dữ liệu quy tắc nào.</td></tr>
                        ) : (
                            rules.map((rule) => (
                                <tr key={rule.ruleID} className="hover:bg-white/[0.03] transition-all">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-white/90">{RULENAME_MAP[rule.ruleName] || rule.ruleName}</div>
                                        <div className="text-xs text-white/40 mt-1 line-clamp-1" title={rule.description}>{rule.description}</div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${getBadgeClass(rule.category)}`}>
                                            {CATEGORY_MAP[rule.category] || rule.category?.toUpperCase()}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-sm font-bold ${rule.value > 0 && !['Limit', 'Threshold'].includes(rule.category) ? 'text-emerald-400' : rule.value < 0 ? 'text-rose-400' : 'text-white/80'}`}>
                                            {formatValue(rule.value, rule.category, rule.ruleName)}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${rule.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                                            {rule.isActive ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setEditForm({ ...rule })} className="text-xs bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/5 transition-colors font-bold">
                                            Chỉnh sửa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CHỈNH SỬA RULE (Chỉ hiện khi editForm != null) */}
            {editForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeEdit}></div>
                    <div className="relative bg-[#0A1225] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        
                        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h2 className="text-xl font-bold text-blue-400">Chỉnh sửa Quy tắc</h2>
                            <button onClick={closeEdit} disabled={isUpdating} className="text-white/40 hover:text-white text-2xl transition-colors disabled:opacity-50">✕</button>
                        </div>
                        
                        <div className="p-8 space-y-4">
                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-4">
                                <p className="text-xs text-blue-400/60 font-bold mb-1">Quy tắc: {RULENAME_MAP[editForm.ruleName] || editForm.ruleName}</p>
                                <p className="text-sm text-blue-100 font-semibold">Thuộc nhóm: {CATEGORY_MAP[editForm.category] || editForm.category}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <FormField type="number" label="Giá trị (Value)" value={editForm.value} disabled={isUpdating} onChange={e => handleChange('value', e.target.value)} />
                                <FormField label="Mô tả chi tiết" value={editForm.description} disabled={isUpdating} onChange={e => handleChange('description', e.target.value)} />
                                <FormField isSelect label="Trạng thái hoạt động" value={String(editForm.isActive)} disabled={isUpdating} onChange={e => handleChange('isActive', e.target.value === 'true')}>
                                    <option value="true">Đang Bật (Active)</option>
                                    <option value="false">Đã Tắt (Inactive)</option>
                                </FormField>
                            </div>
                        </div>
                        
                        <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                            <button onClick={handleSaveEdit} disabled={isUpdating} className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                            <button onClick={closeEdit} disabled={isUpdating} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}