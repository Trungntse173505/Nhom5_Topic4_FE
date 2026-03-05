import React, { useCallback, useEffect, useMemo, useState } from 'react';
import adminApi from '../../../api/adminApi';

const extractLogsPayload = (p) => {
    if (Array.isArray(p)) return { items: p, meta: {} };
    if (!p || typeof p !== 'object') return { items: [], meta: {} };
    if (p.result) return extractLogsPayload(p.result);
    return { items: p.items || p.data || [], meta: p };
};

const formatDateTime = (v) => {
    if (!v || isNaN(new Date(v).getTime())) return String(v || '');
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).format(new Date(v));
};

const getFirstString = (...vals) => 
    vals.find(v => (typeof v === 'string' && v.trim()) || (typeof v === 'number' && Number.isFinite(v)))?.toString() || '';

const normalizeLog = (raw, index) => ({
    id: raw?.id ?? raw?.logId ?? raw?._id ?? raw?.systemLogId ?? `row-${index}`,
    user: getFirstString(raw?.user, raw?.username, raw?.userName, raw?.email, raw?.actorName, raw?.createdBy, raw?.createdByName, raw?.actor?.userName, raw?.actor?.email),
    action: getFirstString(raw?.action, raw?.event, raw?.operation, raw?.message, raw?.description),
    target: getFirstString(raw?.target, raw?.object, raw?.resource, raw?.entity, raw?.entityName, raw?.entityId, raw?.subject),
    time: getFirstString(raw?.time, raw?.createdAt, raw?.createdTime, raw?.timestamp, raw?.loggedAt, raw?.date),
    raw
});

export default function ActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(null);

    const fetchLogs = useCallback(async (pn = pageNumber, ps = pageSize) => {
        setLoading(true); setError('');
        try {
            const { items, meta } = extractLogsPayload(await adminApi.filterSystemLogs({ pageNumber: pn, pageSize: ps }));
            setLogs(Array.isArray(items) ? items : []);
            const c = meta?.totalCount ?? meta?.total ?? meta?.count ?? meta?.totalItems ?? meta?.pagination?.totalCount ?? meta?.pagination?.total;
            setTotalCount(typeof c === 'number' ? c : null);
        } catch (e) {
            const d = e?.response?.data;
            setError(String(d?.message || d?.error || e?.message || 'Không thể tải nhật ký hoạt động.'));
            setLogs([]); setTotalCount(null);
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const normalizedLogs = useMemo(() => logs.map(normalizeLog), [logs]);
    const canGoPrev = pageNumber > 1 && !loading;
    const canGoNext = !loading && (typeof totalCount !== 'number' || pageNumber * pageSize < totalCount);

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">Nhật ký hoạt động</h2>
            <p className="text-sm text-white/40 mb-6">Ghi vết toàn bộ thao tác hệ thống</p>

            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-xs text-white/40">
                    {loading ? 'Đang tải...' : `Trang ${pageNumber} · Hiển thị: ${normalizedLogs.length}${typeof totalCount === 'number' ? ` / ${totalCount}` : ''}`}
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={pageSize}
                        disabled={loading}
                        onChange={(e) => {
                            const next = Number(e.target.value);
                            if (next > 0) { setPageNumber(1); setPageSize(next); }
                        }}
                        className="px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 disabled:opacity-50"
                    >
                        {[10, 20, 50].map(n => <option key={n} value={n} className="bg-slate-900">{n} / trang</option>)}
                    </select>
                    
                    <button onClick={() => fetchLogs()} disabled={loading} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-white/10 disabled:opacity-50">Tải lại</button>
                    <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={!canGoPrev} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-white/10 disabled:opacity-50">Trước</button>
                    <button onClick={() => setPageNumber(p => p + 1)} disabled={!canGoNext} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-white/10 disabled:opacity-50">Sau</button>
                </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm p-4 rounded-xl mb-4">{error}</div>}

            <div className="space-y-3">
                {normalizedLogs.map((log) => (
                    <div key={log.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center gap-4">
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                                {log.user ? <span className="text-blue-400">{log.user}</span> : <span className="text-white/60">Hệ thống</span>}
                                {log.action ? <span className="text-white/90"> {log.action}</span> : <span className="text-white/50"> (không có mô tả)</span>}
                            </p>
                            <p className={`text-xs italic truncate ${log.target ? 'text-white/30' : 'text-white/20'}`}>
                                Đối tượng: {log.target || '-'}
                            </p>
                        </div>
                        <span className="text-[10px] text-white/20 font-mono whitespace-nowrap">{formatDateTime(log.time)}</span>
                    </div>
                ))}

                {!loading && !normalizedLogs.length && !error && (
                    <div className="text-sm text-white/40 bg-white/5 border border-white/10 p-4 rounded-xl">Không có dữ liệu nhật ký.</div>
                )}
            </div>
        </div>
    );
}