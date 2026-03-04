import React, { useMemo, useRef } from 'react';
import { useSystemConfig } from '../../../hooks/useSystemConfig';

export default function SystemConfig() {
    const {
        systemConfig,
        systemConfigLoading,
        systemConfigError,
        updatingSystemConfig,
        updateSystemConfigError,
        updateSystemConfig,
    } = useSystemConfig();

    const storageLimitDefault = systemConfig?.storageLimitGb ?? 50;
    const formRef = useRef(null);

    const formats = useMemo(() => {
        const fromApi = systemConfig?.allowedFormats;
        if (Array.isArray(fromApi) && fromApi.length) return fromApi;
        return ['.jpg, .png', '.mp3, .wav', '.txt, .csv', 'YOLO, VOC, JSON'];
    }, [systemConfig?.allowedFormats]);

    const handleSave = async () => {
        if (systemConfigLoading || updatingSystemConfig) return;

        const id = systemConfig?.id ?? systemConfig?.raw?.id;
        if (!id) {
            alert('Không tìm thấy id cấu hình để cập nhật.');
            return;
        }

        const formEl = formRef.current;
        const fd = formEl ? new FormData(formEl) : null;

        const storageLimit = fd ? fd.get('storageLimitGb') : null;
        const parsedStorage = Number(storageLimit);
        const storage = Number.isFinite(parsedStorage) ? parsedStorage : storageLimitDefault;

        const checkedFormats = fd ? fd.getAll('allowedFormats') : [];
        const allowedFormats = checkedFormats.length ? checkedFormats : formats;

        const payload = {
            storageLimitGb: storage,
            storageLimitGB: storage,
            storageLimit: storage,
            allowedFormats,
            allowedFileFormats: allowedFormats,
            fileFormats: allowedFormats,
            formats: allowedFormats,
        };

        const res = await updateSystemConfig(id, payload, { silent: true });
        if (res?.success) alert('Lưu cấu hình thành công!');
        else alert('Lỗi: ' + (res?.error || 'Không thể lưu cấu hình.'));
    };

    return (
        <div className="p-6 max-w-xl">
            <h2 className="text-xl font-bold text-white mb-1">Cấu hình hệ thống</h2>
            <p className="text-sm text-white/40 mb-8">Thiết lập giới hạn lưu trữ và định dạng (FR-04)</p>

            {systemConfigLoading && <p className="text-xs text-white/40 mb-4">Đang tải cấu hình...</p>}
            {systemConfigError && <p className="text-xs text-rose-400 mb-4">{systemConfigError}</p>}
            {updateSystemConfigError && <p className="text-xs text-rose-400 mb-4">{updateSystemConfigError}</p>}

            <form ref={formRef} className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label className="block text-xs font-bold text-white/50 uppercase mb-2">Giới hạn lưu trữ (GB)</label>
                    <input
                        name="storageLimitGb"
                        type="number"
                        key={String(storageLimitDefault)}
                        defaultValue={storageLimitDefault}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-white/50 uppercase mb-2">Định dạng file cho phép</label>
                    <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                        {formats.map((fmt) => (
                            <div key={fmt} className="flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
                                <input
                                    type="checkbox"
                                    name="allowedFormats"
                                    value={fmt}
                                    defaultChecked
                                    className="rounded border-white/20 bg-transparent text-blue-600"
                                />
                                <span>{fmt}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={systemConfigLoading || updatingSystemConfig}
                    className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {updatingSystemConfig ? 'Đang lưu...' : 'Lưu cấu hình'}
                </button>
            </form>
        </div>
    );
}
