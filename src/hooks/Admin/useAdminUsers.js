import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';

const roleToId = {
  ADMIN: 1,
  MANAGER: 2,
  ANNOTATOR: 3,
  REVIEWER: 4,
};

const buildErrorMessage = (err) => {
  const status = err?.response?.status;
  const data = err?.response?.data;

  let message =
    data?.message ||
    data?.detail ||
    data?.title ||
    data?.error ||
    (typeof data === 'string' ? data : null) ||
    err?.message ||
    'Lỗi không xác định';

  const errors = data?.errors;
  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const firstVal = errors[firstKey];
    const firstMsg = Array.isArray(firstVal) ? firstVal[0] : firstVal;
    if (firstMsg) message = `${message} (${firstKey}: ${firstMsg})`;
  }

  return status ? `HTTP ${status}: ${message}` : message;
};
// Change role
const coerceRoleInt = (rawRole) => {
  if (rawRole === null || rawRole === undefined) return null;
  if (typeof rawRole === 'number' && Number.isFinite(rawRole)) return rawRole;

  const normalizedRole = String(rawRole).toUpperCase().replace(/^ROLE_/, '');
  if (normalizedRole in roleToId) return roleToId[normalizedRole];

  const asInt = Number.parseInt(String(rawRole), 10);
  return Number.isFinite(asInt) ? asInt : null;
};

const coerceRoleName = (role) => {
  if (role === null || role === undefined) return '';
  if (typeof role === 'string') return role.toUpperCase().replace(/^ROLE_/, '');
  if (typeof role === 'number') {
    const roleById = {
      1: 'ADMIN',
      2: 'MANAGER',
      3: 'ANNOTATOR',
      4: 'REVIEWER',
    };
    return roleById[role] || String(role);
  }
  return String(role);
};

const buildFirstLoginRedirectUrl = () => {
  if (typeof window === 'undefined' || !window.location?.origin) return '';
  return `${window.location.origin}/reset-pass`;
};
// Normalize user object from various possible backend shapes to a consistent frontend shape.
const normalizeUser = (u) => {
  const id = u?.id ?? u?.userId ?? u?.userID ?? u?.accountId ?? u?.accountID;
  const name = u?.fullName ?? u?.name ?? u?.username ?? '';
  const email = u?.email ?? '';
  const role = coerceRoleName(u?.role);

  const active = u?.status ?? u?.isActive ?? u?.active;
  const status =
    typeof active === 'boolean'
      ? active
        ? 'Active'
        : 'Inactive'
      : String(active || 'Active');

  return { id: String(id ?? ''), name, email, role, status, raw: u };
};

// Persist "freshly edited" info so refresh/reload doesn't wipe it if backend list is stale.
const OVERRIDES_KEY = 'admin_user_overrides_v1';
const OVERRIDES_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const safeJsonParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const readOverrides = () => {
  if (typeof localStorage === 'undefined') return {};
  const raw = localStorage.getItem(OVERRIDES_KEY);
  const parsed = safeJsonParse(raw);
  return parsed && typeof parsed === 'object' ? parsed : {};
};

const writeOverrides = (overrides) => {
  if (typeof localStorage === 'undefined') return;
  if (!overrides || typeof overrides !== 'object') return;
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
};

const saveOverride = (id, patch) => {
  const userId = String(id || '').trim();
  if (!userId) return;

  const safePatch = patch && typeof patch === 'object' ? patch : {};
  const next = { ...safePatch, _ts: Date.now() };

  const overrides = readOverrides();
  const prev = overrides[userId] && typeof overrides[userId] === 'object' ? overrides[userId] : {};
  writeOverrides({ ...overrides, [userId]: { ...prev, ...next } });
};

const deleteOverride = (id) => {
  const userId = String(id || '').trim();
  if (!userId) return;
  const overrides = readOverrides();
  if (!overrides || typeof overrides !== 'object') return;
  if (!(userId in overrides)) return;
  const { [userId]: _omit, ...rest } = overrides;
  writeOverrides(rest);
};

