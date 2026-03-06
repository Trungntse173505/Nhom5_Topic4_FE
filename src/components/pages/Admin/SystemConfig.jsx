import React, { useMemo, useRef } from 'react';
import { useSystemConfig } from '../../../hooks/Admin/useSystemConfig';

export default function SystemConfig() {
    // Đổi tên biến (alias) cho ngắn gọn dễ gọi ở dưới
    const {
        systemConfig: cfg,
        systemConfigLoading: loading,
        systemConfigError: err,
        updatingSystemConfig: updating,
        updateSystemConfigError: updateErr,
        updateSystemConfig: updateCfg,
    } = useSystemConfig();

    const formRef = useRef(null);
    const limitDefault = cfg?.storageLimitGb ?? 50;

    const formats = useMemo(() => {
        const apiFormats = cfg?.allowedFormats;
        return Array.isArray(apiFormats) && apiFormats.length
            ? apiFormats
            : ['.jpg, .png', '.mp3, .wav', '.txt, .csv', 'YOLO, VOC, JSON'];
    }, [cfg?.allowedFormats]);

    const handleSave = async () => {
        if (loading || updating) return;

        const id = cfg?.id ?? cfg?.raw?.id;
        if (!id) return alert('Không tìm thấy id cấu hình để cập nhật.');

        // Rút gọn xử lý form data
        const fd = formRef.current ? new FormData(formRef.current) : new FormData();

        const parsedStorage = Number(fd.get('storageLimitGb'));
        const storage = Number.isFinite(parsedStorage) ? parsedStorage : limitDefault;

        const checkedFormats = fd.getAll('allowedFormats');
        const allowed = checkedFormats.length ? checkedFormats : formats;

        // Gọi API với payload gộp
        const res = await updateCfg(id, {
            storageLimitGb: storage, storageLimitGB: storage, storageLimit: storage,
            allowedFormats: allowed, allowedFileFormats: allowed, fileFormats: allowed, formats: allowed,
        }, { silent: true });

        // Gộp alert xử lý kết quả
        alert(res?.success ? 'Lưu cấu hình thành công!' : `Lỗi: ${res?.error || 'Không thể lưu cấu hình.'}`);
    };

    // Biến gom trạng thái để disable nút
    const isBusy = loading || updating;

    return (
        <div className="p-6 max-w-xl">
            <h2 className="text-xl font-bold text-white mb-1">Cấu hình hệ thống</h2>
            <p className="text-sm text-white/40 mb-8">Thiết lập giới hạn lưu trữ và định dạng (FR-04)</p>

            {loading && <p className="text-xs text-white/40 mb-4">Đang tải cấu hình...</p>}
            {err && <p className="text-xs text-rose-400 mb-4">{err}</p>}
            {updateErr && <p className="text-xs text-rose-400 mb-4">{updateErr}</p>}

            <form ref={formRef} className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label className="block text-xs font-bold text-white/50 uppercase mb-2">Giới hạn lưu trữ (GB)</label>
                    <input
                        name="storageLimitGb" type="number"
                        key={String(limitDefault)} defaultValue={limitDefault}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-white/50 uppercase mb-2">Định dạng file cho phép</label>
                    <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                        {formats.map((fmt) => (
                            <div key={fmt} className="flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
                                <input
                                    type="checkbox" name="allowedFormats" value={fmt} defaultChecked
                                    className="rounded border-white/20 bg-transparent text-blue-600"
                                />
                                <span>{fmt}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    type="button" onClick={handleSave} disabled={isBusy}
                    className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {updating ? 'Đang lưu...' : 'Lưu cấu hình'}
                </button>
            </form>
        </div>
    );
}