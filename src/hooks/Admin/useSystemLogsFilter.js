import { useCallback, useEffect, useMemo, useState } from 'react';
import adminApi from '../../api/adminApi';

const formatDateTime = (v) => {
    if (!v || isNaN(new Date(v).getTime())) return String(v || '');
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(new Date(v));
};

const normalizeLog = (raw, index) => ({
    id: raw?.id ?? raw?.logId ?? raw?._id ?? raw?.systemLogId ?? `row-${index}`,
    username: raw?.performedByName ?? raw?.userName ?? raw?.username ?? raw?.email ?? '',
    action: raw?.action ?? raw?.event ?? raw?.operation ?? raw?.message ?? '',
    time: raw?.createdAt ?? raw?.time ?? raw?.timestamp ?? raw?.date ?? '',
});

const isDateOnly = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '').trim());

const toIsoOrEmpty = (v) => {
    const s = String(v || '').trim();
    if (!s) return '';
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toISOString();
};

const toIsoStartOfDayOrEmpty = (v) => {
    const s = String(v || '').trim();
    if (!s) return '';
    if (!isDateOnly(s)) return toIsoOrEmpty(s);
    const d = new Date(`${s}T00:00:00`);
    if (Number.isNaN(d.getTime())) return s;
    return d.toISOString();
};

const toIsoEndOfDayOrEmpty = (v) => {
    const s = String(v || '').trim();
    if (!s) return '';
    if (!isDateOnly(s)) return toIsoOrEmpty(s);
    const d = new Date(`${s}T23:59:59.999`);
    if (Number.isNaN(d.getTime())) return s;
    return d.toISOString();
};

export default function useSystemLogsFilter() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const [draftFromTime, setDraftFromTime] = useState('');
    const [draftToTime, setDraftToTime] = useState('');
    const [appliedFromTime, setAppliedFromTime] = useState('');
    const [appliedToTime, setAppliedToTime] = useState('');

    const fetchLogs = useCallback(async ({ fromTime, toTime } = {}) => {
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...(fromTime ? { fromDate: toIsoStartOfDayOrEmpty(fromTime) } : {}),
                ...(toTime ? { toDate: toIsoEndOfDayOrEmpty(toTime) } : {}),
            };

            const data = await adminApi.filterSystemLogs(payload);
            const items = Array.isArray(data)
                ? data
                : Array.isArray(data?.items)
                  ? data.items
                  : Array.isArray(data?.data)
                    ? data.data
                    : [];
            setLogs(items);
        } catch (e) {
            const d = e?.response?.data;
            setError(String(d?.message || d?.error || e?.message || 'Không thể tải nhật ký hoạt động.'));
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs({ fromTime: '', toTime: '' });
    }, [fetchLogs]);

    const totalCount = logs.length;

    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(totalCount / pageSize));
        if (pageNumber > maxPage) setPageNumber(maxPage);
    }, [totalCount, pageSize, pageNumber]);

    const pagedLogs = useMemo(() => {
        const start = (pageNumber - 1) * pageSize;
        return logs.slice(start, start + pageSize);
    }, [logs, pageNumber, pageSize]);

    const normalizedLogs = useMemo(() => pagedLogs.map(normalizeLog), [pagedLogs]);

    const canGoPrev = pageNumber > 1 && !loading;
    const canGoNext = !loading && pageNumber * pageSize < totalCount;

    const applyFilters = useCallback(() => {
        setPageNumber(1);
        setAppliedFromTime(draftFromTime);
        setAppliedToTime(draftToTime);
        fetchLogs({ fromTime: draftFromTime, toTime: draftToTime });
    }, [draftFromTime, draftToTime, fetchLogs]);

    const clearFilters = useCallback(() => {
        setDraftFromTime('');
        setDraftToTime('');
        setPageNumber(1);
        setAppliedFromTime('');
        setAppliedToTime('');
        fetchLogs({ fromTime: '', toTime: '' });
    }, [fetchLogs]);

    const reload = useCallback(
        () => fetchLogs({ fromTime: appliedFromTime, toTime: appliedToTime }),
        [fetchLogs, appliedFromTime, appliedToTime]
    );

    const changePageSize = useCallback((next) => {
        const n = Number(next);
        if (!(n > 0)) return;
        setPageNumber(1);
        setPageSize(n);
    }, []);

    const goPrev = useCallback(() => setPageNumber((p) => Math.max(1, p - 1)), []);
    const goNext = useCallback(() => setPageNumber((p) => p + 1), []);

    const statusText = useMemo(() => {
        if (loading) return 'Đang tải...';
        return `Trang ${pageNumber} · Hiển thị: ${normalizedLogs.length} / ${totalCount}`;
    }, [loading, pageNumber, normalizedLogs.length, totalCount]);

    return {
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
    };
}