const equalsIgnoreCase = (a, b) => String(a ?? '').toUpperCase() === String(b ?? '').toUpperCase();
const isExpired = (entry) => {
  const ts = entry?._ts;
  if (!ts) return false;
  return Date.now() - Number(ts) > OVERRIDES_TTL_MS;
};

const applyOverrides = (users) => {
  const list = Array.isArray(users) ? users : [];
  const overrides = readOverrides();
  const nextOverrides = { ...overrides };

  for (const [id, entry] of Object.entries(nextOverrides)) {
    if (!entry || typeof entry !== 'object' || isExpired(entry)) delete nextOverrides[id];
  }

  const merged = list.map((u) => {
    const id = String(u?.id ?? '').trim();
    const entry = id ? nextOverrides[id] : null;
    if (!entry) return u;

    const backendMatches =
      (entry.name === undefined || String(u?.name ?? '') === String(entry.name)) &&
      (entry.email === undefined || String(u?.email ?? '') === String(entry.email)) &&
      (entry.role === undefined || equalsIgnoreCase(u?.role, entry.role)) &&
      (entry.status === undefined || equalsIgnoreCase(u?.status, entry.status));

    if (backendMatches) {
      delete nextOverrides[id];
      return u;
    }

    const { _ts, ...patch } = entry;
    return { ...u, ...patch };
  });

  // Keep visible if backend omitted this user.
  for (const [id, entry] of Object.entries(nextOverrides)) {
    const exists = merged.some((u) => String(u?.id ?? '') === id);
    if (exists) continue;
    const { _ts, ...patch } = entry || {};
    merged.unshift({ id, name: '', email: '', role: '', status: 'Active', ...patch });
  }

  writeOverrides(nextOverrides);
  return merged;
};

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [assigningRoleId, setAssigningRoleId] = useState(null);

  const refresh = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await adminApi.getAllUsers();

      if (data === null || data === undefined || data === '') {
        setUsersLoading(false);
        return { success: true, noContent: true };
      }

      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const normalized = list.map(normalizeUser).filter((x) => x.id);
      setUsers(applyOverrides(normalized));
      setUsersLoading(false);
      return { success: true };
    } catch (err) {
      const status = err?.response?.status;
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        (status === 403 || status === 401
          ? 'Bạn không có quyền truy cập danh sách user.'
          : 'Không thể tải danh sách user.');
      setUsersError(errMsg);
      setUsersLoading(false);
      return { success: false, error: errMsg };
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) refresh();
    });
    return () => {
      active = false;
    };
  }, [refresh]);

  const createUser = async (formData) => {
    setCreating(true);
    try {
      const normalizedRole = String(formData?.role || '').toUpperCase().replace(/^ROLE_/, '');
      const roleId = roleToId[normalizedRole];

      const normalizedUsername = String(formData?.username || formData?.email || '').trim();
      const normalizedEmail = String(formData?.email || '').trim();
      const normalizedFullName = String(formData?.name || '').trim();

      const expertiseRaw = String(formData?.expertise ?? '').trim().toLowerCase();
      const expertise =
        expertiseRaw === 'mixed'
          ? 'mixed'
          : ['', 'basic', 'null', 'undefined'].includes(expertiseRaw)
            ? null
            : formData?.expertise;

      const payload = {
        username: normalizedUsername,
        password: formData?.password,
        fullName: normalizedFullName,
        email: normalizedEmail,
        expertise,
        role: roleId,
        redirectUrl: buildFirstLoginRedirectUrl(),
      };

      const response = await adminApi.createUser(payload);
      setCreating(false);
      return { success: true, data: response };
    } catch (err) {
      const errMsg = buildErrorMessage(err);
      setCreating(false);
      return { success: false, error: errMsg, details: err?.response?.data, status: err?.response?.status };
    }
  };

  const deleteUser = async (id) => {
    setDeletingId(id);
    try {
      const response = await adminApi.deleteUser(id);
      deleteOverride(id);
      setDeletingId(null);
      return { success: true, data: response };
    } catch (err) {
      const errMsg = buildErrorMessage(err);
      setDeletingId(null);
      return { success: false, error: errMsg, status: err?.response?.status, details: err?.response?.data };
    }
  };

  const resetPassword = async (id, passwordOrPayload) => {
    setResettingId(id);
    try {
      const password =
        typeof passwordOrPayload === 'string'
          ? passwordOrPayload
          : passwordOrPayload?.newPassword ?? passwordOrPayload?.password ?? '';

      if (String(password).trim() === '') {
        throw new Error('Password cannot be empty.');
      }

      const response = await adminApi.resetPassword(id, { newPassword: String(password) });
      setResettingId(null);
      return { success: true, data: response };
    } catch (err) {
      const errMsg = err?.message === 'Password cannot be empty.' ? err.message : buildErrorMessage(err);
      setResettingId(null);
      return { success: false, error: errMsg, status: err?.response?.status, details: err?.response?.data };
    }
  };

  const toggleStatus = async (id, nextStatusHint) => {
    setTogglingId(id);
    try {
      const response = await adminApi.toggleStatus(id);

      const raw = response?.data ?? response;
      const isActive = raw?.isActive ?? raw?.data?.isActive ?? null;
      const statusFromBackend =
        typeof isActive === 'boolean'
          ? isActive
            ? 'Active'
            : 'Inactive'
          : null;

      const hintedPatch =
        nextStatusHint && typeof nextStatusHint === 'object' ? nextStatusHint : null;
      const hintedStatusRaw =
        typeof nextStatusHint === 'string'
          ? nextStatusHint
          : hintedPatch?.status ?? null;
      const hintedStatus = hintedStatusRaw ? String(hintedStatusRaw) : null;

      const status = statusFromBackend || hintedStatus;
      if (status || hintedPatch) {
        saveOverride(id, {
          ...(hintedPatch?.name ? { name: String(hintedPatch.name) } : {}),
          ...(hintedPatch?.email ? { email: String(hintedPatch.email) } : {}),
          ...(hintedPatch?.role ? { role: coerceRoleName(hintedPatch.role) } : {}),
          ...(status ? { status } : {}),
        });
      }

      setTogglingId(null);
      return { success: true, data: response, status };
    } catch (err) {
      const errMsg = buildErrorMessage(err);
      setTogglingId(null);
      return { success: false, error: errMsg, status: err?.response?.status, details: err?.response?.data };
    }
  };

  const updateUser = async (id, formData) => {
    setUpdatingId(id);
    try {
      const fullName = String(formData?.name ?? formData?.fullName ?? '').trim();
      const email = String(formData?.email ?? '').trim();

      const payload = { fullName, email };
      const response = await adminApi.updateUser(id, payload);

      saveOverride(id, {
        ...(fullName ? { name: fullName } : {}),
        ...(email ? { email } : {}),
      });

      setUpdatingId(null);
      return { success: true, data: response };
    } catch (err) {
      const errMsg = buildErrorMessage(err);
      setUpdatingId(null);
      return { success: false, error: errMsg, status: err?.response?.status, details: err?.response?.data };
    }
  };

  const assignRole = async (id, nextRole) => {
    setAssigningRoleId(id);

    const normalizedRole = String(nextRole || '').toUpperCase().replace(/^ROLE_/, '');
    const roleInt = coerceRoleInt(normalizedRole);

    if (!id) {
      const errMsg = 'Thiếu user id.';
      setAssigningRoleId(null);
      return { success: false, error: errMsg };
    }
    if (roleInt === null) {
      const errMsg = `Role không hợp lệ: ${String(nextRole)}`;
      setAssigningRoleId(null);
      return { success: false, error: errMsg };
    }

    try {
      const response = await adminApi.assignRole(id, { roleId: roleInt });
      saveOverride(id, { role: normalizedRole });
      setAssigningRoleId(null);
      return { success: true, data: response, role: normalizedRole };
    } catch (err) {
      const errMsg = buildErrorMessage(err);
      setAssigningRoleId(null);
      return { success: false, error: errMsg, status: err?.response?.status, details: err?.response?.data };
    }
  };

  return {
    users,
    setUsers,
    usersLoading,
    usersError,
    refresh,
    createUser,
    creating,
    deleteUser,
    deletingId,
    resetPassword,
    resettingId,
    toggleStatus,
    togglingId,
    updateUser,
    updatingId,
    assignRole,
    assigningRoleId,
  };
};
