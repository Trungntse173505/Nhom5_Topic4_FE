import { useCallback, useMemo, useState } from 'react';
import adminRoleApi from '../../api/adminRoleApi';
import axiosClient from '../../api/axiosClient';

const buildParamsSerializer = () => (params) => {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v === null || v === undefined) return;
        sp.append(key, String(v));
      });
      return;
    }
    sp.append(key, String(value));
  });
  return sp.toString();
};

const buildErrorMessage = (err) => {
  const status = err?.response?.status;
  const data = err?.response?.data;

  const message =
    data?.message ||
    data?.detail ||
    data?.title ||
    data?.error ||
    (typeof data === 'string' ? data : null) ||
    err?.message ||
    'Lỗi không xác định';

  return status ? `HTTP ${status}: ${message}` : message;
};

const extractRoleLabel = (raw) => {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'string' || typeof raw === 'number') return String(raw);
  return (
    raw?.roleName ??
    raw?.name ??
    raw?.role ??
    raw?.code ??
    raw?.value ??
    raw?.label ??
    raw?.id ??
    ''
  ).toString();
};

const normalizeRoles = (rawResponse) => {
  const data = rawResponse?.data ?? rawResponse;
  const list =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.roles) && data.roles) ||
    (Array.isArray(data?.data) && data.data) ||
    [];

  const roles = list.map(extractRoleLabel).filter(Boolean);
  const uniqueRoles = Array.from(new Set(roles));
  return { raw: rawResponse ?? null, roles: uniqueRoles, listRaw: list };
};

const normalizeFilteredUsers = (rawResponse) => {
  const data = rawResponse?.data ?? rawResponse;
  const list =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.users) && data.users) ||
    (Array.isArray(data?.items) && data.items) ||
    [];

  return list.map((u, idx) => {
    const id = u?.id ?? u?.userId ?? u?.userID ?? u?.accountId ?? u?.accountID ?? idx;
    const name = u?.name ?? u?.fullName ?? u?.username ?? u?.displayName ?? 'N/A';
    const email = u?.email ?? u?.mail ?? u?.Email ?? 'N/A';
    const rawRole = u?.role ?? u?.roleName ?? u?.Role ?? 'N/A';
    const role = normalizeRoleValue(rawRole) || String(rawRole ?? 'N/A');
    const status =
      u?.status ?? (typeof u?.isActive === 'boolean' ? (u.isActive ? 'Active' : 'Inactive') : u?.isActive) ?? 'N/A';

    return { id: String(id), name: String(name), email: String(email), role: String(role), status: String(status), raw: u };
  });
};

const normalizeRoleValue = (value) => String(value ?? '').toUpperCase().replace(/^ROLE_/, '').trim();

export const useAdminRoles = () => {
  const [rolesState, setRolesState] = useState({ raw: null, roles: [], listRaw: [] });
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(null);

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [appliedRoles, setAppliedRoles] = useState([]);

  const [filterResult, setFilterResult] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState(null);

  const roles = useMemo(() => rolesState.roles, [rolesState.roles]);
  const filteredUsers = useMemo(() => {
    const list = normalizeFilteredUsers(filterResult);
    if (!Array.isArray(appliedRoles) || appliedRoles.length === 0) return list;

    const selectedSet = new Set(appliedRoles.map(normalizeRoleValue).filter(Boolean));
    return list.filter((u) => selectedSet.has(normalizeRoleValue(u.role)));
  }, [filterResult, appliedRoles]);

  const refreshRoles = useCallback(async (config) => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const response = await axiosClient.get(adminRoleApi.allRoles, config);
      setRolesState(normalizeRoles(response));
      setRolesLoading(false);
      return { success: true, data: response };
    } catch (err) {
      const errMsg = buildErrorMessage(err);
      setRolesError(errMsg);
      setRolesLoading(false);
      return { success: false, error: errMsg, status: err?.response?.status, details: err?.response?.data };
    }
  }, []);

  const clearFilter = useCallback(() => {
    setFilterResult(null);
    setFilterError(null);
    setAppliedRoles([]);
  }, []);

  const filterByRoles = useCallback(async (rolesInput, config) => {
    const cleaned =
      Array.isArray(rolesInput)
        ? rolesInput.map((r) => String(r).trim()).filter(Boolean)
        : rolesInput != null
          ? [String(rolesInput).trim()].filter(Boolean)
          : [];

    if (cleaned.length === 0) {
      const errMsg = 'Vui lòng chọn ít nhất 1 role để filter.';
      setFilterError(errMsg);
      return { success: false, error: errMsg };
    }

    setFilterLoading(true);
    setFilterError(null);

    try {
      const params = { roles: cleaned };
      const paramsSerializer = config?.paramsSerializer || buildParamsSerializer();
      const response = await axiosClient.get(adminRoleApi.filterByRoles, { ...(config || {}), params, paramsSerializer });
      const normalized = normalizeFilteredUsers(response);
      const selectedSet = new Set(cleaned.map(normalizeRoleValue).filter(Boolean));
      const users = selectedSet.size ? normalized.filter((u) => selectedSet.has(normalizeRoleValue(u.role))) : normalized;
      setFilterResult(response);
      setAppliedRoles(cleaned);
      setFilterLoading(false);
      return { success: true, data: response, users };
    } catch (err) {
      const errMsg = buildErrorMessage(err);
      setFilterError(errMsg);
      setFilterLoading(false);
      return { success: false, error: errMsg, status: err?.response?.status, details: err?.response?.data };
    }
  }, []);

  return {
    roles,
    rolesLoading,
    rolesError,
    refreshRoles,

    selectedRoles,
    setSelectedRoles,
    appliedRoles,

    filterResult,
    filteredUsers,
    filterLoading,
    filterError,
    filterByRoles,
    clearFilter,
  };
};
