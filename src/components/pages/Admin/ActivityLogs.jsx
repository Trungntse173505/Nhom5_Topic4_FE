import React from 'react';
import useSystemLogsFilter from '../../../hooks/Admin/useSystemLogsFilter';

export default function ActivityLogs() {
    const {
        normalizedLogs,
        loading,
        error,
        pageSize,
        canGoPrev,
        canGoNext,
        draftFromTime,
        draftToTime,
        setDraftFromTime,
        setDraftToTime,
        applyFilters,
        clearFilters,
        reload,
        goPrev,
        goNext,
        changePageSize,
        formatDateTime,
        statusText,
    } = useSystemLogsFilter();

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">Nhật ký hoạt động</h2>


            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-xs text-white/40">
                    {statusText}
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={pageSize}
                        disabled={loading}
                        onChange={(e) => {
                            changePageSize(e.target.value);
                        }}
                        className="px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 disabled:opacity-50"
                    >
                        {[10, 20, 50].map(n => <option key={n} value={n} className="bg-slate-900">{n} / trang</option>)}
                    </select>

                    <button onClick={reload} disabled={loading} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-white/10 disabled:opacity-50">Tải lại</button>
                    <button onClick={goPrev} disabled={!canGoPrev} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-white/10 disabled:opacity-50">Trước</button>
                    <button onClick={goNext} disabled={!canGoNext} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-white/10 disabled:opacity-50">Sau</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                    <div className="text-xs text-white/50">Từ ngày</div>
                    <input
                        type="date"
                        value={draftFromTime}
                        onChange={(e) => setDraftFromTime(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 disabled:opacity-50"
                    />
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-white/50">Đến ngày</div>
                    <input
                        type="date"
                        value={draftToTime}
                        onChange={(e) => setDraftToTime(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 disabled:opacity-50"
                    />
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={applyFilters}
                        className="px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-400/40 text-xs font-bold text-blue-200 hover:bg-blue-500/30 disabled:opacity-50"
                    >
                        Lọc
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={clearFilters}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:bg-white/10 disabled:opacity-50"
                    >
                        Xóa lọc
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm p-4 rounded-xl mb-4">{error}</div>}

            <div className="space-y-3">
                {normalizedLogs.map((log) => (
                    <div key={log.id} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0">

                                <p className="text-sm font-semibold text-white/90 mt-1">
                                    Name: <span className="text-blue-400">{log.username || '-'}</span>
                                </p>
                                <p className="text-sm text-white/80 mt-1">
                                    Action: <span className="text-white/90">{log.action || '-'}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm md:text-base text-white/90 font-mono font-semibold whitespace-nowrap">
                                    {formatDateTime(log.time)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && !normalizedLogs.length && !error && (
                    <div className="text-sm text-white/40 bg-white/5 border border-white/10 p-4 rounded-xl">Không có dữ liệu nhật ký.</div>
                )}
            </div>
        </div>
    );
}
