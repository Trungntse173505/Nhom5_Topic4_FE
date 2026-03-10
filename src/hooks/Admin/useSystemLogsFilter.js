import { useCallback, useEffect, useMemo, useState } from 'react';
import adminApi from '../../api/adminApi';

const extractLogsPayload = (p) => {
    if (Array.isArray(p)) return { items: p, meta: {} };
    if (!p || typeof p !== 'object') return { items: [], meta: {} };
    if (p.result) return extractLogsPayload(p.result);
    return { items: p.items || p.data || [], meta: p };
};

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

const getFirstString = (...vals) =>
    vals.find(
        (v) => (typeof v === 'string' && v.trim()) || (typeof v === 'number' && Number.isFinite(v))
    )?.toString() || '';

const asText = (v) => {
    if (typeof v === 'string') {
        const s = v.trim();
        return s ? s : '';
    }
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
    return '';
};

const getUserIdText = (...candidates) => {
    for (const c of candidates) {
        const direct = asText(c);
        if (direct) return direct;

        if (c && typeof c === 'object') {
            const fromObj = getFirstString(c.id, c.userId, c.userID, c.user_id, c.actorId, c.actorID);
            if (fromObj) return fromObj;
        }
    }
    return '';
};

const getUserText = (...candidates) => {
    for (const c of candidates) {
        const direct = asText(c);
        if (direct) return direct;

        if (c && typeof c === 'object') {
            const fromObj = getFirstString(
                c.fullName,
                c.FullName,
                c.name,
                c.Name,
                c.username,
                c.userName,
                c.UserName,
                c.email,
                c.Email,
                c.id,
                c.userId,
                c.userID,
                c.user_id
            );
            if (fromObj) return fromObj;
        }
    }
    return '';
};

const normalizeLog = (raw, index) => ({
    id: raw?.id ?? raw?.logId ?? raw?._id ?? raw?.systemLogId ?? `row-${index}`,
    userId: getUserIdText(
        raw?.userId,
        raw?.actorId,
        raw?.createdByUserId,
        raw?.user,
        raw?.actor,
        raw?.createdByUser
    ),
    user: getUserText(
        raw?.user,
        raw?.actor,
        raw?.createdByUser,
        raw?.createdBy,
        raw?.createdByName,
        raw?.actorName,
        raw?.username,
        raw?.userName,
        raw?.email,
        raw?.fullName
    ),
    action: getFirstString(raw?.action, raw?.event, raw?.operation, raw?.message, raw?.description),
    target: getFirstString(
        raw?.target,
        raw?.object,
        raw?.resource,
        raw?.entity,
        raw?.entityName,
        raw?.entityId,
        raw?.subject
    ),
    time: getFirstString(raw?.time, raw?.createdAt, raw?.createdTime, raw?.timestamp, raw?.loggedAt, raw?.date),
    raw,
});

const toIsoOrEmpty = (v) => {
    const s = String(v || '').trim();
    if (!s) return '';
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toISOString();
};

export default function useSystemLogsFilter() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(null);

    const [draftFromTime, setDraftFromTime] = useState('');
    const [draftToTime, setDraftToTime] = useState('');
    const [draftUserId, setDraftUserId] = useState('');
    const [draftAction, setDraftAction] = useState('');

    const [appliedFilters, setAppliedFilters] = useState({
        fromTime: '',
        toTime: '',
        userId: '',
        action: '',
    });

    const fetchLogs = useCallback(
        async (pn = pageNumber, ps = pageSize, filters = appliedFilters) => {
            setLoading(true);
            setError('');
            try {
                const payload = {
                    pageNumber: pn,
                    pageSize: ps,
                    ...(filters?.fromTime
                        ? { fromTime: toIsoOrEmpty(filters.fromTime), fromDate: toIsoOrEmpty(filters.fromTime) }
                        : {}),
                    ...(filters?.toTime
                        ? { toTime: toIsoOrEmpty(filters.toTime), toDate: toIsoOrEmpty(filters.toTime) }
                        : {}),
                    ...(filters?.userId ? { userId: String(filters.userId).trim() } : {}),
                    ...(filters?.action ? { action: String(filters.action).trim() } : {}),
                };

                const { items, meta } = extractLogsPayload(await adminApi.filterSystemLogs(payload));
                setLogs(Array.isArray(items) ? items : []);
                const c =
                    meta?.totalCount ??
                    meta?.total ??
                    meta?.count ??
                    meta?.totalItems ??
                    meta?.pagination?.totalCount ??
                    meta?.pagination?.total;
                setTotalCount(typeof c === 'number' ? c : null);
            } catch (e) {
                const d = e?.response?.data;
                setError(String(d?.message || d?.error || e?.message || 'Không thể tải nhật ký hoạt động.'));
                setLogs([]);
                setTotalCount(null);
            } finally {
                setLoading(false);
            }
        },
        [pageNumber, pageSize, appliedFilters]
    );

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const normalizedLogs = useMemo(() => logs.map(normalizeLog), [logs]);
    const canGoPrev = pageNumber > 1 && !loading;
    const canGoNext =
        !loading && (typeof totalCount !== 'number' || (pageNumber && pageSize && pageNumber * pageSize < totalCount));

    const applyFilters = useCallback(() => {
        const next = {
            fromTime: draftFromTime,
            toTime: draftToTime,
            userId: draftUserId,
            action: draftAction,
        };
        setPageNumber(1);
        setAppliedFilters(next);
        fetchLogs(1, pageSize, next);
    }, [draftFromTime, draftToTime, draftUserId, draftAction, fetchLogs, pageSize]);

    const clearFilters = useCallback(() => {
        setDraftFromTime('');
        setDraftToTime('');
        setDraftUserId('');
        setDraftAction('');
        setPageNumber(1);
        const next = { fromTime: '', toTime: '', userId: '', action: '' };
        setAppliedFilters(next);
        fetchLogs(1, pageSize, next);
    }, [fetchLogs, pageSize]);

    const reload = useCallback(() => fetchLogs(), [fetchLogs]);

    const changePageSize = useCallback(
        (next) => {
            const n = Number(next);
            if (!(n > 0)) return;
            setPageNumber(1);
            setPageSize(n);
        },
        [setPageNumber, setPageSize]
    );

    const goPrev = useCallback(() => setPageNumber((p) => Math.max(1, p - 1)), []);
    const goNext = useCallback(() => setPageNumber((p) => p + 1), []);

    const statusText = useMemo(() => {
        if (loading) return 'Đang tải...';
        return `Trang ${pageNumber} · Hiển thị: ${normalizedLogs.length}${
            typeof totalCount === 'number' ? ` / ${totalCount}` : ''
        }`;
    }, [loading, pageNumber, normalizedLogs.length, totalCount]);

    return {
        logs,
        normalizedLogs,
        loading,
        error,
        pageNumber,
        pageSize,
        totalCount,
        canGoPrev,
        canGoNext,
        draftFromTime,
        draftToTime,
        draftUserId,
        draftAction,
        appliedFilters,
        setDraftFromTime,
        setDraftToTime,
        setDraftUserId,
        setDraftAction,
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

